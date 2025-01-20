#[test_only]
module robobo::user_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self, Clock};
    use sui::test_utils;
    use sui::object;
    use sui::transfer;
    use std::string;
    use robobo::user::{Self, Passport};

    const USER1: address = @0xA1;
    const USER2: address = @0xA2;

    fun test_scenario(): Scenario { ts::begin(USER1) }

    #[test]
    fun test_create_user() {
        let mut scenario = test_scenario();
        let test = &mut scenario;
        
        // 创建时钟
        ts::next_tx(test, USER1);
        let ctx = ts::ctx(test);
        let mut clock = clock::create_for_testing(ctx);
        clock::set_for_testing(&mut clock, 0);

        // 创建用户
        ts::next_tx(test, USER1);
        {
            let ctx = ts::ctx(test);
            let passport = user::mint(string::utf8(b"Test User"), &clock, ctx);
            user::transfer_passport(passport, USER1);
        };

        // 验证用户创建
        ts::next_tx(test, USER1);
        {
            let passport = ts::take_from_sender<Passport>(test);
            assert!(user::get_name(&passport) == string::utf8(b"Test User"), 0);
            let robots = user::get_robots(&passport);
            let elements = user::get_elements(&passport);
            assert!(vector::is_empty(robots), 1);
            assert!(vector::is_empty(elements), 2);
            ts::return_to_sender(test, passport);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
    
    #[test]
    fun test_robot_management() {
        let mut scenario = test_scenario();
        let test = &mut scenario;
        
        // 创建时钟和用户
        ts::next_tx(test, USER1);
        let ctx = ts::ctx(test);
        let mut clock = clock::create_for_testing(ctx);
        clock::set_for_testing(&mut clock, 0);

         // 创建用户
        ts::next_tx(test, USER1);
        {
            let ctx = ts::ctx(test);
            let passport = user::mint(string::utf8(b"Test User"), &clock, ctx);
            user::transfer_passport(passport, USER1);
        };

        // 测试添加机器人
        ts::next_tx(test, USER1);
        {
            let mut passport = ts::take_from_sender<Passport>(test);
            let robot_id = object::id_from_address(@0x1);
            
            user::add_robot(&mut passport, robot_id);
            assert!(vector::length(user::get_robots(&passport)) == 1, 5);
            assert!(vector::contains(user::get_robots(&passport), &robot_id), 6);
            
            ts::return_to_sender(test, passport);
        };

        // 测试删除机器人
        ts::next_tx(test, USER1);
        {
            let mut passport = ts::take_from_sender<Passport>(test);
            let robot_id = object::id_from_address(@0x1);
            
            user::remove_robot(&mut passport, robot_id);
            assert!(vector::length(user::get_robots(&passport)) == 0, 7);
            assert!(!vector::contains(user::get_robots(&passport), &robot_id), 8);
            
            ts::return_to_sender(test, passport);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_edit_name() {
        let mut scenario = test_scenario();
        let test = &mut scenario;
        
        // 创建时钟和用户
        ts::next_tx(test, USER1);
        let ctx = ts::ctx(test);
        let mut clock = clock::create_for_testing(ctx);
        clock::set_for_testing(&mut clock, 0);

        // 创建用户
        ts::next_tx(test, USER1);
        {
            let ctx = ts::ctx(test);
            let passport = user::mint(string::utf8(b"Test User"), &clock, ctx);
            user::transfer_passport(passport, USER1);
        };

        // 测试修改名称
        ts::next_tx(test, USER1);
        {
            let mut passport = ts::take_from_sender<Passport>(test);
            user::edit_name(&mut passport, string::utf8(b"New Name"));
            assert!(user::get_name(&passport) == string::utf8(b"New Name"), 7);
            ts::return_to_sender(test, passport);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_element_management() {
        let mut scenario = test_scenario();
        let test = &mut scenario;
        
        // 创建时钟和用户
        ts::next_tx(test, USER1);
        let ctx = ts::ctx(test);
        let mut clock = clock::create_for_testing(ctx);
        clock::set_for_testing(&mut clock, 0);

        // 创建用户
        ts::next_tx(test, USER1);
        {
            let ctx = ts::ctx(test);
            let passport = user::mint(string::utf8(b"Test User"), &clock, ctx);
            user::transfer_passport(passport, USER1);
        };

        // 测试添加元素
        ts::next_tx(test, USER1);
        {
            let mut passport = ts::take_from_sender<Passport>(test);
            let element_id = object::id_from_address(@0x2);
            
            user::add_element(&mut passport, element_id);
            assert!(vector::length(user::get_elements(&passport)) == 1, 8);
            assert!(vector::contains(user::get_elements(&passport), &element_id), 9);
            
            ts::return_to_sender(test, passport);
        };

        // 测试移除元素
        ts::next_tx(test, USER1);
        {
            let mut passport = ts::take_from_sender<Passport>(test);
            let element_id = object::id_from_address(@0x2);
            
            user::remove_element(&mut passport, element_id);
            assert!(vector::length(user::get_elements(&passport)) == 0, 10);
            assert!(!vector::contains(user::get_elements(&passport), &element_id), 11);
            
            ts::return_to_sender(test, passport);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = user::E_ROBOT_EXISTS)]
    fun test_add_duplicate_robot() {
        let mut scenario = test_scenario();
        let test = &mut scenario;
        
        // 创建时钟和用户
        ts::next_tx(test, USER1);
        let ctx = ts::ctx(test);
        let mut clock = clock::create_for_testing(ctx);
        clock::set_for_testing(&mut clock, 0);
        
        // 创建用户
        ts::next_tx(test, USER1);
        {
            let ctx = ts::ctx(test);
            let passport = user::mint(string::utf8(b"Test User"), &clock, ctx);
            user::transfer_passport(passport, USER1);
        };

        // 测试添加重复机器人
        ts::next_tx(test, USER1);
        {
            let mut passport = ts::take_from_sender<Passport>(test);
            let robot_id = object::id_from_address(@0x1);
            
            user::add_robot(&mut passport, robot_id);
            // 这里应该会失败
            user::add_robot(&mut passport, robot_id);
            
            ts::return_to_sender(test, passport);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = user::E_ROBOT_NOT_EXISTS)]
    fun test_remove_nonexistent_robot() {
        let mut scenario = test_scenario();
        let test = &mut scenario;
        
        // 创建时钟和用户
        ts::next_tx(test, USER1);
        let ctx = ts::ctx(test);
        let mut clock = clock::create_for_testing(ctx);
        clock::set_for_testing(&mut clock, 0);

        // 创建用户
        ts::next_tx(test, USER1);
        {
            let ctx = ts::ctx(test);
            let passport = user::mint(string::utf8(b"Test User"), &clock, ctx);
            user::transfer_passport(passport, USER1);
        };

        // 测试移除不存在的机器人
        ts::next_tx(test, USER1);
        {
            let mut passport = ts::take_from_sender<Passport>(test);
            let robot_id = object::id_from_address(@0x1);
            
            // 这里应该会失败
            user::remove_robot(&mut passport, robot_id);
            
            ts::return_to_sender(test, passport);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }



    #[test]
    fun test_daily_token_claim() {
        let mut scenario = test_scenario();
        let test = &mut scenario;
        
        // 创建时钟
        ts::next_tx(test, USER1);
        let ctx = ts::ctx(test);
        let mut clock = clock::create_for_testing(ctx);
        clock::set_for_testing(&mut clock, 0);  // 从0时间开始

        // 创建用户
        ts::next_tx(test, USER1);
        {
            let ctx = ts::ctx(test);
            let passport = user::mint(string::utf8(b"Test User"), &clock, ctx);
            user::transfer_passport(passport, USER1);
        };

        // 尝试立即领取代币（应该失败，因为在同一天）
        ts::next_tx(test, USER1);
        {
            let passport = ts::take_from_sender<Passport>(test);
            assert!(!user::can_claim_daily_token(&passport, &clock), 3);
            ts::return_to_sender(test, passport);
        };

        // 快进23小时（应该还是在同一天）
        clock::increment_for_testing(&mut clock, 1000 * 60 * 60 * 23);
        ts::next_tx(test, USER1);
        {
            let passport = ts::take_from_sender<Passport>(test);
            assert!(!user::can_claim_daily_token(&passport, &clock), 4);
            ts::return_to_sender(test, passport);
        };

        // 再快进2小时（应该进入下一天）
        clock::increment_for_testing(&mut clock, 1000 * 60 * 60 * 2);
        ts::next_tx(test, USER1);
        {
            let passport = ts::take_from_sender<Passport>(test);
            assert!(user::can_claim_daily_token(&passport, &clock), 5);
            ts::return_to_sender(test, passport);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
} 