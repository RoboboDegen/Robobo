#[test_only]
module robobo::user_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils;
    use sui::object;
    use sui::transfer;
    use sui::tx_context;
    use std::string;
    use robobo::user::{Self, Passport};

    const USER1: address = @0xA1;
    const USER2: address = @0xA2;

    fun test_scenario(): Scenario { ts::begin(USER1) }

    #[test]
    fun test_create_user() {
        let mut scenario = test_scenario();
        let test = &mut scenario;
        
        // 设置初始时间戳
        ts::next_tx(test, USER1);
        {
            let ctx = ts::ctx(test);
            tx_context::increment_epoch_timestamp(ctx, 1000); // 设置一个非零的时间戳
        };
        
        // 创建用户
        ts::next_tx(test, USER1);
        {
            let ctx = ts::ctx(test);
            let passport = user::mint(string::utf8(b"Test User"), ctx);
            user::transfer_passport(passport, USER1);
        };

        // 验证用户创建
        ts::next_tx(test, USER1);
        {
            let passport = ts::take_from_sender<Passport>(test);
            assert!(user::get_name(&passport) == string::utf8(b"Test User"), 0);
            assert!(user::get_last_mint_token_time(&passport) == 1000, 1); // 验证时间戳是否正确
            ts::return_to_sender(test, passport);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_edit_name() {
        let mut scenario = test_scenario();
        let test = &mut scenario;
        
        // 创建用户
        ts::next_tx(test, USER1);
        {
            let ctx = ts::ctx(test);
            let passport = user::mint(string::utf8(b"Test User"), ctx);
            user::transfer_passport(passport, USER1);
        };

        // 测试修改名称
        ts::next_tx(test, USER1);
        {
            let mut passport = ts::take_from_sender<Passport>(test);
            user::edit_name(&mut passport, string::utf8(b"New Name"));
            assert!(user::get_name(&passport) == string::utf8(b"New Name"), 2);
            ts::return_to_sender(test, passport);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_daily_token_claim() {
        let mut scenario = test_scenario();
        let test = &mut scenario;

        // 创建用户
        ts::next_tx(test, USER1);
        {
            let ctx = ts::ctx(test);
            let passport = user::mint(string::utf8(b"Test User"), ctx);
            user::transfer_passport(passport, USER1);
        };

        // 尝试立即领取代币（应该失败，因为时间戳相同）
        ts::next_tx(test, USER1);
        {
            let passport = ts::take_from_sender<Passport>(test);
            let ctx = ts::ctx(test);
            assert!(!user::can_claim_daily_token(&passport, ctx), 3);
            ts::return_to_sender(test, passport);
        };

        // 设置新的时间戳（增加时间）并更新最后领取时间
        ts::next_tx(test, USER1);
        {
            let mut passport = ts::take_from_sender<Passport>(test);
            let ctx = ts::ctx(test);
            
            tx_context::increment_epoch_timestamp(ctx, 1000 * 60 * 60 * 24);
            assert!(user::can_claim_daily_token(&passport, ctx), 4);
            
            // 更新最后领取时间
            user::update_last_mint_token_time(&mut passport, ctx);
            assert!(!user::can_claim_daily_token(&passport, ctx), 5);
            
            ts::return_to_sender(test, passport);
        };

        ts::end(scenario);
    }
} 