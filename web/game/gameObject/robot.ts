import { RobotConfig } from "@/types";
import { GameObject, GameObjectConfig } from "../core/game-object";
import { FSM } from "../core/fsm";

// 定义机器人的所有可能状态
type RobotState = 'idle' | 'hit' | 'underattack' | 'defence' | 'win' | 'chat' | 'defeated';

export class RobotObject extends GameObject {
    protected baseSprite?: Phaser.GameObjects.Sprite;
    private fsm: FSM<RobotState>;
    private currentAnimation?: string;
    private robotConfig: RobotConfig;

    constructor(config: GameObjectConfig, robot_config: RobotConfig) {
        super(config);
        this.robotConfig = robot_config;
        // 创建基础机器人精灵
        this.baseSprite = this.assetManager.getSprite('baseRobot');
        this.baseSprite?.setPosition(config.x ?? 0, config.y ?? 0);
        this.baseSprite?.setOrigin(0.5, 0.5);
        

        // 根据机器人名字设置颜色
        if (robot_config.name) {
            this.setNameBasedTint(robot_config.name);
        }
        
        // 初始化状态机
        this.fsm = new FSM<RobotState>(this);
        this.initializeStateMachine();
    }

    private initializeStateMachine() {
        // 为每个状态设置行为
        const states: RobotState[] = ['idle', 'hit', 'underattack', 'defence', 'win', 'chat', 'defeated'];
        
        states.forEach(state => {
            this.fsm.addState(state, {
                enter: (fsm) => {
                    // 播放对应动画
                    if (this.baseSprite) {
                        this.currentAnimation = state;
                        this.assetManager.playAnimation(this.baseSprite, state);
                        
                        // 监听动画完成事件
                        this.baseSprite.once('animationcomplete', () => {
                            // 如果不是 defeated 状态且当前动画没有被新的动画打断
                            if (state !== 'defeated' && this.currentAnimation === state) {
                                this.fsm.setState('idle');
                            }
                        });
                    }
                }
            });
        });
    }

    private setNameBasedTint(name: string): void {
        if (!this.baseSprite) return;

        // 使用名字的不同部分生成多个基础颜色
        const colors = this.generateNameBasedColors(name);

        // 应用四角渐变色
        this.baseSprite.setTint(
            colors[0], // 左上
            colors[1], // 右上
            colors[2], // 左下
            colors[3]  // 右下
        );
    }

    private generateNameBasedColors(name: string): number[] {
        // 使用名字的不同部分生成不同的哈希值
        const hash1 = this.getStringHash(name);
        const hash2 = this.getStringHash(name.split('').reverse().join(''));
        const hash3 = this.getStringHash(name + name);
        const hash4 = this.getStringHash(name.length.toString());

        // 生成四个基于不同哈希的 HSL 颜色
        return [
            this.hashToColor(hash1, 0.7, 0.6),    // 较高饱和度
            this.hashToColor(hash2, 0.65, 0.55),  // 稍微不同的色调
            this.hashToColor(hash3, 0.75, 0.5),   // 更深的颜色
            this.hashToColor(hash4, 0.8, 0.65)    // 更鲜艳的颜色
        ];
    }

    private getStringHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash; // 转换为32位整数
        }
        return hash;
    }

    private hashToColor(hash: number, saturation: number, lightness: number): number {
        // 使用哈希值生成 0-1 之间的色相值
        const hue = ((hash % 360) + 360) / 360;
        
        // 添加一些随机性到饱和度和亮度，但保持在合理范围内
        const s = saturation + (hash % 20 - 10) / 100;
        const l = lightness + (hash % 20 - 10) / 100;
        
        // 转换 HSL 到 RGB
        return this.hslToRgb(hue, s, l);
    }

    private hslToRgb(h: number, s: number, l: number): number {
        let r: number, g: number, b: number;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        // 确保颜色值在有效范围内
        const clamp = (n: number) => Math.min(255, Math.max(0, Math.round(n * 255)));
        
        return (clamp(r) << 16) + (clamp(g) << 8) + clamp(b);
    }

    public get sprite(): Phaser.GameObjects.Sprite {
        if (!this.baseSprite) {
            throw new Error('Base sprite is not initialized');
        }
        return this.baseSprite;
    }

    public playAnimation(key: RobotState): this {
        this.fsm.setState(key);
        return this;
    }


    public setPosition(x: number, y: number): this {
        this.sprite.setPosition(x, y);
        return this;
    }

    // 可选：添加获取当前状态的方法
    public getCurrentState(): RobotState | undefined {
        return this.currentAnimation as RobotState;
    }

    public getRobotId(): string {
        return this.robotConfig.id;
    }
}