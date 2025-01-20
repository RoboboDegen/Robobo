module robobo::robot {
    use robobo::element::{Self, Element};
    use robobo::calculate::{Self, calculate_robot_stats_from_hash};
    use robobo::config::{Self, GameConfig};
    use std::{string::String, vector};
    use sui::{object::{Self, ID, UID}, hash, table::{Self, Table}};

    const E_ROBOT_NOT_EXISTS: u64 = 0;
    const E_ELEMENT_NOT_EQUIPPED: u64 = 1;
    const E_MAX_ELEMENTS_REACHED: u64 = 2;

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

    public(package) fun create_robot_pool(ctx: &mut TxContext): Robot_Pool {
        Robot_Pool {
            id: object::new(ctx),
            mirrors_pool: table::new(ctx),
        }
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

    public(package) fun get_robot_id(robot: &Robot): ID {
        robot.id.to_inner()
    }

    /// 内部函数：计算单个属性值
    fun calculate_stat(base: u8, delta: u8): u8 {
        let zero_point = 128;
        if (delta >= zero_point) {
            // 增加属性
            let increase = (delta as u64) - (zero_point as u64);
            // 如果增加量加上基础值会超过255，返回255
            if (increase + (base as u64) > 255) {
                255
            } else {
                (base as u64 + increase as u64) as u8
            }
        } else {
            // 减少属性
            let decrease = (zero_point as u64) - (delta as u64);
            // 如果减少量大于等于基础值，返回0
            if (decrease >= (base as u64)) {
                0
            } else {
                (base as u64 - decrease as u64) as u8
            }
        }
    }

    /// 内部函数：重新计算机器人的所有属性
    fun recalculate_robot_stats(robot: &mut Robot) {
        // 获取机器人的初始属性（基于名字hash计算）
        let name_hash = hash::keccak256(robot.name.as_bytes());
        let (initial_attack, initial_defense, initial_speed, initial_energy, _) = calculate_robot_stats_from_hash(name_hash);

        // 从初始属性开始计算
        let mut base_attack = initial_attack;
        let mut base_defense = initial_defense;
        let mut base_speed = initial_speed;
        let mut base_energy = initial_energy;

        // 遍历所有零件，累积属性修改
        let mut i = 0;
        while (i < vector::length(&robot.elements)) {
            let element = vector::borrow(&robot.elements, i);
            let abilities = element::get_element_abilities(element);
            
            base_attack = calculate_stat(base_attack, *vector::borrow(&abilities, 0));
            base_defense = calculate_stat(base_defense, *vector::borrow(&abilities, 1));
            base_speed = calculate_stat(base_speed, *vector::borrow(&abilities, 2));
            base_energy = calculate_stat(base_energy, *vector::borrow(&abilities, 3));
            
            i = i + 1;
        };

        // 更新机器人属性
        robot.attack = base_attack;
        robot.defense = base_defense;
        robot.speed = base_speed;
        robot.energy = base_energy;
    }

    /// 为机器人装备零件
    public(package) fun equip_element(robot: &mut Robot, element: Element, pool: &mut Robot_Pool, game_config: &GameConfig) {
        // 检查是否还能装备更多零件
        assert!(vector::length(&robot.elements) < config::get_max_elements(game_config), E_MAX_ELEMENTS_REACHED);
        
        // 装备零件
        vector::push_back(&mut robot.elements, element);

        // 重新计算所有属性
        recalculate_robot_stats(robot);

        // 更新机器人镜像数据
        update_robot_mirror(robot, pool);
    }

    /// 通过零件id卸下零件
    public(package) fun unequip_element_by_id(robot: &mut Robot, element_id: ID, pool: &mut Robot_Pool): Element {
        let (_, idx) = get_element_and_idx_by_id(robot, element_id);
        unequip_element(robot, idx, pool)
    }

    /// 通过索引移除机器人的一个零件
    public(package) fun unequip_element(robot: &mut Robot, element_idx: u64, pool: &mut Robot_Pool): Element {
        // 检查指定索引处是否存在零件
        assert!(element_idx < vector::length(&robot.elements), E_ELEMENT_NOT_EQUIPPED);
        
        // 移除零件
        let element = vector::remove(&mut robot.elements, element_idx);

        // 重新计算所有属性
        recalculate_robot_stats(robot);

        // 更新机器人镜像数据
        update_robot_mirror(robot, pool);
        
        element
    }

    /// 获取指定索引的零件和ID
    public(package) fun get_element_and_id_at(robot: &Robot, element_idx: u64): (&Element, ID) {
        assert!(element_idx < vector::length(&robot.elements), E_ELEMENT_NOT_EQUIPPED);
        let element = vector::borrow(&robot.elements, element_idx);
        (element, element::get_element_id(element))
    }

    /// 获取指定id的零件和索引
    public(package) fun get_element_and_idx_by_id(robot: &Robot, element_id: ID): (&Element, u64) {
        let mut i = 0;
        while (i < vector::length(&robot.elements)) {
            let element = vector::borrow(&robot.elements, i);
            if (element::get_element_id(element) == element_id) {
                return (element, i)
            };
            i = i + 1;
        };
        abort E_ELEMENT_NOT_EQUIPPED
    }

    public fun get_robot_attack(robot: &Robot): u8 {robot.attack}
    public fun get_robot_defense(robot: &Robot): u8 {robot.defense}
    public fun get_robot_speed(robot: &Robot): u8 {robot.speed}
    public fun get_robot_energy(robot: &Robot): u8 {robot.energy}

    public fun get_robot_mirror_attack(mirror: &Robot_Mirror): u8 {mirror.attack}
    public fun get_robot_mirror_defense(mirror: &Robot_Mirror): u8 {mirror.defense}
    public fun get_robot_mirror_speed(mirror: &Robot_Mirror): u8 {mirror.speed}
    public fun get_robot_mirror_energy(mirror: &Robot_Mirror): u8 {mirror.energy}
}