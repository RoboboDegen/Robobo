module robobo::battle {
    use robobo::robot::{Robot, Robot_Pool, get_robot_personality, get_robot_mirror_personality};
    use sui::{
        clock::{Self, Clock},
        hash,
    };

    public fun start_battle(
        attacker: &mut Robot, 
        defender: ID, 
        clock: &Clock, 
        pool: &mut Robot_Pool) {
        let mut battle_timestamp = clock::timestamp_ms(clock).to_string();
        let attacker_personality = get_robot_personality(attacker);
        let defender_personality = get_robot_mirror_personality(defender, pool);
        battle_timestamp.append(attacker_personality);
        battle_timestamp.append(defender_personality);
        let battle_hash = hash::keccak256(battle_timestamp.as_bytes());
        //todo: calculate battle flow & result
    }
}
