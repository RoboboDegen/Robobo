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
    use robobo::element::{Self};
    use robobo::config::{Self, GameConfig};
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
            let mut game_state = ts::take_shared<GameState>(&scenario);
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
                &mut game_state,
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

// 辅助函数：创建一个攻击型零件的属性数组
    fun create_attack_abilities(): vector<u8> {
        let mut abilities = vector::empty();
        vector::push_back(&mut abilities, 138); // 攻击+10 (主属性)
        vector::push_back(&mut abilities, 118); // 防御-10
        vector::push_back(&mut abilities, 118); // 速度-10
        vector::push_back(&mut abilities, 118); // 能量-10
        vector::push_back(&mut abilities, 118); // 核心-10
        abilities
    }

    // 辅助函数：创建一个防御型零件的属性数组
    fun create_defense_abilities(): vector<u8> {
        let mut abilities = vector::empty();
        vector::push_back(&mut abilities, 118); // 攻击-10
        vector::push_back(&mut abilities, 138); // 防御+10 (主属性)
        vector::push_back(&mut abilities, 118); // 速度-10
        vector::push_back(&mut abilities, 118); // 能量-10
        vector::push_back(&mut abilities, 118); // 核心-10
        abilities
    }
    
    #[test]
    /// 测试装备零件功能
    fun test_equip_element() {
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

        // 创建初始机器人
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let mut robot_pool = ts::take_shared<Robot_Pool>(&scenario);
            let mut passport = ts::take_from_sender<Passport>(&scenario);
            let mut token_policy = ts::take_shared<TokenPolicy<TRASH>>(&scenario);
            let token_cap = ts::take_shared<TrashTokenCap>(&scenario);

            // 获取token并支付
            let mut token = ts::take_from_sender<Token<TRASH>>(&scenario);
            let payment = token::split(&mut token, 10, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, token);

            game::mint_robot(
                &mut game_state,
                &mut robot_pool,
                &mut passport,
                string::utf8(b"Test Robot"),
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

        // 装备零件
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let mut robot_pool = ts::take_shared<Robot_Pool>(&scenario);
            let game_config = ts::take_shared<GameConfig>(&scenario);
            let mut robot = ts::take_from_sender<Robot>(&scenario);
            let mut token_policy = ts::take_shared<TokenPolicy<TRASH>>(&scenario);
            
            // 记录初始属性
            let initial_attack = robot::get_robot_attack(&robot);
            let initial_defense = robot::get_robot_defense(&robot);
            
            // 创建一个攻击型零件
            let element = element::create_element(
                string::utf8(b"Attack Element"),
                string::utf8(b"Attack Element Description"),
                create_attack_abilities(),
                ts::ctx(&mut scenario)
            );

            // 获取token用于支付装备费用
            let mut token = ts::take_from_sender<Token<TRASH>>(&scenario);
            let payment = token::split(&mut token, 5, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, token);
            
            // 装备零件
            game::equip_element(
                &mut game_state,
                &game_config,
                &mut robot_pool,
                &mut robot,
                element,
                payment,
                &mut token_policy,
                ts::ctx(&mut scenario)
            );
            
            // 验证属性变化
            assert!(robot::get_robot_attack(&robot) == initial_attack + 10, 0);
            assert!(robot::get_robot_defense(&robot) == initial_defense - 10, 1);
            
            // 验证零件装备成功
            let (_, element_id) = robot::get_element_and_id_at(&robot, 0);
            
            ts::return_to_sender(&scenario, robot);
            ts::return_shared(game_state);
            ts::return_shared(robot_pool);
            ts::return_shared(game_config);
            ts::return_shared(token_policy);
        };

        ts::end(scenario);
    }

    #[test]
    /// 测试卸下零件功能
    fun test_unequip_element() {
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

        // 创建初始机器人
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let mut robot_pool = ts::take_shared<Robot_Pool>(&scenario);
            let mut passport = ts::take_from_sender<Passport>(&scenario);
            let mut token_policy = ts::take_shared<TokenPolicy<TRASH>>(&scenario);
            let token_cap = ts::take_shared<TrashTokenCap>(&scenario);

            // 获取token并支付
            let mut token = ts::take_from_sender<Token<TRASH>>(&scenario);
            let payment = token::split(&mut token, 10, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, token);

            game::mint_robot(
                &mut game_state,
                &mut robot_pool,
                &mut passport,
                string::utf8(b"Test Robot"),
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

        // 装备零件
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let mut robot_pool = ts::take_shared<Robot_Pool>(&scenario);
            let game_config = ts::take_shared<GameConfig>(&scenario);
            let mut robot = ts::take_from_sender<Robot>(&scenario);
            let mut token_policy = ts::take_shared<TokenPolicy<TRASH>>(&scenario);
            
            // 记录初始属性
            let initial_attack = robot::get_robot_attack(&robot);
            let initial_defense = robot::get_robot_defense(&robot);
            
            // 创建并装备两个零件
            let element1 = element::create_element(
                string::utf8(b"Attack Element"),
                string::utf8(b"Attack Element Description"),
                create_attack_abilities(),
                ts::ctx(&mut scenario)
            );
            let element2 = element::create_element(
                string::utf8(b"Defense Element"),
                string::utf8(b"Defense Element Description"),
                create_defense_abilities(),
                ts::ctx(&mut scenario)
            );
            
            // 获取token用于支付装备费用
            let mut token = ts::take_from_sender<Token<TRASH>>(&scenario);
            let payment1 = token::split(&mut token, 5, ts::ctx(&mut scenario));
            let payment2 = token::split(&mut token, 5, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, token);
            
            // 装备零件
            game::equip_element(
                &mut game_state,
                &game_config,
                &mut robot_pool,
                &mut robot,
                element1,
                payment1,
                &mut token_policy,
                ts::ctx(&mut scenario)
            );
            game::equip_element(
                &mut game_state,
                &game_config,
                &mut robot_pool,
                &mut robot,
                element2,
                payment2,
                &mut token_policy,
                ts::ctx(&mut scenario)
            );
            
            // 验证两个零件都装备成功
            let (_, element_id1) = robot::get_element_and_id_at(&robot, 0);
            let (_, element_id2) = robot::get_element_and_id_at(&robot, 1);
            
            // 卸下第一个零件
            game::unequip_element(
                &mut game_state,
                &mut robot_pool,
                &mut robot,
                element_id1,
                ts::ctx(&mut scenario)
            );
            
            // 验证还剩一个零件
            let (_, element_id) = robot::get_element_and_id_at(&robot, 0);
            assert!(element_id == element_id2, 0);
            
            // 卸下第二个零件
            game::unequip_element(
                &mut game_state,
                &mut robot_pool,
                &mut robot,
                element_id2,
                ts::ctx(&mut scenario)
            );
            
            // 验证没有剩余零件
            assert!(robot::get_robot_elements_count(&robot) == 0, 1);
            
            // 验证属性完全恢复
            assert!(robot::get_robot_attack(&robot) == initial_attack, 2);
            assert!(robot::get_robot_defense(&robot) == initial_defense, 3);
            
            ts::return_to_sender(&scenario, robot);
            ts::return_shared(game_state);
            ts::return_shared(robot_pool);
            ts::return_shared(game_config);
            ts::return_shared(token_policy);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = robot::E_MAX_ELEMENTS_REACHED)]
    /// 测试装备超过限制数量的零件
    fun test_equip_max_elements() {
        let mut scenario = ts::begin(ADMIN);
        
        // 初始化游戏
        init_game(&mut scenario);
        
        // 创建用户护照和机器人
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

        // 创建初始机器人
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let mut robot_pool = ts::take_shared<Robot_Pool>(&scenario);
            let mut passport = ts::take_from_sender<Passport>(&scenario);
            let mut token_policy = ts::take_shared<TokenPolicy<TRASH>>(&scenario);
            let token_cap = ts::take_shared<TrashTokenCap>(&scenario);

            let mut token = ts::take_from_sender<Token<TRASH>>(&scenario);
            let payment = token::split(&mut token, 10, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, token);

            game::mint_robot(
                &mut game_state,
                &mut robot_pool,
                &mut passport,
                string::utf8(b"Test Robot"),
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

        // 尝试装备超过限制的零件
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let mut robot_pool = ts::take_shared<Robot_Pool>(&scenario);
            let game_config = ts::take_shared<GameConfig>(&scenario);
            let mut robot = ts::take_from_sender<Robot>(&scenario);
            let mut token_policy = ts::take_shared<TokenPolicy<TRASH>>(&scenario);
            
            let mut i = 0;
            let max_elements = config::get_max_elements(&game_config);

            // 获取足够的token用于支付装备费用
            let mut token = ts::take_from_sender<Token<TRASH>>(&scenario);
            
            while (i <= max_elements) {
                let element = element::create_element(
                    string::utf8(b"Element"),
                    string::utf8(b"Element Description"),
                    create_attack_abilities(),
                    ts::ctx(&mut scenario)
                );
                let payment = token::split(&mut token, 5, ts::ctx(&mut scenario));
                
                game::equip_element(
                    &mut game_state,
                    &game_config,
                    &mut robot_pool,
                    &mut robot,
                    element,
                    payment,
                    &mut token_policy,
                    ts::ctx(&mut scenario)
                );
                i = i + 1;
            };
            
            ts::return_to_sender(&scenario, token);
            ts::return_to_sender(&scenario, robot);
            ts::return_shared(game_state);
            ts::return_shared(robot_pool);
            ts::return_shared(game_config);
            ts::return_shared(token_policy);
        };

        ts::end(scenario);
    }

    #[test]
    /// 测试管理员创建零件功能
    fun test_admin_create_element() {
        let mut scenario = ts::begin(ADMIN);
        
        // 初始化游戏
        init_game(&mut scenario);
        
        // 管理员创建零件并发送给 USER1
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<game::AdminCap>(&scenario);
            
            // 创建一个攻击型零件并发送给 USER1
            game::create_element(
                &admin_cap,
                string::utf8(b"Test Attack Element"),
                string::utf8(b"A test attack element"),
                create_attack_abilities(),
                USER1,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, admin_cap);
        };
        
        // 验证零件创建成功并转移给了 USER1
        ts::next_tx(&mut scenario, USER1);
        {
            // 验证 USER1 确实拥有这个零件
            assert!(ts::has_most_recent_for_address<element::Element>(USER1), 0);
            
            // 获取并检查零件属性
            let element = ts::take_from_sender<element::Element>(&scenario);
            assert!(element::get_element_name(&element) == string::utf8(b"Test Attack Element"), 1);
            assert!(element::get_element_description(&element) == string::utf8(b"A test attack element"), 2);
            
            // 检查零件的属性值
            let abilities = element::get_element_abilities(&element);
            assert!(*vector::borrow(&abilities, 0) == 138, 1); // 攻击+10
            assert!(*vector::borrow(&abilities, 1) == 118, 2); // 防御-10
            assert!(*vector::borrow(&abilities, 2) == 118, 3); // 速度-10
            assert!(*vector::borrow(&abilities, 3) == 118, 4); // 能量-10
            assert!(*vector::borrow(&abilities, 4) == 118, 5); // 核心-10
            
            ts::return_to_sender(&scenario, element);
        };
        
        ts::end(scenario);
    }

    #[test]
    /// 测试替换零件功能
    fun test_replace_element() {
        let mut scenario = ts::begin(ADMIN);
        let mut element_id1: ID;  // 声明模块级变量
        
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

        // 创建初始机器人
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let mut robot_pool = ts::take_shared<Robot_Pool>(&scenario);
            let mut passport = ts::take_from_sender<Passport>(&scenario);
            let mut token_policy = ts::take_shared<TokenPolicy<TRASH>>(&scenario);
            let token_cap = ts::take_shared<TrashTokenCap>(&scenario);

            // 获取token并支付
            let mut token = ts::take_from_sender<Token<TRASH>>(&scenario);
            let payment = token::split(&mut token, 10, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, token);

            game::mint_robot(
                &mut game_state,
                &mut robot_pool,
                &mut passport,
                string::utf8(b"Test Robot"),
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

        // 装备第一个零件
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let mut robot_pool = ts::take_shared<Robot_Pool>(&scenario);
            let game_config = ts::take_shared<GameConfig>(&scenario);
            let mut robot = ts::take_from_sender<Robot>(&scenario);
            let mut token_policy = ts::take_shared<TokenPolicy<TRASH>>(&scenario);
            
            // 记录初始属性
            let initial_attack = robot::get_robot_attack(&robot);
            let initial_defense = robot::get_robot_defense(&robot);
            
            // 创建一个攻击型零件
            let element = element::create_element(
                string::utf8(b"Attack Element"),
                string::utf8(b"Attack Element Description"),
                create_attack_abilities(),
                ts::ctx(&mut scenario)
            );

            // 获取token用于支付装备费用
            let mut token = ts::take_from_sender<Token<TRASH>>(&scenario);
            let payment = token::split(&mut token, 5, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, token);
            
            // 装备零件
            game::equip_element(
                &mut game_state,
                &game_config,
                &mut robot_pool,
                &mut robot,
                element,
                payment,
                &mut token_policy,
                ts::ctx(&mut scenario)
            );
            
            // 验证属性变化
            assert!(robot::get_robot_attack(&robot) == initial_attack + 10, 0);
            assert!(robot::get_robot_defense(&robot) == initial_defense - 10, 1);

            // 获取第一个零件的ID，用于后续替换
            let (_, id) = robot::get_element_and_id_at(&robot, 0);
            element_id1 = id;  // 存储到模块级变量
            
            ts::return_to_sender(&scenario, robot);
            ts::return_shared(game_state);
            ts::return_shared(robot_pool);
            ts::return_shared(game_config);
            ts::return_shared(token_policy);
        };

        // 替换零件
        ts::next_tx(&mut scenario, USER1);
        {
            let mut game_state = ts::take_shared<GameState>(&scenario);
            let mut robot_pool = ts::take_shared<Robot_Pool>(&scenario);
            let game_config = ts::take_shared<GameConfig>(&scenario);
            let mut robot = ts::take_from_sender<Robot>(&scenario);
            let mut token_policy = ts::take_shared<TokenPolicy<TRASH>>(&scenario);
            
            // 记录替换前的属性
            let initial_attack = robot::get_robot_attack(&robot);
            let initial_defense = robot::get_robot_defense(&robot);
            
            // 创建一个防御型零件
            let new_element = element::create_element(
                string::utf8(b"Defense Element"),
                string::utf8(b"Defense Element Description"),
                create_defense_abilities(),
                ts::ctx(&mut scenario)
            );

            // 获取token用于支付装备费用
            let mut token = ts::take_from_sender<Token<TRASH>>(&scenario);
            let payment = token::split(&mut token, 5, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, token);
            
            // 替换零件
            game::replace_element(
                &mut game_state,
                &game_config,
                &mut robot_pool,
                &mut robot,
                element_id1,  // 替换第一个零件
                new_element,
                payment,
                &mut token_policy,
                ts::ctx(&mut scenario)
            );
            
            // 验证属性变化（从攻击型变为防御型）
            assert!(robot::get_robot_attack(&robot) == initial_attack - 20, 0); // -10 (移除旧的) -10 (新的)
            assert!(robot::get_robot_defense(&robot) == initial_defense + 20, 1); // +10 (移除旧的) +10 (新的)
            
            // 验证零件数量仍然是1
            assert!(robot::get_robot_elements_count(&robot) == 1, 2);
            
            ts::return_to_sender(&scenario, robot);
            ts::return_shared(game_state);
            ts::return_shared(robot_pool);
            ts::return_shared(game_config);
            ts::return_shared(token_policy);
        };

        ts::end(scenario);
    }

    #[test]
    /// 测试管理员铸造和转移 token 功能
    fun test_admin_mint_and_transfer() {
        let mut scenario = ts::begin(ADMIN);
        
        // 初始化游戏
        init_game(&mut scenario);
        
        // 管理员铸造并转移 token 给用户
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<game::AdminCap>(&scenario);
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            
            // 铸造 1000 个 token 并转移给 USER1
            game::admin_mint_and_transfer(
                &admin_cap,
                &mut token_cap,
                1000,
                USER1,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(token_cap);
        };
        
        // 验证用户收到了正确数量的 token
        ts::next_tx(&mut scenario, USER1);
        {
            let token = ts::take_from_sender<Token<TRASH>>(&scenario);
            assert!(token::value(&token) == 1000, 0);
            ts::return_to_sender(&scenario, token);
        };

        ts::end(scenario);
    }
}
