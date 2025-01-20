module robobo::element {
    use std::string::String;

    // Weapon, Armor, Engine, Power, Core
    const ABILITY_SIZE: u64 = 5;
    const ABILITY_THRESHOLD: u8 = 128;

    const EAbilitySizeNotEqual: u64 = 0;
    const EAbilityThresholdNotEqual: u64 = 128;

    public struct Element has key, store {
        id: UID,
        name: String,
        abilities: vector<u8>,
    }

//game
    public(package) fun create_element(
        name: String,
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
            abilities,
        }
    }

    //game
    // 销毁
    public(package) fun delete_element(element: Element) {
        let Element {id, abilities: abilities_vec, ..} = element;
        object::delete(id);
        vector::destroy!(abilities_vec, |_| {});
    }
}
