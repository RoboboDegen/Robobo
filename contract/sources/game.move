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
    use sui::token::{Self, Token, TokenPolicy};

    // Error codes
    const E_ALREADY_INITIALIZED: u64 = 0;
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_HAS_PASSPORT: u64 = 2;
    const E_NO_PASSPORT: u64 = 3;
    const E_ALREADY_CLAIMED_TODAY: u64 = 4;

    /// 定义游戏中的 TRASH token 数值
    const TRASH_AMOUNT_MINT_ROBOT: u64 = 10;
    const TRASH_AMOUNT_DAILY_CLAIM: u64 = 100;
    // 可以添加更多的数值...
    // const TRASH_AMOUNT_UPGRADE_ROBOT: u64 = 200;

    /// GameState stores the global state of the game
    public struct GameState has key,store {
        id: UID,
        // 记录所有用户的 passport
        passports: Table<address, ID>,
        // 其他全局状态...
    }

    /// One-Time-Witness for the module
    public struct GAME has drop {}

    // ======== 初始化函数 ========

    fun init(otw: GAME, ctx: &mut TxContext) {
        let game_state = GameState {
            id: object::new(ctx),
            passports: table::new(ctx),
        };
        let robot_pool = robot::create_robot_pool(ctx);
        // Share the GameState object
        transfer::public_share_object(game_state);
        transfer::public_share_object(robot_pool);
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
        game_state: &GameState,
        robot_pool: &mut Robot_Pool,
        passport: &mut Passport,
        robot_name: String,
        mut payment: Token<TRASH>,
        token_policy: &mut TokenPolicy<TRASH>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        // 验证 passport 确实属于该用户
        assert!(table::contains(&game_state.passports, sender), E_NO_PASSPORT);
        
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