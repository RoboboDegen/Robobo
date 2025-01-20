module robobo::config {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;

    /// 游戏配置结构
    public struct GameConfig has key, store {
        id: UID,
        /// 机器人最大可装备的零件总数
        max_elements: u64,
    }

    // 默认配置值
    const DEFAULT_MAX_ELEMENTS: u64 = 8;

    /// 创建默认配置
    public(package) fun create_config(ctx: &mut TxContext): GameConfig {
        GameConfig {
            id: object::new(ctx),
            max_elements: DEFAULT_MAX_ELEMENTS,
        }
    }

    /// 获取最大零件数量
    public fun get_max_elements(config: &GameConfig): u64 {
        config.max_elements
    }

    /// 设置最大零件数量
    public(package) fun set_max_elements(config: &mut GameConfig, new_max: u64) {
        config.max_elements = new_max;
    }
}
