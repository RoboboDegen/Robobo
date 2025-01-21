module robobo::user {
    use std::string::String;
    
    const E_ROBOT_EXISTS: u64 = 0;
    const E_ROBOT_NOT_EXISTS: u64 = 1;

    public struct Passport has key {
        id: UID,
        name: String,
        last_mint_token_time: u64,
    }

    public(package) fun mint(name: String, ctx: &mut TxContext): Passport {
        let passport = Passport {
            id: object::new(ctx),
            name,
            last_mint_token_time: tx_context::epoch_timestamp_ms(ctx),
        };
        passport
    }

    public(package) fun update_last_mint_token_time(passport: &mut Passport, ctx: &TxContext){
        passport.last_mint_token_time = tx_context::epoch_timestamp_ms(ctx);
    }

    public(package) fun edit_name(passport: &mut Passport, name:String){
        passport.name = name;
    }

    /// 检查是否可以领取每日代币
    public fun can_claim_daily_token(passport: &Passport, ctx: &TxContext): bool {
        let current_time = tx_context::epoch_timestamp_ms(ctx);
        let last_claim_time = passport.last_mint_token_time;
        current_time > last_claim_time
    }

    /// 转移 Passport 给其他用户
    public(package) fun transfer_passport(passport: Passport, recipient: address){
        transfer::transfer(passport, recipient);
    }

    public fun get_passport_id(passport: &Passport): ID {object::uid_to_inner(&passport.id)}
    
    public fun get_name(passport: &Passport): String {passport.name}
    
    public fun get_last_mint_token_time(passport: &Passport): u64 {passport.last_mint_token_time}
}