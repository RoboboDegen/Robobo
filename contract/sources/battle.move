module robobo::battle {
    use robobo::robot::{Robot, Robot_Pool, get_robot_stats, get_robot_mirror_stats};
    use sui::{
        clock::{Self, Clock},
        hash,
    };

    use robobo::calculate::{calculate_battle_result};

    public struct BattleResult has copy,drop {
        winner: bool,
        attacker_final_energy: u8,
        defender_final_energy: u8,
    }

    public fun start_battle(
        attacker: &mut Robot, 
        defender: ID, 
        clock: &Clock, 
        pool: &mut Robot_Pool
    ): BattleResult {
        let mut battle_timestamp = clock::timestamp_ms(clock).to_string();
        let (attacker_attack, attacker_defense, attacker_speed, mut attacker_energy, attacker_personality) = get_robot_stats(attacker);
        let (defender_attack, defender_defense, defender_speed, mut defender_energy, defender_personality) = get_robot_mirror_stats(defender, pool);   
        
        battle_timestamp.append(attacker_personality.to_string());
        battle_timestamp.append(defender_personality.to_string());
        let battle_hash = hash::keccak256(battle_timestamp.as_bytes());
        
        let (winner, attacker_final_energy, defender_final_energy) = calculate_battle_result(battle_hash, &mut attacker_energy, &mut defender_energy, attacker_attack, attacker_defense, attacker_speed, attacker_personality, defender_attack, defender_defense, defender_speed, defender_personality);

        let battle_result = BattleResult {
            winner: winner,
            attacker_final_energy: attacker_final_energy,
            defender_final_energy: defender_final_energy,
        };

        battle_result
    }
}
