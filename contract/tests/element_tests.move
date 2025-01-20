#[test_only]
module robobo::element_tests {
    use std::string;
    use std::vector;
    use sui::test_scenario::{Self as test, Scenario, next_tx, ctx};
    use robobo::element::{Self, Element};

    // 测试常量
    const ALICE: address = @0xA11CE;
    const ABILITY_SIZE: u64 = 5;
    const ABILITY_THRESHOLD: u8 = 128;

    // 辅助函数：创建一个有效的零件属性数组
    fun create_valid_abilities(main_ability_idx: u64): vector<u8> {
        let mut abilities = vector::empty();
        let mut i = 0;
        while (i < ABILITY_SIZE) {
            if (i == main_ability_idx) {
                vector::push_back(&mut abilities, ABILITY_THRESHOLD + 10);
            } else {
                vector::push_back(&mut abilities, ABILITY_THRESHOLD - 10);
            };
            i = i + 1;
        };
        abilities
    }

    // 测试场景设置
    fun setup_test(): Scenario {
        test::begin(ALICE)
    }

    #[test]
    /// 测试正常创建零件
    fun test_create_element() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        // 创建一个攻击型零件（第一个属性值大于阈值）
        next_tx(test, ALICE);
        {
            let abilities = create_valid_abilities(0);
            let element = element::create_element(
                string::utf8(b"Test Element"),
                string::utf8(b"Test Description"),
                abilities,
                ctx(test)
            );
            
            // 验证零件属性
            let element_abilities = element::get_element_abilities(&element);
            assert!(vector::length(&element_abilities) == ABILITY_SIZE, 0);
            assert!(*vector::borrow(&element_abilities, 0) == ABILITY_THRESHOLD + 10, 1);
            
            // 清理：删除零件
            element::delete_element(element);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = robobo::element::EAbilitySizeNotEqual)]
    /// 测试创建零件时属性数量错误的情况
    fun test_create_element_wrong_size() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            let mut abilities = vector::empty();
            vector::push_back(&mut abilities, ABILITY_THRESHOLD + 10);
            // 只添加一个属性，应该会失败
            let element = element::create_element(
                string::utf8(b"Wrong Size Element"),
                string::utf8(b"Wrong Size Description"),
                abilities,
                ctx(test)
            );
            element::delete_element(element);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = robobo::element::EAbilityThresholdNotEqual)]
    /// 测试创建零件时没有属性超过阈值的情况
    fun test_create_element_no_main_ability() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            let mut abilities = vector::empty();
            let mut i = 0;
            while (i < ABILITY_SIZE) {
                vector::push_back(&mut abilities, ABILITY_THRESHOLD - 10);
                i = i + 1;
            };
            
            let element = element::create_element(
                string::utf8(b"No Main Ability Element"),
                string::utf8(b"No Main Ability Description"),
                abilities,
                ctx(test)
            );
            element::delete_element(element);
        };
        test::end(scenario);
    }

    #[test]
    /// 测试获取零件ID
    fun test_get_element_id() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            let abilities = create_valid_abilities(0);
            let element = element::create_element(
                string::utf8(b"Test Element"),
                string::utf8(b"Test Description"),
                abilities,
                ctx(test)
            );
            
            // 验证可以获取ID
            let _id = element::get_element_id(&element);
            
            element::delete_element(element);
        };
        test::end(scenario);
    }
} 