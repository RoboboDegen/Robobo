module robobo::user {
    use std::string::String;
    use sui::{
        clock::{Self, Clock},
    };

    const E_ROBOT_EXISTS: u64 = 0;
    const E_ELEMENT_EXISTS: u64 = 1;
    const E_ROBOT_NOT_EXISTS: u64 = 2;
    const E_ELEMENT_NOT_EXISTS: u64 = 3;

    public struct Passport has key {
        id: UID,
        name: String,
        robots: vector<ID>,
        elements: vector<ID>,
        last_mint_token_time: u64,
    }

    public(package) fun mint(name: String, clock: &Clock, ctx: &mut TxContext): Passport {
        let passport = Passport {
            id: object::new(ctx),
            name,
            robots: vector::empty(),
            elements: vector::empty(),
            last_mint_token_time: clock::timestamp_ms(clock),
        };
        passport
    }

    public fun edit_name(passport: &mut Passport, name: String) {
        passport.name = name;
    }

    public(package) fun update_last_mint_token_time(passport: &mut Passport, clock: &Clock) {
        passport.last_mint_token_time = clock::timestamp_ms(clock);
    }

    public(package) fun add_robot(passport: &mut Passport, robot: ID) {
        assert!(!vector::contains(&passport.robots, &robot), E_ROBOT_EXISTS);
        vector::push_back(&mut passport.robots, robot);
    }

    public(package) fun add_element(passport: &mut Passport, element: ID) {
        assert!(!vector::contains(&passport.elements, &element), E_ELEMENT_EXISTS);
        vector::push_back(&mut passport.elements, element);
    }

    public(package) fun remove_robot(passport: &mut Passport, robot: ID) {
        let (contains, index) = vector::index_of(&passport.robots, &robot);
        assert!(contains, E_ROBOT_NOT_EXISTS);
        vector::remove(&mut passport.robots, index);
    }

    public(package) fun remove_element(passport: &mut Passport, element: ID) {
        let (contains, index) = vector::index_of(&passport.elements, &element);
        assert!(contains, E_ELEMENT_NOT_EXISTS);
        vector::remove(&mut passport.elements, index);
    }
}