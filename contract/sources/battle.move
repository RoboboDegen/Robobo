module robobo::battle {
    use sui::{
        event,
        random::{Self, Random},
        clock::{Self, Clock},
        hash,
    };
    use robobo::calculate::calculate_battle_result;
    use robobo::robot::{Self, Robot, Robot_Pool};
    use robobo::trash::{Self, TrashTokenCap};
    use robobo::config::{Self, GameConfig};

    use robobo::robot::{get_robot_stats, get_robot_mirror_stats, set_robot_energy};

    public struct BattleResult has copy,drop {
        winner: bool,
        attacker_final_energy: u8,
        defender_final_energy: u8,
        defender_id: ID
    }

    public(package) fun start_battle(
        attacker: &mut Robot, 
        defender: ID, 
        clock: &Clock, 
        pool: &Robot_Pool
    ): BattleResult {
        let mut battle_timestamp = clock::timestamp_ms(clock).to_string();
        let (attacker_attack, attacker_defense, attacker_speed, mut attacker_energy, attacker_personality) = get_robot_stats(attacker);
        let (defender_attack, defender_defense, defender_speed, mut defender_energy, defender_personality) = get_robot_mirror_stats(defender, pool);   
        
        battle_timestamp.append(attacker_personality.to_string());
        battle_timestamp.append(defender_personality.to_string());
        let battle_hash = hash::keccak256(battle_timestamp.as_bytes());
        
        let (winner, attacker_final_energy, defender_final_energy) = calculate_battle_result(battle_hash, &mut attacker_energy, &mut defender_energy, attacker_attack, attacker_defense, attacker_speed, attacker_personality, defender_attack, defender_defense, defender_speed, defender_personality);

        if(winner) {
            set_robot_energy(attacker, attacker_final_energy);
        } else {
            set_robot_energy(attacker, 128);
        };

        let battle_result = BattleResult {
            winner,
            attacker_final_energy,
            defender_final_energy,
            defender_id: defender
        };

        battle_result
    }
    // 战斗奖励事件
    public struct BattleRewardEvent has copy, drop {
        winner_id: ID,
        loser_id: ID,
        token_reward: u64,
        has_element_drop: bool,
        timestamp: u64
    }

    /// 从机器人池中随机选择一个对手
    public(package) fun select_random_opponent(
        robots: &vector<ID>, 
        current_robot: ID,
        random: &Random,
        ctx: &mut TxContext
    ): ID {
        let total_robots = vector::length(robots);
        assert!(total_robots > 1, 1); // Not enough robots for battle
        
        // 创建随机数生成器
        let mut rand_generator = random::new_generator(random, ctx);
        
        // 生成随机索引
        let random_index = random::generate_u64_in_range(&mut rand_generator, 0, total_robots - 1);
        
        let opponent_id = *vector::borrow(robots, random_index);
        if (opponent_id == current_robot) {
            // 如果选到自己，选择下一个机器人
            if (random_index == total_robots - 1) {
                *vector::borrow(robots, 0)
            } else {
                *vector::borrow(robots, random_index + 1)
            }
        } else {
            opponent_id
        }
    }

    /// 处理战斗奖励
    public(package) fun process_battle_rewards(
        robot: &Robot,
        battle_result: BattleResult,
        token_cap: &mut TrashTokenCap,
        random: &Random,
        clock: &Clock,
        game_config: &GameConfig,
        ctx: &mut TxContext
    ) {
        // 创建随机数生成器（无论胜负都创建，保证gas消耗一致）
        let mut rand_generator = random::new_generator(random, ctx);
        let random_num = random::generate_u64(&mut rand_generator);
        let has_element_drop = random_num % 5 == 0; // 20%概率
        
        if (is_winner(&battle_result)) {
            // 胜利奖励
            let reward = config::get_trash_amount_battle_reward(game_config);
            trash::mint(token_cap, reward, ctx);
        };
        
        // 发出战斗奖励事件（无论胜负都发出）
        event::emit(BattleRewardEvent {
            winner_id: if (is_winner(&battle_result)) { 
                robot::get_robot_id(robot) 
            } else { 
                get_defender_id(&battle_result) 
            },
            loser_id: if (is_winner(&battle_result)) { 
                get_defender_id(&battle_result) 
            } else { 
                robot::get_robot_id(robot) 
            },
            token_reward: if (is_winner(&battle_result)) { 
                config::get_trash_amount_battle_reward(game_config) 
            } else { 
                0 
            },
            has_element_drop: has_element_drop && is_winner(&battle_result),
            timestamp: clock::timestamp_ms(clock)
        });
    }


    public fun is_winner(result: &BattleResult): bool {
        result.winner
    }

    public fun get_attacker_final_energy(result: &BattleResult): u8 {
        result.attacker_final_energy
    }

    public fun get_defender_final_energy(result: &BattleResult): u8 {
        result.defender_final_energy
    }

    public fun get_defender_id(result: &BattleResult): ID {
        result.defender_id
    }
}
