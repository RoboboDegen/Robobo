#[test_only]
module robobo::robot_tests {
    use std::string;
    use sui::test_scenario::{Self as test, Scenario, next_tx, ctx};
    use robobo::robot::{Self, Robot, Robot_Pool};
    use robobo::element::{Self};
    use robobo::config::{Self, GameConfig};
    use std::vector;
    use sui::transfer;

    const ALICE: address = @0xA11CE;
    const ZERO_ADDRESS: address = @0x0;

    fun setup_test(): Scenario {
        test::begin(ALICE)
    }

    #[test]
    /// 测试创建机器人和机器人池
    fun test_create_robot() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            // 创建机器人池
            let mut pool = robot::create_robot_pool(ctx(test));
            
            // 创建机器人
            let robot = robot::create_robot(
                string::utf8(b"Test Robot"),
                &mut pool,
                ctx(test)
            );
            
            // 验证机器人属性
            assert!(robot::get_robot_personality(&robot) != string::utf8(b""), 0);
            
            transfer::public_transfer(robot, ZERO_ADDRESS);
            transfer::public_transfer(pool, ZERO_ADDRESS);
        };
        test::end(scenario);
    }

    #[test]
    /// 测试装备和卸下零件
    fun test_equip_and_unequip_element() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            // 创建必要的对象
            let mut pool = robot::create_robot_pool(ctx(test));
            let game_config = config::create_config(ctx(test));
            let mut robot = robot::create_robot(
                string::utf8(b"Test Robot"),
                &mut pool,
                ctx(test)
            );
            
            // 创建一个攻击型零件
            let element = element::create_element(
                string::utf8(b"Test Element"),
                string::utf8(b"Test Description"),
                create_attack_abilities(),
                ctx(test)
            );
            
            // 记录初始属性
            let initial_attack = robot::get_robot_attack(&robot);
            let initial_defense = robot::get_robot_defense(&robot);
            
            // 装备零件
            robot::equip_element(&mut robot, element, &mut pool, &game_config);
            
            // 验证属性变化（攻击+10，防御-10）
            assert!(robot::get_robot_attack(&robot) == initial_attack + 10, 0);
            assert!(robot::get_robot_defense(&robot) == initial_defense - 10, 1);
            
            // 获取零件ID
            let (_, element_id) = robot::get_element_and_id_at(&robot, 0);
            
            // 卸下零件
            let element = robot::unequip_element_by_id(&mut robot, element_id, &mut pool);
            
            // 验证属性完全恢复到初始值
            assert!(robot::get_robot_attack(&robot) == initial_attack, 2);
            assert!(robot::get_robot_defense(&robot) == initial_defense, 3);
            
            transfer::public_transfer(robot, ZERO_ADDRESS);
            transfer::public_transfer(pool, ZERO_ADDRESS);
            transfer::public_transfer(game_config, ZERO_ADDRESS);
            element::delete_element(element);
        };
        test::end(scenario);
    }

    #[test]
    /// 测试机器人镜像数据
    fun test_robot_mirror() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            // 创建必要的对象
            let mut pool = robot::create_robot_pool(ctx(test));
            let game_config = config::create_config(ctx(test));
            let robot = robot::create_robot(
                string::utf8(b"Test Robot"),
                &mut pool,
                ctx(test)
            );
            
            // 获取机器人ID
            let robot_id = robot::get_robot_id(&robot);
            
            // 获取镜像数据
            let mirror = robot::get_robot_mirror(robot_id, &pool);
            
            // 验证镜像数据
            assert!(robot::get_robot_mirror_attack(mirror) == robot::get_robot_attack(&robot), 0);
            assert!(robot::get_robot_mirror_defense(mirror) == robot::get_robot_defense(&robot), 1);
            assert!(robot::get_robot_mirror_speed(mirror) == robot::get_robot_speed(&robot), 2);
            assert!(robot::get_robot_mirror_energy(mirror) == robot::get_robot_energy(&robot), 3);
            
            transfer::public_transfer(robot, ZERO_ADDRESS);
            transfer::public_transfer(pool, ZERO_ADDRESS);
            transfer::public_transfer(game_config, ZERO_ADDRESS);
        };
        test::end(scenario);
    }

    #[test]
    /// 测试机器人属性修改和镜像更新
    fun test_robot_stats_and_mirror_update() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            // 创建必要的对象
            let mut pool = robot::create_robot_pool(ctx(test));
            let game_config = config::create_config(ctx(test));
            let mut robot = robot::create_robot(
                string::utf8(b"Test Robot"),
                &mut pool,
                ctx(test)
            );
            
            // 记录初始属性
            let initial_speed = robot::get_robot_speed(&robot);
            
            // 创建一个速度型零件
            let element = element::create_element(
                string::utf8(b"Speed Element"),
                string::utf8(b"Speed Element Description"),
                create_speed_abilities(),
                ctx(test)
            );
            
            // 装备零件
            robot::equip_element(&mut robot, element, &mut pool, &game_config);
            
            // 获取机器人ID和镜像数据
            let robot_id = robot::get_robot_id(&robot);
            let mirror = robot::get_robot_mirror(robot_id, &pool);
            
            // 验证机器人属性和镜像数据都已更新
            assert!(robot::get_robot_speed(&robot) > initial_speed, 0);
            assert!(robot::get_robot_mirror_speed(mirror) == robot::get_robot_speed(&robot), 1);
            
            transfer::public_transfer(robot, ZERO_ADDRESS);
            transfer::public_transfer(pool, ZERO_ADDRESS);
            transfer::public_transfer(game_config, ZERO_ADDRESS);
        };
        test::end(scenario);
    }

    #[test]
    /// 测试多个零件的组合效果
    fun test_multiple_elements_combination() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            // 创建必要的对象
            let mut pool = robot::create_robot_pool(ctx(test));
            let game_config = config::create_config(ctx(test));
            let mut robot = robot::create_robot(
                string::utf8(b"Test Robot"),
                &mut pool,
                ctx(test)
            );
            
            // 记录初始属性
            let initial_attack = robot::get_robot_attack(&robot);
            let initial_defense = robot::get_robot_defense(&robot);
            
            // 创建一个攻击型和一个防御型零件
            let attack_element = element::create_element(
                string::utf8(b"Attack Element"),
                string::utf8(b"Attack Element Description"),
                create_attack_abilities(),
                ctx(test)
            );
            let defense_element = element::create_element(
                string::utf8(b"Defense Element"),
                string::utf8(b"Defense Element Description"),
                create_defense_abilities(),
                ctx(test)
            );
            
            // 装备攻击型零件并验证属性变化
            robot::equip_element(&mut robot, attack_element, &mut pool, &game_config);
            
            // 验证攻击型零件的效果（攻击+10，防御-10）
            assert!(robot::get_robot_attack(&robot) == initial_attack + 10, 0);
            assert!(robot::get_robot_defense(&robot) == initial_defense - 10, 1);
            
            // 装备防御型零件并验证属性变化
            robot::equip_element(&mut robot, defense_element, &mut pool, &game_config);
            
            // 验证两个零件的组合效果（攻击+0，防御+0）
            // 攻击：初始值 +10(攻击零件) -10(防御零件)
            // 防御：初始值 -10(攻击零件) +10(防御零件)
            assert!(robot::get_robot_attack(&robot) == initial_attack, 2);
            assert!(robot::get_robot_defense(&robot) == initial_defense, 3);
            
            // 卸下攻击型零件
            let (_, element_id) = robot::get_element_and_id_at(&robot, 0);
            let removed_element = robot::unequip_element_by_id(&mut robot, element_id, &mut pool);
            
            // 验证只剩防御型零件的效果（攻击-10，防御+10）
            assert!(robot::get_robot_attack(&robot) == initial_attack - 10, 4);
            assert!(robot::get_robot_defense(&robot) == initial_defense + 10, 5);
            
            // 卸下最后一个零件
            let (_, element_id) = robot::get_element_and_id_at(&robot, 0);
            let removed_element2 = robot::unequip_element_by_id(&mut robot, element_id, &mut pool);
            
            // 验证所有零件卸下后恢复到初始值
            assert!(robot::get_robot_attack(&robot) == initial_attack, 6);
            assert!(robot::get_robot_defense(&robot) == initial_defense, 7);
            
            transfer::public_transfer(robot, ZERO_ADDRESS);
            transfer::public_transfer(pool, ZERO_ADDRESS);
            transfer::public_transfer(game_config, ZERO_ADDRESS);
            element::delete_element(removed_element);
            element::delete_element(removed_element2);
        };
        test::end(scenario);
    }

    #[test]
    /// 测试零件装备和卸载功能
    fun test_element_equip_and_unequip() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            // 创建必要的对象
            let mut pool = robot::create_robot_pool(ctx(test));
            let game_config = config::create_config(ctx(test));
            let mut robot = robot::create_robot(
                string::utf8(b"Test Robot"),
                &mut pool,
                ctx(test)
            );
            
            // 记录初始属性
            let initial_attack = robot::get_robot_attack(&robot);
            let initial_defense = robot::get_robot_defense(&robot);
            
            // 创建并装备多个零件
            let element1 = element::create_element(
                string::utf8(b"Element 1"),
                string::utf8(b"Element 1 Description"),
                create_attack_abilities(),
                ctx(test)
            );
            let element2 = element::create_element(
                string::utf8(b"Element 2"),
                string::utf8(b"Element 2 Description"),
                create_defense_abilities(),
                ctx(test)
            );
            
            // 装备第一个零件并验证属性变化
            robot::equip_element(&mut robot, element1, &mut pool, &game_config);
            
            // 验证攻击型零件的效果（攻击+10，防御-10）
            assert!(robot::get_robot_attack(&robot) == initial_attack + 10, 0);
            assert!(robot::get_robot_defense(&robot) == initial_defense - 10, 1);
            
            // 装备第二个零件并验证属性变化
            robot::equip_element(&mut robot, element2, &mut pool, &game_config);
            
            // 验证两个零件的组合效果（攻击+0，防御+0）
            assert!(robot::get_robot_attack(&robot) == initial_attack, 2);
            assert!(robot::get_robot_defense(&robot) == initial_defense, 3);
            
            // 卸下所有零件
            let (_, element_id1) = robot::get_element_and_id_at(&robot, 0);
            let (_, element_id2) = robot::get_element_and_id_at(&robot, 1);
            let removed_element1 = robot::unequip_element_by_id(&mut robot, element_id1, &mut pool);
            let removed_element2 = robot::unequip_element_by_id(&mut robot, element_id2, &mut pool);
            
            // 验证属性完全恢复
            assert!(robot::get_robot_attack(&robot) == initial_attack, 4);
            assert!(robot::get_robot_defense(&robot) == initial_defense, 5);
            
            transfer::public_transfer(robot, ZERO_ADDRESS);
            transfer::public_transfer(pool, ZERO_ADDRESS);
            transfer::public_transfer(game_config, ZERO_ADDRESS);
            element::delete_element(removed_element1);
            element::delete_element(removed_element2);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = robot::E_MAX_ELEMENTS_REACHED)]
    /// 测试超出最大零件数量限制
    fun test_equip_max_elements() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            // 创建必要的对象
            let mut pool = robot::create_robot_pool(ctx(test));
            let game_config = config::create_config(ctx(test));
            let mut robot = robot::create_robot(
                string::utf8(b"Test Robot"),
                &mut pool,
                ctx(test)
            );
            
            // 装备超过限制的零件
            let mut i = 0;
            while (i <= config::get_max_elements(&game_config)) {
                let element = element::create_element(
                    string::utf8(b"Element"),
                    string::utf8(b"Element Description"),
                    create_attack_abilities(),
                    ctx(test)
                );
                robot::equip_element(&mut robot, element, &mut pool, &game_config);
                i = i + 1;
            };
            
            transfer::public_transfer(robot, ZERO_ADDRESS);
            transfer::public_transfer(pool, ZERO_ADDRESS);
            transfer::public_transfer(game_config, ZERO_ADDRESS);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = robot::E_ELEMENT_NOT_EQUIPPED)]
    /// 测试卸下不存在的零件
    fun test_unequip_nonexistent_element() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            // 创建必要的对象
            let mut pool = robot::create_robot_pool(ctx(test));
            let mut robot = robot::create_robot(
                string::utf8(b"Test Robot"),
                &mut pool,
                ctx(test)
            );
            
            // 尝试卸下不存在的零件
            let element = robot::unequip_element(&mut robot, 0, &mut pool);
            element::delete_element(element);
            
            transfer::public_transfer(robot, ZERO_ADDRESS);
            transfer::public_transfer(pool, ZERO_ADDRESS);
        };
        test::end(scenario);
    }

    #[test]
    /// 测试属性下溢保护
    fun test_stat_underflow_protection() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            // 创建必要的对象
            let mut pool = robot::create_robot_pool(ctx(test));
            let game_config = config::create_config(ctx(test));
            let mut robot = robot::create_robot(
                string::utf8(b"Test Robot"),
                &mut pool,
                ctx(test)
            );
            
            // 记录初始攻击力
            let initial_attack = robot::get_robot_attack(&robot);
            
            // 创建并装备多个负面零件
            let element1 = element::create_element(
                string::utf8(b"Negative Element 1"),
                string::utf8(b"Negative Element 1 Description"),
                create_super_negative_abilities(),
                ctx(test)
            );
            let element2 = element::create_element(
                string::utf8(b"Negative Element 2"),
                string::utf8(b"Negative Element 2 Description"),
                create_super_negative_abilities(),
                ctx(test)
            );
            
            // 装备零件
            robot::equip_element(&mut robot, element1, &mut pool, &game_config);
            robot::equip_element(&mut robot, element2, &mut pool, &game_config);
            
            // 验证属性不会低于0
            assert!(robot::get_robot_attack(&robot) >= 0, 0);
            
            // 卸下一个零件
            let (_, element_id) = robot::get_element_and_id_at(&robot, 0);
            let removed_element = robot::unequip_element_by_id(&mut robot, element_id, &mut pool);
            
            // 验证属性会恢复但不会超过初始值
            assert!(robot::get_robot_attack(&robot) >= 0, 1);
            assert!(robot::get_robot_attack(&robot) <= initial_attack, 2);
            
            transfer::public_transfer(robot, ZERO_ADDRESS);
            transfer::public_transfer(pool, ZERO_ADDRESS);
            transfer::public_transfer(game_config, ZERO_ADDRESS);
            element::delete_element(removed_element);
        };
        test::end(scenario);
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

    // 辅助函数：创建一个速度型零件的属性数组
    fun create_speed_abilities(): vector<u8> {
        let mut abilities = vector::empty();
        vector::push_back(&mut abilities, 118); // 攻击-10
        vector::push_back(&mut abilities, 118); // 防御-10
        vector::push_back(&mut abilities, 138); // 速度+10 (主属性)
        vector::push_back(&mut abilities, 118); // 能量-10
        vector::push_back(&mut abilities, 118); // 核心-10
        abilities
    }

    // 辅助函数：创建一个超强负面零件的属性数组
    fun create_super_negative_abilities(): vector<u8> {
        let mut abilities = vector::empty();
        vector::push_back(&mut abilities, 0);   // 攻击-128
        vector::push_back(&mut abilities, 118); // 防御-10
        vector::push_back(&mut abilities, 118); // 速度-10
        vector::push_back(&mut abilities, 138); // 能量+10 (主属性)
        vector::push_back(&mut abilities, 118); // 核心-10
        abilities
    }

    // 辅助函数：创建一个小幅增加攻击的零件属性数组
    fun create_small_attack_abilities(): vector<u8> {
        let mut abilities = vector::empty();
        vector::push_back(&mut abilities, 133); // 攻击+5 (主属性)
        vector::push_back(&mut abilities, 123); // 防御-5
        vector::push_back(&mut abilities, 123); // 速度-5
        vector::push_back(&mut abilities, 123); // 能量-5
        vector::push_back(&mut abilities, 123); // 核心-5
        abilities
    }

    // 辅助函数：创建一个大幅增加攻击的零件属性数组
    fun create_large_attack_abilities(): vector<u8> {
        let mut abilities = vector::empty();
        vector::push_back(&mut abilities, 178); // 攻击+50 (主属性)
        vector::push_back(&mut abilities, 78);  // 防御-50
        vector::push_back(&mut abilities, 78);  // 速度-50
        vector::push_back(&mut abilities, 78);  // 能量-50
        vector::push_back(&mut abilities, 78);  // 核心-50
        abilities
    }

    // 辅助函数：创建一个能量型零件的属性数组（替代原来的平衡型零件）
    fun create_energy_abilities(): vector<u8> {
        let mut abilities = vector::empty();
        vector::push_back(&mut abilities, 123); // 攻击-5
        vector::push_back(&mut abilities, 123); // 防御-5
        vector::push_back(&mut abilities, 123); // 速度-5
        vector::push_back(&mut abilities, 133); // 能量+5 (主属性)
        vector::push_back(&mut abilities, 123); // 核心-5
        abilities
    }

    #[test]
    /// 测试小属性变化零件
    fun test_small_stat_changes() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            // 创建必要的对象
            let mut pool = robot::create_robot_pool(ctx(test));
            let game_config = config::create_config(ctx(test));
            let mut robot = robot::create_robot(
                string::utf8(b"Test Robot"),
                &mut pool,
                ctx(test)
            );
            
            // 记录初始属性
            let initial_attack = robot::get_robot_attack(&robot);
            let initial_defense = robot::get_robot_defense(&robot);
            
            // 创建并装备一个小幅增加攻击的零件
            let element = element::create_element(
                string::utf8(b"Small Attack Element"),
                string::utf8(b"Small Attack Element Description"),
                create_small_attack_abilities(),
                ctx(test)
            );
            
            // 装备零件
            robot::equip_element(&mut robot, element, &mut pool, &game_config);
            
            // 验证属性变化（攻击+5，防御-5）
            assert!(robot::get_robot_attack(&robot) == initial_attack + 5, 0);
            assert!(robot::get_robot_defense(&robot) == initial_defense - 5, 1);
            
            // 卸下零件
            let (_, element_id) = robot::get_element_and_id_at(&robot, 0);
            let element = robot::unequip_element_by_id(&mut robot, element_id, &mut pool);
            
            // 验证属性恢复
            assert!(robot::get_robot_attack(&robot) == initial_attack, 2);
            assert!(robot::get_robot_defense(&robot) == initial_defense, 3);
            
            transfer::public_transfer(robot, ZERO_ADDRESS);
            transfer::public_transfer(pool, ZERO_ADDRESS);
            transfer::public_transfer(game_config, ZERO_ADDRESS);
            element::delete_element(element);
        };
        test::end(scenario);
    }

    #[test]
    /// 测试大属性变化零件
    fun test_large_stat_changes() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            // 创建必要的对象
            let mut pool = robot::create_robot_pool(ctx(test));
            let game_config = config::create_config(ctx(test));
            let mut robot = robot::create_robot(
                string::utf8(b"Test Robot"),
                &mut pool,
                ctx(test)
            );
            
            // 记录初始属性
            let initial_attack = robot::get_robot_attack(&robot);
            let initial_defense = robot::get_robot_defense(&robot);
            
            // 创建并装备一个大幅增加攻击的零件
            let element = element::create_element(
                string::utf8(b"Large Attack Element"),
                string::utf8(b"Large Attack Element Description"),
                create_large_attack_abilities(),
                ctx(test)
            );
            
            // 装备零件
            robot::equip_element(&mut robot, element, &mut pool, &game_config);
            
            // 验证属性变化（攻击+50，防御-50）
            assert!(robot::get_robot_attack(&robot) == initial_attack + 50, 0);
            assert!(robot::get_robot_defense(&robot) == initial_defense - 50, 1);
            
            // 卸下零件
            let (_, element_id) = robot::get_element_and_id_at(&robot, 0);
            let element = robot::unequip_element_by_id(&mut robot, element_id, &mut pool);
            
            // 验证属性恢复
            assert!(robot::get_robot_attack(&robot) == initial_attack, 2);
            assert!(robot::get_robot_defense(&robot) == initial_defense, 3);
            
            transfer::public_transfer(robot, ZERO_ADDRESS);
            transfer::public_transfer(pool, ZERO_ADDRESS);
            transfer::public_transfer(game_config, ZERO_ADDRESS);
            element::delete_element(element);
        };
        test::end(scenario);
    }

    #[test]
    /// 测试多个不同类型零件的组合效果
    fun test_multiple_element_types_combination() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            // 创建必要的对象
            let mut pool = robot::create_robot_pool(ctx(test));
            let game_config = config::create_config(ctx(test));
            let mut robot = robot::create_robot(
                string::utf8(b"Test Robot"),
                &mut pool,
                ctx(test)
            );
            
            // 记录初始属性
            let initial_attack = robot::get_robot_attack(&robot);
            let initial_defense = robot::get_robot_defense(&robot);
            let initial_energy = robot::get_robot_energy(&robot);
            
            // 创建不同类型的零件
            let small_attack = element::create_element(
                string::utf8(b"Small Attack"),
                string::utf8(b"Small Attack Description"),
                create_small_attack_abilities(),
                ctx(test)
            );
            let large_attack = element::create_element(
                string::utf8(b"Large Attack"),
                string::utf8(b"Large Attack Description"),
                create_large_attack_abilities(),
                ctx(test)
            );
            let energy = element::create_element(
                string::utf8(b"Energy"),
                string::utf8(b"Energy Description"),
                create_energy_abilities(),
                ctx(test)
            );
            
            // 装备小幅攻击零件
            robot::equip_element(&mut robot, small_attack, &mut pool, &game_config);
            assert!(robot::get_robot_attack(&robot) == initial_attack + 5, 0);
            assert!(robot::get_robot_defense(&robot) == initial_defense - 5, 1);
            assert!(robot::get_robot_energy(&robot) == initial_energy - 5, 2); // 能量-5
            
            // 装备大幅攻击零件
            robot::equip_element(&mut robot, large_attack, &mut pool, &game_config);
            assert!(robot::get_robot_attack(&robot) == initial_attack + 55, 3); // +5 +50
            assert!(robot::get_robot_defense(&robot) == initial_defense - 55, 4); // -5 -50
            assert!(robot::get_robot_energy(&robot) == initial_energy - 55, 5); // -5 -50
            
            // 装备能量型零件
            robot::equip_element(&mut robot, energy, &mut pool, &game_config);
            assert!(robot::get_robot_attack(&robot) == initial_attack + 50, 6); // +5 +50 -5
            assert!(robot::get_robot_defense(&robot) == initial_defense - 60, 7); // -5 -50 -5
            assert!(robot::get_robot_energy(&robot) == initial_energy - 50, 8); // -5 -50 +5
            
            // 卸下所有零件
            let (_, element_id1) = robot::get_element_and_id_at(&robot, 0);
            let (_, element_id2) = robot::get_element_and_id_at(&robot, 1);
            let (_, element_id3) = robot::get_element_and_id_at(&robot, 2);
            
            let element1 = robot::unequip_element_by_id(&mut robot, element_id1, &mut pool);
            let element2 = robot::unequip_element_by_id(&mut robot, element_id2, &mut pool);
            let element3 = robot::unequip_element_by_id(&mut robot, element_id3, &mut pool);
            
            // 验证属性完全恢复
            assert!(robot::get_robot_attack(&robot) == initial_attack, 9);
            assert!(robot::get_robot_defense(&robot) == initial_defense, 10);
            assert!(robot::get_robot_energy(&robot) == initial_energy, 11);
            
            transfer::public_transfer(robot, ZERO_ADDRESS);
            transfer::public_transfer(pool, ZERO_ADDRESS);
            transfer::public_transfer(game_config, ZERO_ADDRESS);
            element::delete_element(element1);
            element::delete_element(element2);
            element::delete_element(element3);
        };
        test::end(scenario);
    }

    #[test]
    /// 测试属性溢出保护（上限255）
    fun test_stat_overflow_protection() {
        let mut scenario = setup_test();
        let test = &mut scenario;
        
        next_tx(test, ALICE);
        {
            // 创建必要的对象
            let mut pool = robot::create_robot_pool(ctx(test));
            let game_config = config::create_config(ctx(test));
            let mut robot = robot::create_robot(
                string::utf8(b"Test Robot"),
                &mut pool,
                ctx(test)
            );
            
            // 记录初始属性
            let initial_attack = robot::get_robot_attack(&robot);
            
            // 创建并装备多个大幅增加攻击的零件
            let element1 = element::create_element(
                string::utf8(b"Large Attack 1"),
                string::utf8(b"Large Attack 1 Description"),
                create_large_attack_abilities(),
                ctx(test)
            );
            let element2 = element::create_element(
                string::utf8(b"Large Attack 2"),
                string::utf8(b"Large Attack 2 Description"),
                create_large_attack_abilities(),
                ctx(test)
            );
            let element3 = element::create_element(
                string::utf8(b"Large Attack 3"),
                string::utf8(b"Large Attack 3 Description"),
                create_large_attack_abilities(),
                ctx(test)
            );
            
            // 装备零件
            robot::equip_element(&mut robot, element1, &mut pool, &game_config);
            robot::equip_element(&mut robot, element2, &mut pool, &game_config);
            robot::equip_element(&mut robot, element3, &mut pool, &game_config);
            
            // 验证攻击力不会超过255
            assert!(robot::get_robot_attack(&robot) == 255, 0);
            
            // 卸下所有零件
            let (_, element_id1) = robot::get_element_and_id_at(&robot, 0);
            let (_, element_id2) = robot::get_element_and_id_at(&robot, 1);
            let (_, element_id3) = robot::get_element_and_id_at(&robot, 2);
            
            let element1 = robot::unequip_element_by_id(&mut robot, element_id1, &mut pool);
            let element2 = robot::unequip_element_by_id(&mut robot, element_id2, &mut pool);
            let element3 = robot::unequip_element_by_id(&mut robot, element_id3, &mut pool);
            
            // 验证属性恢复到初始值
            assert!(robot::get_robot_attack(&robot) == initial_attack, 1);
            
            transfer::public_transfer(robot, ZERO_ADDRESS);
            transfer::public_transfer(pool, ZERO_ADDRESS);
            transfer::public_transfer(game_config, ZERO_ADDRESS);
            element::delete_element(element1);
            element::delete_element(element2);
            element::delete_element(element3);
        };
        test::end(scenario);
    }
} 