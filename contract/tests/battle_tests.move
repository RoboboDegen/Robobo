#[test_only]
module robobo::battle_tests {
    use sui::{
        test_scenario::{Self as test, ctx},
        transfer,
        clock::{Self, Clock},
        object::ID
    };
    use std::string::{Self, String};
    use robobo::robot::{Self, Robot, Robot_Pool};
    use robobo::battle;

    const TEST_ADDR: address = @0x1;

    #[test]
    fun test_battle_result() {
        let mut scenario = test::begin(TEST_ADDR);
        
        // 创建两个测试机器人
        test::next_tx(&mut scenario, TEST_ADDR); {
            let ctx = test::ctx(&mut scenario);
            let mut pool = robot::create_robot_pool(ctx);
            let mut robot1 = robot::create_robot(string::utf8(b"Robot1"), &mut pool, ctx);
            let robot2 = robot::create_robot(string::utf8(b"Robot2"), &mut pool, ctx);
            let robot2_id = robot::get_robot_id(&robot2);
            
            // 创建时钟
            let clock = clock::create_for_testing(ctx);
            
            // 进行战斗
            let battle_result = battle::start_battle(&mut robot1, robot2_id, &clock, &pool);
            
            // 验证战斗结果
            assert!(battle::get_defender_id(&battle_result) == robot2_id, 1);
            assert!(battle::get_attacker_final_energy(&battle_result) > 0, 2);
            assert!(battle::get_defender_final_energy(&battle_result) > 0, 3);
            
            // 清理资源
            transfer::public_transfer(robot1, TEST_ADDR);
            transfer::public_transfer(robot2, TEST_ADDR);
            clock::destroy_for_testing(clock);
            transfer::public_share_object(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_battle_result_energy_range() {
        let mut scenario = test::begin(TEST_ADDR);
        
        test::next_tx(&mut scenario, TEST_ADDR); {
            let ctx = test::ctx(&mut scenario);
            let mut pool = robot::create_robot_pool(ctx);
            let mut robot1 = robot::create_robot(string::utf8(b"Robot1"), &mut pool, ctx);
            let robot2 = robot::create_robot(string::utf8(b"Robot2"), &mut pool, ctx);
            let robot2_id = robot::get_robot_id(&robot2);
            
            // 创建时钟
            let clock = clock::create_for_testing(ctx);
            
            // 进行战斗
            let battle_result = battle::start_battle(&mut robot1, robot2_id, &clock, &pool);
            
            // 验证能量值在合理范围内
            let attacker_energy = battle::get_attacker_final_energy(&battle_result);
            let defender_energy = battle::get_defender_final_energy(&battle_result);
            
            assert!(attacker_energy >= 0 && attacker_energy <= 128, 1);
            assert!(defender_energy >= 0 && defender_energy <= 128, 2);
            
            // 清理资源
            transfer::public_transfer(robot1, TEST_ADDR);
            transfer::public_transfer(robot2, TEST_ADDR);
            clock::destroy_for_testing(clock);
            transfer::public_share_object(pool);
        };
        test::end(scenario);
    }
} 