import { GameObject } from "../core/game-object";

import { GameObjectConfig } from "../core/game-object";

export class ImageObject extends GameObject {
    protected gameObject?: Phaser.GameObjects.Image;
  
    constructor(config: GameObjectConfig,key: string) {
      super(config);    
      if (key) {
        this.gameObject = this.assetManager.getImage(key);

        if (this.gameObject) {
          this.setPosition(config.x ?? 0, config.y ?? 0);
        }
      }
    }
  }