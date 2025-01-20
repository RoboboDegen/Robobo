module robobo::element {
    use std::string::String;
    // Weapon, Armor, Engine, Power, Core
    /// 零件属性数量 (攻击力[0], 防御力[1], 速度[2], 能量[3], 核心[4])
    const ABILITY_SIZE: u64 = 5;
    /// 属性基准值: >128表示提升, <128表示降低
    const ABILITY_THRESHOLD: u8 = 128;

    const EAbilitySizeNotEqual: u64 = 0;
    const EAbilityThresholdNotEqual: u64 = 128;

    public struct Element has key, store {
        id: UID,
        name: String,
        description: String,
        /// 属性数组，长度固定为5:
        /// - abilities[0]: 攻击力
        /// - abilities[1]: 防御力
        /// - abilities[2]: 速度
        /// - abilities[3]: 能量
        /// - abilities[4]: 核心
        abilities: vector<u8>,
    }

    public(package) fun create_element(
        name: String,
        description: String,
        abilities: vector<u8>,
        ctx: &mut TxContext
    ): Element {
        // Check if abilities vector has correct size
        let ability_size = vector::length(&abilities);
        assert!(ability_size == ABILITY_SIZE, EAbilitySizeNotEqual);

        // Count abilities above threshold
        let mut count_above_threshold = 0;
        let mut i = 0;
        while (i < ABILITY_SIZE) {
            if (abilities[i] >= ABILITY_THRESHOLD) {
                count_above_threshold = count_above_threshold + 1;
            };
            i = i + 1;
        };

        // Verify exactly one ability is above threshold
        assert!(count_above_threshold == 1, EAbilityThresholdNotEqual);

        // Create and return element
        Element {
            id: object::new(ctx),
            name,
            description,
            abilities,
        }
    }

    public(package) fun delete_element(element: Element) {
        let Element {id, abilities: abilities_vec, ..} = element;
        object::delete(id);
        vector::destroy!(abilities_vec, |_| {});
    }

    /// 获取零件的能力值列表
    public fun get_element_abilities(element: &Element): vector<u8> {
        *&element.abilities
    }

    /// 获取零件的ID
    public fun get_element_id(element: &Element): ID {
        object::uid_to_inner(&element.id)
    }

    public fun get_element_name(element: &Element): String {
        element.name
    }

    public fun get_element_description(element: &Element): String {
        element.description
    }
}
