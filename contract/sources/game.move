module robobo::game {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use std::string::String;
    use robobo::user::{Self, Passport};
    use robobo::trash::{Self, TrashTokenCap, TRASH};
    use robobo::robot::{Self, Robot, Robot_Pool};
    use robobo::element::{Self, Element};
    use robobo::config::{Self, GameConfig};
    use sui::token::{Self, Token, TokenPolicy};

    // Error codes
    const E_ALREADY_HAS_PASSPORT: u64 = 0;
    const E_NO_PASSPORT: u64 = 1;
    const E_ALREADY_CLAIMED_TODAY: u64 = 2;

    /// 定义游戏中的 TRASH token 数值
    const TRASH_AMOUNT_MINT_ROBOT: u64 = 10;
    const TRASH_AMOUNT_DAILY_CLAIM: u64 = 100;
    // 可以添加更多的数值...
    // const TRASH_AMOUNT_UPGRADE_ROBOT: u64 = 200;

    /// 添加新的常量
    const TRASH_AMOUNT_EQUIP_ELEMENT: u64 = 5;

    /// 游戏管理员权限凭证
    public struct AdminCap has key, store {
        id: UID
    }

    /// GameState stores the global state of the game
    public struct GameState has key, store {
        id: UID,
        // 记录所有用户的 passport
        passports: Table<address, ID>,
        // 记录所有机器人
        robots: vector<ID>,
        // 记录所有的零件
        elements: Table<ID, vector<ID>>,
    }

    /// One-Time-Witness for the module
    public struct GAME has drop {}

    // ======== 初始化函数 ========

    fun init(otw: GAME, ctx: &mut TxContext) {
        // 创建管理员权限凭证
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        
        let game_state = GameState {
            id: object::new(ctx),
            passports: table::new(ctx),
            robots: vector::empty(),
            elements: table::new(ctx),
        };

        let robot_pool = robot::create_robot_pool(ctx);
        let game_config = config::create_config(ctx);
        
        // 转移管理员权限给部署者
        transfer::transfer(admin_cap, tx_context::sender(ctx));
        // Share the GameState object
        transfer::public_share_object(game_state);
        transfer::public_share_object(robot_pool);
        transfer::public_share_object(game_config);
    }

    // ======== 测试函数 ========
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(GAME {}, ctx)
    }


    // ======== 入口函数 ========

    /// 创建新用户的 Passport
    public entry fun create_passport(
        name: String,
        game_state: &mut GameState,
        token_cap: &mut TrashTokenCap,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        // 确保用户还没有 passport
        assert!(!table::contains(&game_state.passports, sender), E_ALREADY_HAS_PASSPORT);
        
        // 创建新的 passport 并获取其 ID
        let passport = user::mint(name, ctx);
        let passport_id = user::get_passport_id(&passport);
        
        // 记录用户的 passport
        table::add(&mut game_state.passports, sender, passport_id);
        
        // 铸造 TRASH token 给用户
        trash::mint(token_cap, TRASH_AMOUNT_DAILY_CLAIM, ctx);

        // 转移 passport 给用户
        user::transfer_passport(passport, sender);
    }

    /// 用户创建初始机器人,需要收取TRASH
    public entry fun mint_robot(
        game_state: &mut GameState,
        robot_pool: &mut Robot_Pool,
        passport: &mut Passport,
        robot_name: String,
        mut payment: Token<TRASH>,
        token_policy: &mut TokenPolicy<TRASH>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        // 分割出正确数量的token作为支付，剩余的返还给用户
        let payment_value = token::value(&payment);
        if (payment_value > TRASH_AMOUNT_MINT_ROBOT) {
            let remaining = token::split(&mut payment, payment_value - TRASH_AMOUNT_MINT_ROBOT, ctx);
            token::keep(remaining, ctx);
        };
        
        // 支付 TRASH token
        trash::spend(payment, token_policy, TRASH_AMOUNT_MINT_ROBOT, ctx);
        
        // 创建初始机器人并获取其 ID
        let robot = robot::create_robot(robot_name, robot_pool, ctx);
        let robot_id = robot::get_robot_id(&robot);
        
        // 记录机器人所有者
        vector::push_back(&mut game_state.robots, robot_id);
        
        // 添加机器人到 passport
        user::add_robot(passport, robot_id);
        
        // 转移机器人给用户
        transfer::public_transfer(robot, sender);
    }

    /// 每日领取 TRASH token
    public entry fun claim_daily_token(
        game_state: &GameState,
        passport: &mut Passport,
        token_cap: &mut TrashTokenCap,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        // 验证 passport 确实属于该用户
        assert!(table::contains(&game_state.passports, sender), E_NO_PASSPORT);
        assert!(user::can_claim_daily_token(passport,ctx), E_ALREADY_CLAIMED_TODAY);
        // 更新最后领取时间
        user::update_last_mint_token_time(passport, ctx);
        // 铸造 TRASH token 给用户
        trash::mint(token_cap, TRASH_AMOUNT_DAILY_CLAIM, ctx);
    }

    // ======== 零件管理功能 ========

    /// 装备零件
    /// * `game_config` - 游戏配置
    /// * `robot_pool` - 机器人池
    /// * `robot` - 要装备零件的机器人
    /// * `element` - 要装备的零件
    /// * `payment` - 支付的 TRASH token
    public entry fun equip_element(
        game_state: &mut GameState,
        game_config: &GameConfig,
        robot_pool: &mut Robot_Pool,
        robot: &mut Robot,
        element: Element,
        mut payment: Token<TRASH>,
        token_policy: &mut TokenPolicy<TRASH>,
        ctx: &mut TxContext
    ) {
        let robot_id = robot::get_robot_id(robot);
        let element_id = element::get_element_id(&element);
        
        // 处理支付
        let payment_value = token::value(&payment);
        if (payment_value > TRASH_AMOUNT_EQUIP_ELEMENT) {
            let remaining = token::split(&mut payment, payment_value - TRASH_AMOUNT_EQUIP_ELEMENT, ctx);
            token::keep(remaining, ctx);
        };
        
        // 支付 TRASH token
        trash::spend(payment, token_policy, TRASH_AMOUNT_EQUIP_ELEMENT, ctx);
        
        // 装备零件
        robot::equip_element(robot, element, robot_pool, game_config);
        
        // 更新机器人的零件列表
        if (!table::contains(&game_state.elements, robot_id)) {
            table::add(&mut game_state.elements, robot_id, vector::empty());
        };
        let elements = table::borrow_mut(&mut game_state.elements, robot_id);
        vector::push_back(elements, element_id);
    }

    /// 从机器人上卸下零件（零件会被销毁）
    /// * `game_state` - 游戏状态
    /// * `robot_pool` - 机器人池
    /// * `robot` - 要卸下零件的机器人
    /// * `element_idx` - 要卸下的零件索引
    /// * `ctx` - 交易上下文
    public entry fun unequip_element(
        game_state: &mut GameState,
        robot_pool: &mut Robot_Pool,
        robot: &mut Robot,
        element_id: ID,
        ctx: &mut TxContext
    ) {
        let robot_id = robot::get_robot_id(robot);
        
        // 卸下零件
        let element = robot::unequip_element_by_id(robot, element_id, robot_pool);
        
        // 更新机器人的零件列表
        let elements = table::borrow_mut(&mut game_state.elements, robot_id);
        let (exists, index) = vector::index_of(elements, &element_id);
        if (exists) {
            vector::remove(elements, index);
        };
        
        // 销毁零件
        element::delete_element(element);
    }

    /// 替换零件（卸下旧零件并装备新零件）
    /// * `game_state` - 游戏状态
    /// * `game_config` - 游戏配置
    /// * `robot_pool` - 机器人池
    /// * `robot` - 要替换零件的机器人
    /// * `old_element_id` - 要替换的零件ID
    /// * `new_element` - 新的零件
    /// * `payment` - 支付的 TRASH token
    public entry fun replace_element(
        game_state: &mut GameState,
        game_config: &GameConfig,
        robot_pool: &mut Robot_Pool,
        robot: &mut Robot,
        old_element_id: ID,
        new_element: Element,
        mut payment: Token<TRASH>,
        token_policy: &mut TokenPolicy<TRASH>,
        ctx: &mut TxContext
    ) {
        let robot_id = robot::get_robot_id(robot);

        // 卸下旧零件
        let old_element = robot::unequip_element_by_id(robot, old_element_id, robot_pool);
        
        // 更新机器人的零件列表
        let elements = table::borrow_mut(&mut game_state.elements, robot_id);
        let (exists, index) = vector::index_of(elements, &old_element_id);
        if (exists) {
            vector::remove(elements, index);
        };
        
        // 销毁旧零件
        element::delete_element(old_element);

        // 处理支付
        let payment_value = token::value(&payment);
        if (payment_value > TRASH_AMOUNT_EQUIP_ELEMENT) {
            let remaining = token::split(&mut payment, payment_value - TRASH_AMOUNT_EQUIP_ELEMENT, ctx);
            token::keep(remaining, ctx);
        };
        
        // 支付 TRASH token
        trash::spend(payment, token_policy, TRASH_AMOUNT_EQUIP_ELEMENT, ctx);
        
        let element_id = element::get_element_id(&new_element);
        
        // 装备新零件
        robot::equip_element(robot, new_element, robot_pool, game_config);
        
        // 更新机器人的零件列表
        if (!table::contains(&game_state.elements, robot_id)) {
            table::add(&mut game_state.elements, robot_id, vector::empty());
        };
        let elements = table::borrow_mut(&mut game_state.elements, robot_id);
        vector::push_back(elements, element_id);
    }

    // ======== 管理员功能 ========

    /// 设置机器人可装备的最大零件数量
    public entry fun set_max_elements(
        _: &AdminCap,
        game_config: &mut GameConfig,
        new_max: u64,
    ) {
        config::set_max_elements(game_config, new_max);
    }

    /// 创建零件
    /// * `admin_cap` - 管理员权限凭证
    /// * `name` - 零件名称
    /// * `description` - 零件描述
    /// * `abilities` - 零件属性数组
    /// * `recipient` - 接收者地址
    /// * `ctx` - 交易上下文
    public entry fun create_element(
        _: &AdminCap,
        name: String,
        description: String,
        abilities: vector<u8>,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let element = element::create_element(
            name,
            description,
            abilities,
            ctx
        );
        // 将创建的零件转移给指定用户
        transfer::public_transfer(element, recipient);
    }

    /// 管理员创建并发送 TRASH token 给指定用户
    /// * `admin_cap` - 管理员权限凭证
    /// * `token_cap` - TRASH token 铸造权限
    /// * `amount` - 要创建的 token 数量
    /// * `recipient` - 接收者地址
    public entry fun admin_mint_and_transfer(
        _: &AdminCap,
        token_cap: &mut TrashTokenCap,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        // 铸造指定数量的 TRASH token
        trash::mint_and_transfer(token_cap, amount, recipient, ctx);
    }

    // ======== 视图函数 ========

    /// 检查用户是否已经有 passport
    public fun has_passport(game_state: &GameState, user: address): bool {
        table::contains(&game_state.passports, user)
    }

    /// 获取用户的 passport ID
    public fun get_passport_id(game_state: &GameState, user: address): ID {
        *table::borrow(&game_state.passports, user)
    }
}