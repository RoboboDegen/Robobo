#[test_only]
module robobo::game_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::tx_context;
    use sui::test_utils::assert_eq;
    use std::string;
    use sui::table;
    
    use robobo::game::{Self, GameState};
    use robobo::user::{Self, Passport};
    use robobo::robot::{Self, Robot, Robot_Pool};
    use robobo::trash::{Self, TRASH, TrashTokenCap};
    use sui::token::{Self, Token, TokenPolicy};

    // Test constants
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;

    // Game constants
    const TRASH_AMOUNT_DAILY_CLAIM: u64 = 100;

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
            assert!(ts::has_most_recent_shared<TokenPolicy<TRASH>>(), 1);
            assert!(ts::has_most_recent_shared<TrashTokenCap>(), 1);
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
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            
            game::create_passport(
                string::utf8(b"User One"),
                &mut game_state,
                &mut token_cap,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(game_state);
            ts::return_shared(token_cap);
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

        // 验证用户创建护照后，游戏状态中的 passport 数量增加
        ts::next_tx(&mut scenario, ADMIN);
        {
            let game_state = ts::take_shared<GameState>(&scenario);
            assert!(game::has_passport(&game_state, USER1), 0);
            ts::return_shared(game_state);
        };

        // 验证用户创建护照后,账户的token数量
        ts::next_tx(&mut scenario, USER1);
        {
            let passport = ts::take_from_sender<Passport>(&scenario);
            // 验证用户的token数量
            let token = ts::take_from_sender<Token<TRASH>>(&scenario);
            assert!(token::value(&token) == 100, 0);
            ts::return_to_sender(&scenario, token);
            ts::return_to_sender(&scenario, passport);
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
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            
            game::create_passport(
                string::utf8(b"User One"),
                &mut game_state,
                &mut token_cap,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(game_state);
            ts::return_shared(token_cap);
        };

        // 尝试重复创建护照（应该失败）
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            
            game::create_passport(
                string::utf8(b"User One Again"),
                &mut game_state,
                &mut token_cap,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(game_state);
            ts::return_shared(token_cap);
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
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            
            game::create_passport(
                string::utf8(b"User One"),
                &mut game_state,
                &mut token_cap,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(game_state);
            ts::return_shared(token_cap);
        };

        // 验证用户创建护照后,账户的token数量
        ts::next_tx(&mut scenario, USER1);
        {
            let passport = ts::take_from_sender<Passport>(&scenario);
            // 验证用户的token数量
            let token = ts::take_from_sender<Token<TRASH>>(&scenario);
            assert!(token::value(&token) == 100, 0);
            ts::return_to_sender(&scenario, token);
            ts::return_to_sender(&scenario, passport);
        };

        // 创建初始机器人
        ts::next_tx(&mut scenario, USER1);
        {
            let game_state = ts::take_shared<GameState>(&scenario);
            let mut robot_pool = ts::take_shared<Robot_Pool>(&scenario);
            let mut passport = ts::take_from_sender<Passport>(&scenario);
            let mut token_policy = ts::take_shared<TokenPolicy<TRASH>>(&scenario);
            let token_cap = ts::take_shared<TrashTokenCap>(&scenario);

            // 先获取一些 TRASH token
            let mut token = ts::take_from_sender<Token<TRASH>>(&scenario);
            // 分割出正确数量的token作为支付
            let payment = token::split(&mut token, 10, ts::ctx(&mut scenario));
            // 把剩余的token还给用户
            ts::return_to_sender(&scenario, token);

            game::mint_robot(
                &game_state,
                &mut robot_pool,
                &mut passport,
                string::utf8(b"First Robot"),
                payment,
                &mut token_policy,
                ts::ctx(&mut scenario)
            );

            ts::return_to_sender(&scenario, passport);
            ts::return_shared(game_state);
            ts::return_shared(robot_pool);
            ts::return_shared(token_policy);
            ts::return_shared(token_cap);
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
        
        // 先铸造token
        ts::next_tx(&mut scenario, USER1);
        {
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            trash::mint(&mut token_cap, 10, ts::ctx(&mut scenario));
            ts::return_shared(token_cap);
        };
        
        // 尝试在没有护照的情况下创建机器人（应该失败）
        ts::next_tx(&mut scenario, USER1);
        {
            let game_state = ts::take_shared<GameState>(&scenario);
            let mut robot_pool = ts::take_shared<Robot_Pool>(&scenario);
            let mut token_policy = ts::take_shared<TokenPolicy<TRASH>>(&scenario);
            
            // 创建一个临时护照
            let mut passport = user::mint(
                string::utf8(b"Temp User"),
                ts::ctx(&mut scenario)
            );
            
            // 获取之前铸造的token
            let payment = ts::take_from_sender<Token<TRASH>>(&scenario);

            // 这里会失败，因为用户没有在 game_state 中注册护照
            game::mint_robot(
                &game_state,
                &mut robot_pool,
                &mut passport,
                string::utf8(b"First Robot"),
                payment,
                &mut token_policy,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(game_state);
            ts::return_shared(robot_pool);
            ts::return_shared(token_policy);
            user::transfer_passport(passport, USER1);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_claim_daily_token() {
        let mut scenario = ts::begin(ADMIN);
        
        init_game(&mut scenario);
        
        // 创建护照
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            
            game::create_passport(
                string::utf8(b"User One"),
                &mut game_state,
                &mut token_cap,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(game_state);
            ts::return_shared(token_cap);
        };

        // 验证用户创建护照后的初始token数量
        ts::next_tx(&mut scenario, USER1);
        {
            let passport = ts::take_from_sender<Passport>(&scenario);
            let token = ts::take_from_sender<Token<TRASH>>(&scenario);
            assert!(token::value(&token) == TRASH_AMOUNT_DAILY_CLAIM, 0);
            ts::return_to_sender(&scenario, token);
            ts::return_to_sender(&scenario, passport);
        };

        // 等待一天
        ts::next_tx(&mut scenario, USER1);
        {
            tx_context::increment_epoch_timestamp(ts::ctx(&mut scenario), 1000 * 60 * 60 * 24);
        };

        // 领取每日token
        ts::next_tx(&mut scenario, USER1);
        {
            let mut passport = ts::take_from_sender<Passport>(&scenario);
            let game_state = ts::take_shared<GameState>(&scenario);
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            
            game::claim_daily_token(
                &game_state,
                &mut passport,
                &mut token_cap,
                ts::ctx(&mut scenario)
            );

            ts::return_to_sender(&scenario, passport);
            ts::return_shared(game_state);
            ts::return_shared(token_cap);
        };

        // 验证领取后的token数量
        ts::next_tx(&mut scenario, USER1);
        {
            let passport = ts::take_from_sender<Passport>(&scenario);
            let mut token1 = ts::take_from_sender<Token<TRASH>>(&scenario);
            let token2 = ts::take_from_sender<Token<TRASH>>(&scenario);
            
            // 合并两个token
            token::join(&mut token1, token2);
            assert!(token::value(&token1) == TRASH_AMOUNT_DAILY_CLAIM * 2, 0);
            
            ts::return_to_sender(&scenario, token1);
            ts::return_to_sender(&scenario, passport);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = robobo::game::E_ALREADY_CLAIMED_TODAY)]
    fun test_claim_daily_token_twice() {
        let mut scenario = ts::begin(ADMIN);
        
        init_game(&mut scenario);
        
        // 创建护照
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            
            game::create_passport(
                string::utf8(b"User One"),
                &mut game_state,
                &mut token_cap,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(game_state);
            ts::return_shared(token_cap);
        };

        // 等待一天
        ts::next_tx(&mut scenario, USER1);
        {
            tx_context::increment_epoch_timestamp(ts::ctx(&mut scenario), 1000 * 60 * 60 * 24);
        };

        // 第一次领取每日token
        ts::next_tx(&mut scenario, USER1);
        {
            let mut passport = ts::take_from_sender<Passport>(&scenario);
            let game_state = ts::take_shared<GameState>(&scenario);
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            
            game::claim_daily_token(
                &game_state,
                &mut passport,
                &mut token_cap,
                ts::ctx(&mut scenario)
            );

            ts::return_to_sender(&scenario, passport);
            ts::return_shared(game_state);
            ts::return_shared(token_cap);
        };

        // 尝试第二次领取（应该失败）
        ts::next_tx(&mut scenario, USER1);
        {
            let mut passport = ts::take_from_sender<Passport>(&scenario);
            let game_state = ts::take_shared<GameState>(&scenario);
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            
            game::claim_daily_token(
                &game_state,
                &mut passport,
                &mut token_cap,
                ts::ctx(&mut scenario)
            );

            ts::return_to_sender(&scenario, passport);
            ts::return_shared(game_state);
            ts::return_shared(token_cap);
        };

        ts::end(scenario);
    }
}
