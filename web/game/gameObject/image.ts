import { GameObject } from "../core/game-object";

import { GameObjectConfig } from "../core/game-object";

export class ImageObject extends GameObject {
    protected gameObject?: Phaser.GameObjects.Image;
  
    constructor(config: GameObjectConfig) {
      super(config);    
      if (config.texture) {
        this.gameObject = this.assetManager.getImage(config.texture);
        if (this.gameObject) {
          this.setPosition(config.x ?? 0, config.y ?? 0);
        }
      }
    }
  }