module robobo::config {

    /// 游戏配置结构
    public struct GameConfig has key, store {
        id: UID,
        /// 机器人最大可装备的零件总数
        max_elements: u64,
        // token 相关配置
        trash_amount_mint_robot: u64,
        trash_amount_daily_claim: u64,
        trash_amount_equip_element: u64,
        trash_amount_battle: u64,
        trash_amount_battle_reward: u64
    }

    // 默认配置值
    const DEFAULT_MAX_ELEMENTS: u64 = 3;

    /// 创建默认配置
    public(package) fun create_config(ctx: &mut TxContext): GameConfig {
        GameConfig {
            id: object::new(ctx),
            max_elements: DEFAULT_MAX_ELEMENTS,
            // 初始化 token 配置
            trash_amount_mint_robot: 10,
            trash_amount_daily_claim: 100,
            trash_amount_equip_element: 5,
            trash_amount_battle: 10,
            trash_amount_battle_reward: 20 // 胜利奖励是战斗费用的2倍
        }
    }

    /// 获取最大零件数量
    public fun get_max_elements(config: &GameConfig): u64 {
        config.max_elements
    }

    // 添加 token 配置的 getter 函数
    public fun get_trash_amount_mint_robot(config: &GameConfig): u64 {
        config.trash_amount_mint_robot
    }

    public fun get_trash_amount_daily_claim(config: &GameConfig): u64 {
        config.trash_amount_daily_claim
    }

    public fun get_trash_amount_equip_element(config: &GameConfig): u64 {
        config.trash_amount_equip_element
    }

    public fun get_trash_amount_battle(config: &GameConfig): u64 {
        config.trash_amount_battle
    }

    public fun get_trash_amount_battle_reward(config: &GameConfig): u64 {
        config.trash_amount_battle_reward
    }

    /// 设置最大零件数量
    public(package) fun set_max_elements(config: &mut GameConfig, new_max: u64) {
        config.max_elements = new_max;
    }

    // 添加 token 配置的 setter 函数（仅管理员可调用）
    public(package) fun set_trash_amount_mint_robot(config: &mut GameConfig, amount: u64) {
        config.trash_amount_mint_robot = amount;
    }

    public(package) fun set_trash_amount_daily_claim(config: &mut GameConfig, amount: u64) {
        config.trash_amount_daily_claim = amount;
    }

    public(package) fun set_trash_amount_equip_element(config: &mut GameConfig, amount: u64) {
        config.trash_amount_equip_element = amount;
    }

    public(package) fun set_trash_amount_battle(config: &mut GameConfig, amount: u64) {
        config.trash_amount_battle = amount;
    }

    public(package) fun set_trash_amount_battle_reward(config: &mut GameConfig, amount: u64) {
        config.trash_amount_battle_reward = amount;
    }
}
