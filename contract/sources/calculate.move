module robobo::calculate;

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
    let personality = zero_point + 
        ((bytes[4] + bytes[12] + bytes[20] + bytes[28]) * 100) / 255;

    // Convert final u64 values to u8 (safe as all results are within 0-255 range)
    (attack as u8, defense as u8, speed as u8, energy as u8, personality as u8)
}
    