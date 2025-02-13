module robobo::game {
    use sui::{
        table::{Self, Table},
        token::{Self, Token, TokenPolicy},
        clock::{ Clock },
        random::{ Random }
    };
    use std::string::String;
    use robobo::user::{Self, Passport};
    use robobo::trash::{Self, TrashTokenCap, TRASH};
    use robobo::robot::{Self, Robot, Robot_Pool};
    use robobo::element::{Self, Element};
    use robobo::config::{Self, GameConfig};
    use robobo::battle::{Self};

    // Error codes
    const E_ALREADY_HAS_PASSPORT: u64 = 0;
    const E_NO_PASSPORT: u64 = 1;
    const E_ALREADY_CLAIMED_TODAY: u64 = 2;


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
        // 记录总对局数
        total_battles: u64,
        // 记录机器人胜场数（排行榜）
        rankings: Table<ID, u64>
    }

    /// One-Time-Witness for the module
    public struct GAME has drop {}

    /// 战斗奖励事件
    public struct BattleRewardEvent has copy, drop {
        winner_id: ID,
        loser_id: ID,
        token_reward: u64,
        has_element_drop: bool,
        timestamp: u64
    }

    // ======== 初始化函数 ========

    fun init(_: GAME, ctx: &mut TxContext) {
        // 创建管理员权限凭证
        let admin_cap = AdminCap {id: object::new(ctx)};

        let game_state = GameState {
            id: object::new(ctx),
            passports: table::new(ctx),
            robots: vector::empty(),
            elements: table::new(ctx),
            total_battles: 0,
            rankings: table::new(ctx)
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
        game_config: &GameConfig,
        robot_pool: &mut Robot_Pool,
        token_cap: &mut TrashTokenCap,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        // 确保用户还没有 passport
        assert!(
            !table::contains(&game_state.passports, sender),
            E_ALREADY_HAS_PASSPORT
        );

        // 创建新的 passport 并获取其 ID
        let passport = user::mint(name, ctx);
        let passport_id = user::get_passport_id(&passport);

        // 记录用户的 passport
        table::add(
            &mut game_state.passports,
            sender,
            passport_id
        );

        // 铸造 TRASH token 给用户
        trash::mint(
            token_cap,
            config::get_trash_amount_daily_claim(game_config),
            ctx
        );
        // 创建机器人
        mint_robot_without_payment(game_state, game_config, robot_pool, name, ctx);
        // 转移 passport 给用户
        user::transfer_passport(passport, sender);
    }

    fun mint_robot_without_payment(
        game_state: &mut GameState,
        game_config: &GameConfig,
        robot_pool: &mut Robot_Pool,
        robot_name: String,
        ctx: &mut TxContext
    ) { 
        let sender = tx_context::sender(ctx);
        assert!(
            table::contains(&game_state.passports, sender),
            E_NO_PASSPORT
        );
        
        // 创建初始机器人并获取其 ID
        let robot = robot::create_robot(robot_name, robot_pool, ctx);
        let robot_id = robot::get_robot_id(&robot);

        // 记录机器人
        vector::push_back(&mut game_state.robots, robot_id);
        // 转移机器人给用户
        transfer::public_transfer(robot, sender);
    }

    /// 用户创建机器人,需要收取TRASH
    public entry fun mint_robot(
        game_state: &mut GameState,
        game_config: &GameConfig,
        robot_pool: &mut Robot_Pool,
        robot_name: String,
        mut payment: Token<TRASH>,
        token_policy: &mut TokenPolicy<TRASH>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(
            table::contains(&game_state.passports, sender),
            E_NO_PASSPORT
        );

        let mint_cost = config::get_trash_amount_mint_robot(game_config);
        // 分割出正确数量的token作为支付，剩余的返还给用户
        let payment_value = token::value(&payment);
        if (payment_value > mint_cost) {
            let remaining = token::split(
                &mut payment,
                payment_value - mint_cost,
                ctx
            );
            token::keep(remaining, ctx);
        };

        // 支付 TRASH token
        trash::spend(payment, token_policy, mint_cost, ctx);

        // 创建初始机器人并获取其 ID
        let robot = robot::create_robot(robot_name, robot_pool, ctx);
        let robot_id = robot::get_robot_id(&robot);

        // 记录机器人
        vector::push_back(&mut game_state.robots, robot_id);

        // 转移机器人给用户
        transfer::public_transfer(robot, sender);
    }

    /// 每日领取 TRASH token
    public entry fun claim_daily_token(
        game_config: &GameConfig,
        passport: &mut Passport,
        token_cap: &mut TrashTokenCap,
        ctx: &mut TxContext
    ) {
        assert!(
            user::can_claim_daily_token(passport, ctx),
            E_ALREADY_CLAIMED_TODAY
        );
        // 更新最后领取时间
        user::update_last_mint_token_time(passport, ctx);
        // 铸造 TRASH token 给用户
        trash::mint(
            token_cap,
            config::get_trash_amount_daily_claim(game_config),
            ctx
        );
    }

    /// 随机战斗入口函数
    entry fun random_battle(
        game_state: &mut GameState,
        game_config: &GameConfig,
        robot_pool: &Robot_Pool,
        robot: &mut Robot,
        payment: Token<TRASH>,
        token_policy: &mut TokenPolicy<TRASH>,
        token_cap: &mut TrashTokenCap,
        random: &Random,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // 1. 先进行所有必要的检查和支付，确保在随机性生成前完成
        let robot_id = robot::get_robot_id(robot);
        let sender = tx_context::sender(ctx);
        assert!(
            table::contains(&game_state.passports, sender),
            E_NO_PASSPORT
        );

        // 消耗战斗费用（提前支付）
        trash::spend(
            payment,
            token_policy,
            config::get_trash_amount_battle(game_config),
            ctx
        );

        // 2. 生成随机对手
        let opponent_id = battle::select_random_opponent(
            &game_state.robots,
            robot_id,
            random,
            ctx
        );

        // 3. 进行战斗
        let battle_result = battle::start_battle(robot, opponent_id, clock, robot_pool);

        // 4. 更新游戏状态（无论胜负都要执行，保证gas消耗一致）
        game_state.total_battles = game_state.total_battles + 1;

        // 5. 更新排行榜（无论胜负都要执行）
        if (!table::contains(&game_state.rankings, robot_id)) {
            table::add(
                &mut game_state.rankings,
                robot_id,
                0
            );
        };
        if (!table::contains(&game_state.rankings, opponent_id)) {
            table::add(
                &mut game_state.rankings,
                opponent_id,
                0
            );
        };

        // 6. 更新胜负记录
        if (battle::is_winner(&battle_result)) {
            robot::increment_win_count(robot);
            let wins = table::borrow_mut(&mut game_state.rankings, robot_id);
            *wins = *wins + 1;
        } else {
            robot::increment_lose_count(robot);
            let wins = table::borrow_mut(
                &mut game_state.rankings,
                opponent_id
            );
            *wins = *wins + 1;
        };

        // 7. 处理奖励（胜利和失败的计算量应该相近）
        battle::process_battle_rewards(
            robot,
            battle_result,
            token_cap,
            random,
            clock,
            game_config,
            ctx
        );
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
        let equip_cost = config::get_trash_amount_equip_element(game_config);

        // 处理支付
        let payment_value = token::value(&payment);
        if (payment_value > equip_cost) {
            let remaining = token::split(
                &mut payment,
                payment_value - equip_cost,
                ctx
            );
            token::keep(remaining, ctx);
        };

        // 支付 TRASH token
        trash::spend(
            payment,
            token_policy,
            equip_cost,
            ctx
        );

        // 装备零件
        robot::equip_element(
            robot,
            element,
            robot_pool,
            game_config
        );

        // 更新机器人的零件列表
        if (!table::contains(&game_state.elements, robot_id)) {
            table::add(
                &mut game_state.elements,
                robot_id,
                vector::empty()
            );
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
        if (payment_value > config::get_trash_amount_equip_element(game_config)) {
            let remaining = token::split(
                &mut payment,
                payment_value - config::get_trash_amount_equip_element(game_config),
                ctx
            );
            token::keep(remaining, ctx);
        };

        // 支付 TRASH token
        trash::spend(
            payment,
            token_policy,
            TRASH_AMOUNT_EQUIP_ELEMENT,
            ctx
        );

        let element_id = element::get_element_id(&new_element);

        // 装备新零件
        robot::equip_element(
            robot,
            new_element,
            robot_pool,
            game_config
        );

        // 更新机器人的零件列表
        if (!table::contains(&game_state.elements, robot_id)) {
            table::add(
                &mut game_state.elements,
                robot_id,
                vector::empty()
            );
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

    /// 设置创建机器人所需的 TRASH token 数量
    public entry fun set_trash_amount_mint_robot(
        _: &AdminCap,
        game_config: &mut GameConfig,
        amount: u64,
    ) {
        config::set_trash_amount_mint_robot(game_config, amount);
    }

    /// 设置每日可领取的 TRASH token 数量
    public entry fun set_trash_amount_daily_claim(
        _: &AdminCap,
        game_config: &mut GameConfig,
        amount: u64,
    ) {
        config::set_trash_amount_daily_claim(game_config, amount);
    }

    /// 设置装备零件所需的 TRASH token 数量
    public entry fun set_trash_amount_equip_element(
        _: &AdminCap,
        game_config: &mut GameConfig,
        amount: u64,
    ) {
        config::set_trash_amount_equip_element(game_config, amount);
    }

    /// 设置战斗所需的 TRASH token 数量
    public entry fun set_trash_amount_battle(
        _: &AdminCap,
        game_config: &mut GameConfig,
        amount: u64,
    ) {
        config::set_trash_amount_battle(game_config, amount);
    }

    /// 设置战斗胜利奖励的 TRASH token 数量
    public entry fun set_trash_amount_battle_reward(
        _: &AdminCap,
        game_config: &mut GameConfig,
        amount: u64,
    ) {
        config::set_trash_amount_battle_reward(game_config, amount);
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
        let element = element::create_element(name, description, abilities, ctx);
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

    // 添加排行榜查询函数
    public fun get_robot_wins(game_state: &GameState, robot_id: ID): u64 {
        if (table::contains(&game_state.rankings, robot_id)) {
            *table::borrow(&game_state.rankings, robot_id)
        } else { 0 }
    }

    public fun get_total_battles(game_state: &GameState): u64 {
        game_state.total_battles
    }
}
