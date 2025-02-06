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
        // 2. Sum them and normalize by dividing by (255 * 4) to get a value between 0-1
        // 3. Multiply by the stat's range to get a value within range
        // 4. Add zero_point and minimum value to get final stat
        let energy = zero_point + energy_min + 
            ((bytes[0] + bytes[8] + bytes[16] + bytes[24]) * energy_range) / (255 * 4);

        let attack = zero_point + attack_min + 
            ((bytes[1] + bytes[9] + bytes[17] + bytes[25]) * attack_range) / (255 * 4);

        let defense = zero_point + defense_min + 
            ((bytes[2] + bytes[10] + bytes[18] + bytes[26]) * defense_range) / (255 * 4);

        let speed = zero_point + speed_min + 
            ((bytes[3] + bytes[11] + bytes[19] + bytes[27]) * speed_range) / (255 * 4);

        // Personality uses same pattern but with 0-100 range
        let personality = zero_point + 
            ((bytes[4] + bytes[12] + bytes[20] + bytes[28]) * 100) / (255 * 4);

        // Convert final u64 values to u8 (safe as all results are within 0-255 range)
        (attack as u8, defense as u8, speed as u8, energy as u8, personality as u8)
    }
    /// 处理行动
    /// 
    /// # Arguments
    /// * `actor_energy` - 行动者的能量
    /// * `target_energy` - 目标的能量
    /// * `move_value` - 行动值
    /// * `attack` - 攻击力
    /// * `defense` - 防御力
    /// * `personality` - 个性
    /// 具体逻辑是：
    /// 1. 如果行动者的能量小于等于129，则触发特殊攻击
    /// 2. 如果行动者的能量大于129，则扣除1点能量
    /// 3. 根据行动值和攻击力计算伤害
    /// 4. 根据防御力和个性计算恢复量
    /// 5. 根据行动值和防御力计算防御量
    /// 6. 根据行动值和个性计算特殊技能量
    fun process_action(
        actor_energy: &mut u8,
        target_energy: &mut u8,
        move_value: u8,
        attack: u8,
        defense: u8,
        personality: u8
    ) {
        let zero_point = 128;
        let max_energy = 188;

        // If attacker energy is less than or equal to 129, trigger special attack
        if (*actor_energy <= 129) {
            if (personality >= 178) {
                // Attack-type special skill: only deals damage, no energy cost
                let damage = calculate_damage(attack as u64, 25, personality, true);
                let actual_damage = damage - zero_point;
                *target_energy = if (*target_energy > zero_point + actual_damage) {
                    *target_energy - actual_damage
                } else {
                    zero_point
                };
            } else {
                // Defense-type special skill: recovers health
                let recovery = calculate_damage(defense as u64, 20, personality, false);
                *actor_energy = if (*actor_energy + recovery <= max_energy) {
                    *actor_energy + recovery
                } else {
                    max_energy
                };
            };
        } else {
            //cost 1 energy when start action
            *actor_energy = *actor_energy - 1;
            if (move_value <= 3) {
                // Light attack: only deals damage, no energy cost
                let damage = calculate_damage(attack as u64, 10, personality, true);
                // Damage value already includes zero_point, need to subtract
                let actual_damage = damage - zero_point;
                *target_energy = if (*target_energy > zero_point + actual_damage) {
                    *target_energy - actual_damage
                } else {
                    zero_point
                };
            } else if (move_value <= 6) {
                // Heavy attack: only deals damage, no energy cost
                let damage = calculate_damage(attack as u64, 20, personality, true);
                let actual_damage = damage - zero_point;
                *target_energy = if (*target_energy > zero_point + actual_damage) {
                    *target_energy - actual_damage
                } else {
                    zero_point
                };
            } else if (move_value <= 8) {
                // Defense: recovers health
                let recovery = calculate_damage(defense as u64, 15, personality, false);
                *actor_energy = if (*actor_energy + recovery <= max_energy) {
                    *actor_energy + recovery
                } else {
                    max_energy
                };
            } else {
                if (personality >= 178) {
                    // Attack-type special skill: only deals damage, no energy cost
                    let damage = calculate_damage(attack as u64, 25, personality, true);
                    let actual_damage = damage - zero_point;
                    *target_energy = if (*target_energy > zero_point + actual_damage) {
                        *target_energy - actual_damage
                    } else {
                        zero_point
                    };
                } else {
                    // Defense-type special skill: recovers health
                    let recovery = calculate_damage(defense as u64, 20, personality, false);
                    *actor_energy = if (*actor_energy + recovery <= max_energy) {
                        *actor_energy + recovery
                    } else {
                        max_energy
                    };
                };
            };
        };
    }

    /// 计算伤害
    /// 
    /// # Arguments
    /// * `base_stat` - 基础属性
    /// * `multiplier` - 乘数
    /// * `personality` - 个性
    /// * `is_attack` - 是否是攻击
    /// 具体逻辑是：
    /// 1. 根据个性计算加成
    /// 2. 根据基础属性和乘数计算伤害
    /// 3. 根据个性计算加成
    fun calculate_damage(base_stat: u64, multiplier: u64, personality: u8, is_attack: bool): u8 {
        let personality_modifier = if (is_attack) {
            // 攻击型动作：高personality加成，但限制在1-2之间
            (personality as u64 - 128) / 100 + 1  // 降低personality的影响
        } else {
            // 防御型动作：低personality加成
            ((228 - personality as u64)) / 100 + 1  // 降低personality的影响
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
    /// 分割hash并转换为行动值
    /// 
    /// # Arguments
    /// * `hash` - 战斗hash
    /// 具体逻辑是：
    /// 1. 分割hash为攻击者和防守者的行动值
    /// 2. 根据行动值计算防御次数
    /// 3. 根据防御次数转换行动值   
    fun split_and_convert_hash(hash: vector<u8>): (vector<u8>, vector<u8>) {
        let mut attacker_moves = vector::empty<u8>();
        let mut defender_moves = vector::empty<u8>();
        
        // 分别计数攻击者和防守者的防御次数
        let mut attacker_defense_count = 0;
        let mut defender_defense_count = 0;
        
        // 处理攻击者的行动 (0-15) 防止防御次数超过3次
        let mut i = 0;
        while (i < 16) {
            let mut num = hash[i] % 10;
            if (num >= 7 && num <= 8) {
                attacker_defense_count = attacker_defense_count + 1;
                if (attacker_defense_count > 3) {
                    num = num % 4; // 转换为轻攻击(0-3)
                };
            };
            vector::push_back(&mut attacker_moves, num);
            i = i + 1;
        };
        
        // 处理防守者的行动 (16-31) 防止防御次数超过3次
        let mut j = 16;
        while (j < 32) {
            let mut num = hash[j] % 10;
            if (num >= 7 && num <= 8) {
                defender_defense_count = defender_defense_count + 1;
                if (defender_defense_count > 3) {
                    num = num % 4; // 转换为轻攻击(0-3)
                };
            };
            vector::push_back(&mut defender_moves, num);
            j = j + 1;
        };
        
        (attacker_moves, defender_moves)
    }
    /// 计算先攻值
    /// 
    /// # Arguments
    /// * `speed` - 速度
    /// * `move_value` - 行动值
    /// 具体逻辑是：
    /// 1. 将行动值转换为加成值
    /// 2. 速度+行动值决定最终先攻值
    fun calculate_initiative(speed: u64, move_value: u8): u64 {
        // 将move_value(0-9)转换为加成值
        let move_bonus = (move_value as u64) * 10; // 将0-9转换为0-90的加成
        speed + move_bonus // 速度+行动值决定最终先攻值
    }
    /// 计算战斗结果
    /// 
    /// # Arguments
    /// * `battle_hash` - 战斗hash
    /// * `attacker_energy` - 攻击者能量
    /// * `defender_energy` - 防守者能量
    /// * `attacker_attack` - 攻击者攻击力
    /// * `attacker_defense` - 攻击者防御力
    /// * `attacker_speed` - 攻击者速度
    /// * `attacker_personality` - 攻击者个性
    /// * `defender_attack` - 防守者攻击力
    /// * `defender_defense` - 防守者防御力
    /// * `defender_speed` - 防守者速度
    /// * `defender_personality` - 防守者个性
    /// 具体逻辑是：
    /// 1. 分割hash并转换为行动值
    /// 2. 根据行动值计算防御次数
    /// 3. 根据防御次数转换行动值
    /// 4. 根据先攻值计算行动顺序
    /// 5. 根据行动顺序处理行动
    /// 6. 根据行动结果计算战斗结果
    #[allow(unused_trailing_semi)]
    public fun calculate_battle_result(battle_hash: vector<u8>, attacker_energy: &mut u8, defender_energy: &mut u8, attacker_attack: u8, attacker_defense: u8, attacker_speed: u8, attacker_personality: u8, defender_attack: u8, defender_defense: u8, defender_speed: u8, defender_personality: u8): (bool, u8, u8) {

        let (attacker_moves, defender_moves) = split_and_convert_hash(battle_hash);

        let zero_point = 128;
        let mut round = 0;
        while (true) {
            if(*attacker_energy <= 128 || *defender_energy <= 128) {
                break;
            };
            if (round == 16) {
                round = 0;
            };
            
            // 计算本回合的行动顺序
            let attacker_initiative = calculate_initiative(attacker_speed as u64, attacker_moves[round]);
            let defender_initiative = calculate_initiative(defender_speed as u64, defender_moves[round]);
            
            if (attacker_initiative >= defender_initiative) {
                // 攻击者先行动
                process_action(
                    attacker_energy,
                    defender_energy,
                    attacker_moves[round],
                    attacker_attack,
                    attacker_defense,
                    attacker_personality
                );                 
                // 立即检查防守方能量
                if (*defender_energy <= zero_point) {
                    *defender_energy = zero_point;
                    break;
                };                
                // 防守方反击
                process_action(
                    defender_energy,
                    attacker_energy,
                    defender_moves[round],
                    defender_attack,
                    defender_defense,
                    defender_personality
                ); 
                // 检查攻击方能量
                if (*attacker_energy <= zero_point) {
                    *attacker_energy = zero_point;
                    break;
                };
            } else {
                // 防守方先行动
                process_action(
                    defender_energy,
                    attacker_energy,
                    defender_moves[round],
                    defender_attack,
                    defender_defense,
                    defender_personality
                );                
                // 检查攻击方能量
                if (*attacker_energy <= zero_point) {
                    *attacker_energy = zero_point;
                    break;
                };                
                // 攻击方反击
                process_action(
                    attacker_energy,
                    defender_energy,
                    attacker_moves[round],
                    attacker_attack,
                    attacker_defense,
                    attacker_personality
                );                
                // 检查攻击方能量
                if (*attacker_energy <= zero_point) {
                    *attacker_energy = zero_point;
                    break;
                };
            };           
            
            round = round + 1;
        };        
        let winner = *attacker_energy > *defender_energy;
        (winner, *attacker_energy, *defender_energy)
    }
}
    