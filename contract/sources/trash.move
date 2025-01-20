module robobo::trash {
    use sui::{
        coin::{Self, TreasuryCap},
        token::{Self, TokenPolicy, Token},
        url::new_unsafe_from_bytes,
    };

    const DECIMALS: u8 = 0;
    const SYMBOLS: vector<u8> = b"T";
    const NAME: vector<u8> = b"Trash";
    const DESCRIPTION: vector<u8> = b"Trash is a token in the Robobo universe";
    const ICON_URL: vector<u8> = b"https://example.com/trash.png";

    const EInvalidAmount: u64 = 0;

    public struct TRASH has drop {}

    public struct Trash_AdminCap has key, store {
        id: UID
    }

    public struct TrashTokenCap has key {
        id: UID,
        cap: TreasuryCap<TRASH>
    }

    fun init(otw: TRASH, ctx: &mut TxContext) {
        let deployer = ctx.sender();
        let admin_cap = Trash_AdminCap {
            id: object::new(ctx)
        };
        let (treasury_cap, metadata) = coin::create_currency<TRASH>(
            otw,
            DECIMALS,
            SYMBOLS,
            NAME,
            DESCRIPTION,
            option::some(new_unsafe_from_bytes(ICON_URL)),
            ctx
        );

        let (mut policy, cap) = token::new_policy<TRASH>(
            &treasury_cap,
            ctx
        );

        let token_cap = TrashTokenCap {
            id: object::new(ctx),
            cap: treasury_cap
        };

        token::allow(&mut policy, &cap, token::spend_action(), ctx);
        token::share_policy<TRASH>(policy);

        transfer::transfer(admin_cap, deployer);
        transfer::share_object(token_cap);
        transfer::public_transfer(cap, deployer);
        transfer::public_freeze_object(metadata);
    }

    public(package) fun mint(token_cap: &mut TrashTokenCap, amount: u64, ctx: &mut TxContext) {
        let t_token = token::mint(&mut token_cap.cap, amount, ctx);
        let req = token::transfer<TRASH>(t_token, ctx.sender(), ctx);
        token::confirm_with_treasury_cap<TRASH>(&mut token_cap.cap, req, ctx);
    }

    public(package) fun spend(payment: Token<TRASH>, token_policy: &mut TokenPolicy<TRASH>, amount: u64, ctx: &mut TxContext) {
        assert!(token::value<TRASH>(&payment) == amount, EInvalidAmount);
        let req = token::spend(payment, ctx);
        token::confirm_request_mut(token_policy, req, ctx);
    }
}
