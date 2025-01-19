module robobo::robot;

use robobo::element::{Element};
use robobo::calculate::{
    calculate_robot_stats_from_hash
};
use std::{
    string::String,
};
use sui::{
    hash,
};

public struct Robot has key, store{
    id: UID,
    name: String,
    attack: u8,
    defense: u8,
    speed: u8,
    energy: u8,
    win_count: u64,
    lose_count: u64,
    personality: u8,
    elements: vector<Element>
}


public(package) fun create_robot(name: String, ctx: &mut TxContext): Robot {
    let name_hash = hash::keccak256(name.as_bytes());
    let (attack, defense, speed, energy, personality) = calculate_robot_stats_from_hash(name_hash);

    Robot {
        id: object::new(ctx),
        name,
        attack,
        defense, 
        speed,
        energy,
        win_count: 0,
        lose_count: 0,
        personality,
        elements: vector::empty(),
    }
}
