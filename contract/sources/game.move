module robobo::game;

use robobo::trash::{mint as trash_mint, TrashTokenCap};
use robobo::battle::start_battle;
use robobo::robot::{ Robot, Robot_Pool,create_robot};
use robobo::user::{Self,mint as user_mint, Passport};
use robobo::element::{create_element,delete_element, Element};
use std::string::String;
use sui::clock::Clock;

// 开始战斗
public entry fun entry_start_battle(
    attacker: &mut Robot,
    defender: ID,
    clock: &Clock,
    pool: &mut Robot_Pool,
) {
    start_battle(attacker, defender, clock, pool);
}

// 创建机器人
public entry fun entry_create_robot(name: String, pool: &mut Robot_Pool, ctx: &mut TxContext) {
    let robot = create_robot(name, pool, ctx);
    transfer::public_transfer(robot, ctx.sender());
}

// 创建用户
public entry fun entry_mint_passport(name: String, clock: &Clock, ctx: &mut TxContext) {
    let passport = user_mint(name, clock, ctx);
    transfer::public_transfer(passport, ctx.sender());
}

// 编辑用户名
public entry fun entry_edit_passport_name(passport: &mut Passport, name: String) {
    user::edit_name(passport, name)
}

//获取代币
public entry fun entry_mint_trash(token_cap: &mut TrashTokenCap, amount: u64, ctx: &mut TxContext) {
  trash_mint(token_cap, amount, ctx);
}

//创造装备
public entry fun entry_create_element(
        name: String,
        abilities: vector<u8>,
        ctx: &mut TxContext
    ) {
      let element = create_element(name, abilities, ctx);
      transfer::public_transfer(element, ctx.sender());
    }

//删除装备
public entry fun entry_delete_element(element: Element) {
        delete_element(element)
    }
