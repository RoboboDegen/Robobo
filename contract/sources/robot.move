module robobo::robot;

use robobo::element::{Element};
use std::string::String;

public struct Robot has key, store{
    id: UID,
    name: String,
    elements: vector<Element>
}

public(package) fun create_robot(name: String, ctx: &mut TxContext): Robot {
    Robot {
        id: object::new(ctx),
        name,
        elements: vector::empty(),
    }
}
