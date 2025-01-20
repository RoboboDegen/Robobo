module robobo::user {
    use std::string::String;
    use sui::{ 
        object::{Self, UID, ID},
        tx_context::{Self, TxContext},
        transfer
    };
    use std::vector;

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

    public(package) fun mint(name: String, ctx: &mut TxContext): Passport {
        let passport = Passport {
            id: object::new(ctx),
            name,
            robots: vector::empty(),
            elements: vector::empty(),
            last_mint_token_time: tx_context::epoch_timestamp_ms(ctx),
        };
        passport
    }
    public fun get_passport_id(passport: &Passport): ID {
        passport.id.to_inner()
    }

    public fun edit_name(passport: &mut Passport, name:String){
        passport.name = name;
    }

    public(package) fun update_last_mint_token_time(passport: &mut Passport, ctx: &mut TxContext){
        passport.last_mint_token_time = tx_context::epoch_timestamp_ms(ctx);
    }

    public(package) fun add_robot(passport: &mut Passport, robot:ID){
        assert!(!vector::contains(&passport.robots, &robot), E_ROBOT_EXISTS);
        vector::push_back(&mut passport.robots, robot);
    }

    public(package) fun add_element(passport: &mut Passport, element:ID){
        assert!(!vector::contains(&passport.elements, &element), E_ELEMENT_EXISTS);
        vector::push_back(&mut passport.elements, element);
    }

    public(package) fun remove_robot(passport: &mut Passport, robot:ID){
        let (contains, index) = vector::index_of(&passport.robots, &robot);
        assert!(contains, E_ROBOT_NOT_EXISTS);
        vector::remove(&mut passport.robots, index);
    }

    public(package) fun remove_element(passport: &mut Passport, element:ID){
        let (contains, index) = vector::index_of(&passport.elements, &element);
        assert!(contains, E_ELEMENT_NOT_EXISTS);
        vector::remove(&mut passport.elements, index);
    }

    /// 获取用户名称
    public fun get_name(passport: &Passport): String {
        passport.name
    }

    /// 获取用户拥有的机器人总数
    public fun get_total_robots(passport: &Passport): u64 {
        vector::length(&passport.robots)
    }

    /// 获取用户拥有的元素总数
    public fun get_total_elements(passport: &Passport): u64 {
        vector::length(&passport.elements)
    }

    /// 获取用户拥有的所有机器人ID列表
    public fun get_robots(passport: &Passport): &vector<ID> {
        &passport.robots
    }

    /// 获取用户拥有的所有元素ID列表
    public fun get_elements(passport: &Passport): &vector<ID> {
        &passport.elements
    }

    /// 检查是否可以领取每日代币
    public fun can_claim_daily_token(passport: &Passport, ctx: &TxContext): bool {
        let current_time = tx_context::epoch_timestamp_ms(ctx);
        let last_claim_time = passport.last_mint_token_time;
        current_time > last_claim_time
    }

    /// 获取用户上次领取代币的时间
    public fun get_last_mint_token_time(passport: &Passport): u64 {
        passport.last_mint_token_time
    }

    /// 转移 Passport 给其他用户
    public(package) fun transfer_passport(passport: Passport, recipient: address){
        transfer::transfer(passport, recipient);
    }
}