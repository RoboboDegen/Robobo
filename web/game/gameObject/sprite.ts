import { GameObject, GameObjectConfig } from "../core/game-object";

export class SpriteObject extends GameObject {
    protected gameObject?: Phaser.GameObjects.Sprite;
  
    constructor(config: GameObjectConfig) {
      super(config);
      if (config.texture) {
        this.gameObject = this.assetManager.getSprite(config.texture);
        if (this.gameObject) {
          this.setPosition(config.x ?? 0, config.y ?? 0);
        }
      }
    }
  
    public playAnimation(key: string): this {
      if (this.gameObject) {
        this.assetManager.playAnimation(this.gameObject, key);
      }
      return this;
    }
  }