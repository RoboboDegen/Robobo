module robobo::game {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::clock::Clock;
    use sui::table::{Self, Table};
    use std::string::String;
    use robobo::user::{Self, Passport};
    use robobo::trash::{Self, TrashTokenCap};
    use robobo::robot::{Self, Robot, Robot_Pool};

    // Error codes
    const E_ALREADY_INITIALIZED: u64 = 0;
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_HAS_PASSPORT: u64 = 2;
    const E_NO_PASSPORT: u64 = 3;

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
        game_state: &mut GameState,
        name: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        // 确保用户还没有 passport
        assert!(!table::contains(&game_state.passports, sender), E_ALREADY_HAS_PASSPORT);
        
        // 创建新的 passport 并获取其 ID
        let passport = user::mint(name, clock, ctx);
        let passport_id = user::get_passport_id(&passport);
        
        // 记录用户的 passport
        table::add(&mut game_state.passports, sender, passport_id);
        
        // 转移 passport 给用户
        user::transfer_passport(passport, sender);
    }

    /// 为新用户创建初始机器人,第一次是免费的
    public entry fun create_initial_robot(
        game_state: &GameState,
        robot_pool: &mut Robot_Pool,
        passport: &mut Passport,
        robot_name: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        // 验证 passport 确实属于该用户
        assert!(table::contains(&game_state.passports, sender), E_NO_PASSPORT);
        
        // 创建初始机器人并获取其 ID
        let robot = robot::create_robot(robot_name, robot_pool, ctx);
        let robot_id = robot::get_robot_id(&robot);        
        // 添加机器人到 passport
        user::add_robot(passport, robot_id);
        
        // 转移机器人给用户
        transfer::public_transfer(robot, sender);
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