module robobo::calculate {
    /// Calculates balanced robot stats for turn-based combat based on a name hash
    /// 
    /// # Arguments
    /// * `name_hash` - A 32-byte vector representing the hash of robot's name
    /// 
    /// # Returns
    /// Returns a tuple of (attack, defense, speed, energy, personality)
    /// Each stat is centered around 128 (zero point):
    /// * Energy (HP): 168-188 (40-60 points above zero)
    /// * Attack: 143-153 (15-25 points above zero)
    /// * Defense: 143-153 (15-25 points above zero)
    /// * Speed: 133-138 (5-10 points above zero)
    /// * Personality: 128-228 (0-100 range above zero)
    public fun calculate_robot_stats_from_hash(name_hash: vector<u8>): (u8, u8, u8, u8, u8) {
        // Base point for all stats, actual value = stat - 128
        let zero_point = 128;
        
        // Define minimum values and ranges for each stat
        // Each stat will be: zero_point + min + (hash_based_random * range) / 255
        let energy_min = 40;
        let energy_range = 20;     // Results in 40-60 points above zero
        let attack_min = 15;
        let attack_range = 10;     // Results in 15-25 points above zero
        let defense_min = 15;
        let defense_range = 10;    // Results in 15-25 points above zero
        let speed_min = 5;
        let speed_range = 5;       // Results in 5-10 points above zero

        // Convert hash bytes to u64 vector for safer arithmetic
        let mut bytes = vector<u64>[];
        let mut i = 0;
        while (i < name_hash.length()) {
            vector::push_back(&mut bytes, name_hash[i] as u64);
            i = i + 1;
        };

        // Calculate stats using specific bytes from the hash
        // For each stat, we:
        // 1. Take 4 bytes from different positions in the hash
        // 2. Sum them to get a more distributed random value
        // 3. Multiply by the stat's range and divide by 255 to get a value within range
        // 4. Add zero_point and minimum value to get final stat
        let energy = zero_point + energy_min + 
            ((bytes[0] + bytes[8] + bytes[16] + bytes[24]) * energy_range) / 255;

        let attack = zero_point + attack_min + 
            ((bytes[1] + bytes[9] + bytes[17] + bytes[25]) * attack_range) / 255;

        let defense = zero_point + defense_min + 
            ((bytes[2] + bytes[10] + bytes[18] + bytes[26]) * defense_range) / 255;

        let speed = zero_point + speed_min + 
            ((bytes[3] + bytes[11] + bytes[19] + bytes[27]) * speed_range) / 255;

        // Personality uses same pattern but with 0-100 range
        // Ensure we don't overflow u8 by scaling down the sum first
        let personality = zero_point + 
            ((bytes[4] + bytes[12] + bytes[20] + bytes[28]) / 4 * 100) / 255;

        // Convert final u64 values to u8 (safe as all results are within 0-255 range)
        (attack as u8, defense as u8, speed as u8, energy as u8, personality as u8)
    }

    fun process_action(
        actor_energy: &mut u8,
        target_energy: &mut u8,
        move_value: u8,
        attack: u8,
        defense: u8,
        personality: u8,
        is_attacker: bool
    ) {
        // 根据move_value决定行动类型
        if (move_value <= 3) {
            // 轻攻击: 较低伤害，较低能量消耗
            let damage = calculate_damage(attack as u64, 10, personality, true);
            *target_energy = *target_energy - damage;
            *actor_energy = *actor_energy - 2;
        } else if (move_value <= 6) {
            // 重攻击: 高伤害，高能量消耗
            let damage = calculate_damage(attack as u64, 20, personality, true);
            *target_energy = *target_energy - damage;
            *actor_energy = *actor_energy - 4;
        } else if (move_value <= 8) {
            // 防御: 恢复能量，增加防御
            let recovery = calculate_damage(defense as u64, 15, personality, false);
            *actor_energy = *actor_energy + recovery;
        } else {
            // 特殊技能: 基于personality的独特效果
            if (personality >= 50) {
                // 攻击型特殊技能
                let damage = calculate_damage(attack as u64, 25, personality, true);
                *target_energy = *target_energy - damage;
                *actor_energy = *actor_energy - 5;
            } else {
                // 防御型特殊技能
                let recovery = calculate_damage(defense as u64, 20, personality, false);
                *actor_energy = *actor_energy + recovery;
            };
        };
    }

    fun calculate_damage(base_stat: u64, multiplier: u64, personality: u8, is_attack: bool): u8 {
        let personality_modifier = if (is_attack) {
            // 攻击型动作：高personality加成，但限制在1-2之间
            ((personality as u64) * 1) / 100 + 1  // 降低personality的影响
        } else {
            // 防御型动作：低personality加成
            ((100 - (personality as u64)) * 1) / 100 + 1  // 降低personality的影响
        };
        
        // 验证计算过程，防止溢出
        // 1. base_stat 范围检查 (attack/defense 在143-153之间)
        let safe_base = if (base_stat > 153) { 153 } else { base_stat };
        
        // 2. multiplier 范围检查 (调整乘数范围)
        // 轻攻击(10) -> 3-5点伤害
        // 重攻击(20) -> 6-10点伤害
        // 防御(15) -> 3-6点恢复
        // 特殊技能(25) -> 8-12点伤害/恢复
        let safe_multiplier = if (multiplier > 25) { 25 } else { multiplier };
        
        // 3. 分步计算
        let step1 = (safe_base - 128) * safe_multiplier; // 将基础属性转换为实际值(15-25)后计算
        let step2 = step1 * personality_modifier; // personality影响降低
        let final_value = step2 / 100; // 最终值控制在合理范围
        
        if (is_attack) {
            // 攻击情况：确保伤害在合理范围（128+3 到 128+12）
            let damage = if (final_value < 3) {
                3  // 最小伤害3点
            } else if (final_value > 12) {
                12 // 最大伤害12点
            } else {
                final_value
            };
            (128 + damage as u8)
        } else {
            // 防御情况：确保恢复量在合理范围（3-6点）
            let heal = if (final_value < 3) {
                3  // 最小恢复3点
            } else if (final_value > 6) {
                6  // 最大恢复6点
            } else {
                final_value
            };
            (heal as u8)
        }
    }

    fun split_and_convert_hash(hash: vector<u8>): (vector<u8>, vector<u8>) {
        let len = vector::length(&hash);
        let mut attacker_moves = vector::empty<u8>();
        let mut defender_moves = vector::empty<u8>();
        
        let mut i = 0;
        while (i < len) {
            let num = hash[i] % 10; // 转换为0-9的数字
            if (i < 16) {
                vector::push_back(&mut attacker_moves, num);
            } else {
                vector::push_back(&mut defender_moves, num);
            };
            i = i + 1;
        };
        
        (attacker_moves, defender_moves)
    }

    fun calculate_initiative(speed: u64, move_value: u8): u64 {
        // 将move_value(0-9)转换为加成值
        let move_bonus = (move_value as u64) * 10; // 将0-9转换为0-90的加成
        speed + move_bonus // 速度+行动值决定最终先攻值
    }

    public fun calculate_battle_result(battle_hash: vector<u8>, attacker_energy: &mut u8, defender_energy: &mut u8, attacker_attack: u8, attacker_defense: u8, attacker_speed: u8, attacker_personality: u8, defender_attack: u8, defender_defense: u8, defender_speed: u8, defender_personality: u8): (bool, u8, u8) {
        let (attacker_moves, defender_moves) = split_and_convert_hash(battle_hash);

        let mut isFighting = true;
        let mut round = 0;
        while (isFighting) {
            if(*attacker_energy <= 127 || *defender_energy <= 127) {
                isFighting = false;
                break
            };
            
            if(round == 16){
                round = 0;
            };
            
            // 计算本回合的行动顺序
            // 将速度和moves结合来决定行动顺序
            let attacker_initiative = calculate_initiative(attacker_speed as u64, attacker_moves[round]);
            let defender_initiative = calculate_initiative(defender_speed as u64, defender_moves[round]);
            
            // 根据initiative决定行动顺序并执行行动
            if (attacker_initiative >= defender_initiative) {
                // 攻击者先行动
                process_action(
                    attacker_energy,
                    defender_energy,
                    attacker_moves[round],
                    attacker_attack,
                    attacker_defense,
                    attacker_personality,
                    true
                );
                
                // 如果防御者还活着，则进行反击
                if (*defender_energy > 128) {
                    process_action(
                        defender_energy,
                        attacker_energy,
                        defender_moves[round],
                        defender_attack,
                        defender_defense,
                        defender_personality,
                        false
                    );
                };
            } else {
                // 防御者先行动
                process_action(
                    defender_energy,
                    attacker_energy,
                    defender_moves[round],
                    defender_attack,
                    defender_defense,
                    defender_personality,
                    false
                );
                
                // 如果攻击者还活着，则进行反击
                if (*attacker_energy > 128) {
                    process_action(
                        attacker_energy,
                        defender_energy,
                        attacker_moves[round],
                        attacker_attack,
                        attacker_defense,
                        attacker_personality,
                        true
                    );
                };
            };
            
            // 每回合基础能量消耗
            *attacker_energy = *attacker_energy - 1;
            *defender_energy = *defender_energy - 1;
            round = round + 1;
        };

        // 计算战斗结果
        let attacker_final_energy = *attacker_energy;
        let defender_final_energy = *defender_energy;
        let winner = if (*attacker_energy > *defender_energy) { true } else { false };
        (winner, attacker_final_energy, defender_final_energy)
    }
}
    