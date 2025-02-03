import { RobotConfig } from "@/types";
import { GameObject, GameObjectConfig } from "../core/game-object";

export class RobotObject extends GameObject {
    protected baseSprite?: Phaser.GameObjects.Sprite;
    protected overlaySprite?: Phaser.GameObjects.Sprite;
    protected robotContainer: Phaser.GameObjects.Container;

    constructor(config: GameObjectConfig, robot_config: RobotConfig) {
        super(config);
        
        // 创建基础机器人精灵
        this.baseSprite = this.assetManager.getSprite('baseRobot');
        
        // 创建叠加层机器人精灵
        if (robot_config.image) {
            this.overlaySprite = this.assetManager.getSprite(robot_config.image);
        }
        
        // 创建容器并设置位置
        const sprites = [this.baseSprite, this.overlaySprite]
            .filter((sprite): sprite is Phaser.GameObjects.Sprite => sprite !== undefined);
        this.robotContainer = this.scene.add.container(
            config.x ?? 0,
            config.y ?? 0,
            sprites
        );
    }

    public playAnimation(key: string): this {
        // 可以选择性地为基础层或叠加层播放动画
        //TODO: 状态机
        if (this.baseSprite) {
            this.assetManager.playAnimation(this.baseSprite, key);
        }
        if (this.overlaySprite) {
            this.assetManager.playAnimation(this.overlaySprite, key);
        }
        return this;
    }

    // 添加设置位置的方法
    public setPosition(x: number, y: number): this {
        this.robotContainer.setPosition(x, y);
        return this;
    }
}