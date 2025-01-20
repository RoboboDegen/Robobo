#[test_only]
module robobo::trash_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::token::{Self, Token, TokenPolicy};
    use sui::test_utils::assert_eq;
    
    use robobo::trash::{Self, TRASH, TrashTokenCap};

    // Test constants
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;

    fun init_trash(scenario: &mut Scenario) {
        // 初始化 TRASH token 系统
        ts::next_tx(scenario, ADMIN);
        {
            trash::init_for_testing(ts::ctx(scenario));
        };
    }

    #[test]
    fun test_trash_initialization() {
        let mut scenario = ts::begin(ADMIN);
        
        // 初始化 TRASH token
        init_trash(&mut scenario);
        
        // 验证 TRASH token 系统已创建
        ts::next_tx(&mut scenario, ADMIN);
        {
            assert!(ts::has_most_recent_shared<TokenPolicy<TRASH>>(), 0);
            assert!(ts::has_most_recent_shared<TrashTokenCap>(), 1);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_mint_trash() {
        let mut scenario = ts::begin(ADMIN);
        
        // 初始化 TRASH token
        init_trash(&mut scenario);
        
        // 铸造 token
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            
            // 铸造 100 个 token
            trash::mint(&mut token_cap, 100, ts::ctx(&mut scenario));
            
            ts::return_shared(token_cap);
        };
        
        // 验证铸造结果
        ts::next_tx(&mut scenario, ADMIN);
        {
            let token = ts::take_from_sender<Token<TRASH>>(&scenario);
            assert!(token::value(&token) == 100, 0);
            ts::return_to_sender(&scenario, token);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_mint_and_transfer() {
        let mut scenario = ts::begin(ADMIN);
        
        // 初始化 TRASH token
        init_trash(&mut scenario);
        
        // 铸造并转移 token
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            
            // 铸造 100 个 token 并转移给 USER1
            trash::mint_and_transfer(&mut token_cap, 100, USER1, ts::ctx(&mut scenario));
            
            ts::return_shared(token_cap);
        };
        
        // 验证 USER1 收到的 token
        ts::next_tx(&mut scenario, USER1);
        {
            let token = ts::take_from_sender<Token<TRASH>>(&scenario);
            assert!(token::value(&token) == 100, 0);
            ts::return_to_sender(&scenario, token);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_spend_trash() {
        let mut scenario = ts::begin(ADMIN);
        
        // 初始化 TRASH token
        init_trash(&mut scenario);
        
        // 铸造 token 给 USER1
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            trash::mint_and_transfer(&mut token_cap, 100, USER1, ts::ctx(&mut scenario));
            ts::return_shared(token_cap);
        };
        
        // USER1 消费 token
        ts::next_tx(&mut scenario, USER1);
        {
            let mut token = ts::take_from_sender<Token<TRASH>>(&scenario);
            let mut token_policy = ts::take_shared<TokenPolicy<TRASH>>(&scenario);
            
            // 分割出 50 个 token 进行消费
            let payment = token::split(&mut token, 50, ts::ctx(&mut scenario));
            trash::spend(payment, &mut token_policy, 50, ts::ctx(&mut scenario));
            
            // 验证剩余 token 数量
            assert!(token::value(&token) == 50, 0);
            
            ts::return_to_sender(&scenario, token);
            ts::return_shared(token_policy);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = trash::EInvalidAmount)]
    fun test_spend_invalid_amount() {
        let mut scenario = ts::begin(ADMIN);
        
        // 初始化 TRASH token
        init_trash(&mut scenario);
        
        // 铸造 token 给 USER1
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut token_cap = ts::take_shared<TrashTokenCap>(&scenario);
            trash::mint_and_transfer(&mut token_cap, 100, USER1, ts::ctx(&mut scenario));
            ts::return_shared(token_cap);
        };
        
        // USER1 尝试消费错误数量的 token
        ts::next_tx(&mut scenario, USER1);
        {
            let mut token = ts::take_from_sender<Token<TRASH>>(&scenario);
            let mut token_policy = ts::take_shared<TokenPolicy<TRASH>>(&scenario);
            
            // 分割出 50 个 token 但尝试消费 60 个（应该失败）
            let payment = token::split(&mut token, 50, ts::ctx(&mut scenario));
            trash::spend(payment, &mut token_policy, 60, ts::ctx(&mut scenario));
            
            ts::return_to_sender(&scenario, token);
            ts::return_shared(token_policy);
        };

        ts::end(scenario);
    }
} 