module robobo::robot {
    use robobo::element::{Element};
    use robobo::calculate::{calculate_robot_stats_from_hash};
    use std::{string::String};
    use sui::{hash,table::{Self, Table}};

    const E_ROBOT_NOT_EXISTS: u64 = 0;

    public struct Robot_Pool has key, store {
        id: UID,
        mirrors_pool: Table<ID, Robot_Mirror>,
    }

    public struct Robot has key, store {
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

    /// Robot Mirror is a read-only version of Robot, used for battle and other read-only operations
    public struct Robot_Mirror has store {
        id: ID,
        name: String,
        attack: u8,
        defense: u8,
        speed: u8,
        energy: u8,
        personality: u8,
    }

    public(package) fun create_robot(name: String, pool: &mut Robot_Pool, ctx: &mut TxContext): Robot {
        let name_hash = hash::keccak256(name.as_bytes());
        let (attack, defense, speed, energy, personality) = calculate_robot_stats_from_hash(name_hash);

        let robot_id = object::new(ctx);

        let robot = Robot {
            id: robot_id,
            name,
            attack,
            defense,
            speed,
            energy,
            win_count: 0,
            lose_count: 0,
            personality,
            elements: vector::empty(),
        };

        let robot_mirror = Robot_Mirror {
            id: robot.id.to_inner(),
            name: robot.name,
            attack: robot.attack,
            defense: robot.defense,
            speed: robot.speed,
            energy: robot.energy,
            personality: robot.personality,
        };

        table::add(&mut pool.mirrors_pool, robot_mirror.id, robot_mirror);

        robot
    }

    public(package) fun update_robot_mirror(robot: &Robot, pool: &mut Robot_Pool) {
        let robot_id = robot.id.to_inner();
        assert!(table::contains(&pool.mirrors_pool, robot_id), E_ROBOT_NOT_EXISTS);
        let robot_mirror = table::borrow_mut(&mut pool.mirrors_pool, robot_id);
        robot_mirror.name = robot.name;
        robot_mirror.attack = robot.attack;
        robot_mirror.defense = robot.defense;
        robot_mirror.speed = robot.speed;
        robot_mirror.energy = robot.energy;
        robot_mirror.personality = robot.personality;
    }

    public(package) fun get_robot_mirror(robot_id: ID, pool: &Robot_Pool): &Robot_Mirror {
        let robot_mirror = table::borrow(&pool.mirrors_pool, robot_id);
        robot_mirror
    }

    ///  Getter for robot personality
    public(package) fun get_robot_personality(robot: &Robot): String {
        robot.personality.to_string()
    }

    public(package) fun get_robot_mirror_personality(robot_mirror_id: ID, pool: &Robot_Pool): String {
        assert!(table::contains(&pool.mirrors_pool, robot_mirror_id), E_ROBOT_NOT_EXISTS);
        let robot_mirror = table::borrow(&pool.mirrors_pool, robot_mirror_id);
        robot_mirror.personality.to_string()
    }
}
