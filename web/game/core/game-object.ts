import { AssetManager } from './asset-manager';
import { GameManager } from './game-manager';

export interface GameObjectConfig {
  scene: Phaser.Scene;
  x?: number;
  y?: number;
  texture?: string;
  frame?: string | number;
}

// 定义一个通用的游戏对象接口
interface IGameObject extends Phaser.GameObjects.GameObject, Phaser.GameObjects.Components.Origin {
  setPosition(x: number, y: number): this;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class GameObject {
  protected gameObject?: IGameObject;
  protected scene: Phaser.Scene;
  protected assetManager: AssetManager;
  protected gameManager: GameManager;

  constructor(config: GameObjectConfig) {
    this.scene = config.scene;
    this.assetManager = AssetManager.getInstance(this.scene);
    this.gameManager = GameManager.getInstance(this.scene);
  }

  public setPosition(x: number, y: number): this {
    if (this.gameObject) {
      this.gameObject.setPosition(x, y);
    }
    return this;
  }

  public setOrigin(x: number, y?: number): this {
    if (this.gameObject) {
      this.gameObject.setOrigin(x, y ?? x);
    }
    return this;
  }

  public destroy(): void {
    this.gameObject?.destroy();
  }

  get x(): number {
    return this.gameObject?.x ?? 0;
  }

  get y(): number {
    return this.gameObject?.y ?? 0;
  }

  get width(): number {
    return this.gameObject?.width ?? 0;
  }

  get height(): number {
    return this.gameObject?.height ?? 0;
  }

  // 添加类型保护方法
  protected hasOrigin(obj: Phaser.GameObjects.GameObject): obj is Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Origin {
    return 'setOrigin' in obj;
  }

  protected hasPosition(obj: Phaser.GameObjects.GameObject): obj is Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform {
    return 'setPosition' in obj;
  }

  protected hasDimensions(obj: Phaser.GameObjects.GameObject): obj is Phaser.GameObjects.GameObject & { width: number; height: number } {
    return 'width' in obj && 'height' in obj;
  }
}
