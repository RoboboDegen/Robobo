#[test_only]
module robobo::game_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock;
    use sui::test_utils::assert_eq;
    use std::string;
    
    use robobo::game::{Self, GameState};
    use robobo::user::{Self, Passport};
    use robobo::robot::{Self, Robot, Robot_Pool};
    use robobo::trash::{Self, TRASH, TrashTokenCap};

    // Test constants
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;

    fun init_game(scenario: &mut Scenario) {
        // 初始化游戏状态
        ts::next_tx(scenario, ADMIN);
        {
            game::init_for_testing(ts::ctx(scenario));
        };

        // 初始化代币系统
        ts::next_tx(scenario, ADMIN);
        {
            trash::init_for_testing(ts::ctx(scenario));
        };
    }

    #[test]
    fun test_game_initialization() {
        let mut scenario = ts::begin(ADMIN);
        
        // 初始化游戏
        init_game(&mut scenario);
        
        // 验证游戏状态已创建
        ts::next_tx(&mut scenario, ADMIN);
        {
            assert!(ts::has_most_recent_shared<GameState>(), 0);
            assert!(ts::has_most_recent_shared<Robot_Pool>(), 1);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_create_passport() {
        let mut scenario = ts::begin(ADMIN);
        
        // 初始化游戏
        init_game(&mut scenario);
        
        // 创建用户护照
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            game::create_passport(
                &mut game_state,
                string::utf8(b"User One"),
                &clock,
                ts::ctx(&mut scenario)
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(game_state);
        };

        // 验证护照创建成功
        ts::next_tx(&mut scenario, USER1);
        {
            let game_state = ts::take_shared<GameState>(&scenario);
            assert!(game::has_passport(&game_state, USER1), 0);
            ts::return_shared(game_state);

            // 验证用户确实拥有护照对象
            assert!(ts::has_most_recent_for_address<Passport>(USER1), 1);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = robobo::game::E_ALREADY_HAS_PASSPORT)]
    fun test_create_duplicate_passport() {
        let mut scenario = ts::begin(ADMIN);
        
        init_game(&mut scenario);
        
        // 第一次创建护照
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            game::create_passport(
                &mut game_state,
                string::utf8(b"User One"),
                &clock,
                ts::ctx(&mut scenario)
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(game_state);
        };

        // 尝试重复创建护照（应该失败）
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            game::create_passport(
                &mut game_state,
                string::utf8(b"User One Again"),
                &clock,
                ts::ctx(&mut scenario)
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(game_state);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_create_initial_robot() {
        let mut scenario = ts::begin(ADMIN);
        
        init_game(&mut scenario);
        
        // 创建护照
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            game::create_passport(
                &mut game_state,
                string::utf8(b"User One"),
                &clock,
                ts::ctx(&mut scenario)
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(game_state);
        };

        // 创建初始机器人
        ts::next_tx(&mut scenario, USER1);
        {
            let game_state = ts::take_shared<GameState>(&scenario);
            let mut robot_pool = ts::take_shared<Robot_Pool>(&scenario);
            let mut passport = ts::take_from_sender<Passport>(&scenario);

            game::create_initial_robot(
                &game_state,
                &mut robot_pool,
                &mut passport,
                string::utf8(b"First Robot"),
                ts::ctx(&mut scenario)
            );

            ts::return_to_sender(&scenario, passport);
            ts::return_shared(game_state);
            ts::return_shared(robot_pool);
        };

        // 验证机器人创建成功
        ts::next_tx(&mut scenario, USER1);
        {
            let passport = ts::take_from_sender<Passport>(&scenario);
            assert!(user::get_total_robots(&passport) == 1, 0);
            ts::return_to_sender(&scenario, passport);

            // 验证用户确实拥有机器人对象
            assert!(ts::has_most_recent_for_address<Robot>(USER1), 1);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = robobo::game::E_NO_PASSPORT)]
    fun test_create_robot_without_passport() {
        let mut scenario = ts::begin(ADMIN);
        
        init_game(&mut scenario);
        
        // 尝试在没有护照的情况下创建机器人（应该失败）
        ts::next_tx(&mut scenario, USER1);
        {
            let game_state = ts::take_shared<GameState>(&scenario);
            let mut robot_pool = ts::take_shared<Robot_Pool>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            // 先创建一个临时护照
            let mut passport = user::mint(
                string::utf8(b"Temp User"),
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // 这里会失败，因为用户没有在 game_state 中注册护照
            game::create_initial_robot(
                &game_state,
                &mut robot_pool,
                &mut passport,
                string::utf8(b"First Robot"),
                ts::ctx(&mut scenario)
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(game_state);
            ts::return_shared(robot_pool);
            user::transfer_passport(passport, USER1);
        };

        ts::end(scenario);
    }
}
