export interface AssetConfig {
    key: string;
    path: string;
}

export interface SpritesheetConfig extends AssetConfig {
    frameConfig: {
        frameWidth: number;
        frameHeight: number;
    };
}

export interface AnimationConfig {
    key: string;
    spritesheet: string;
    frames: string[];
    frameRate?: number;
    repeat?: number;
}

export interface AudioConfig extends AssetConfig {
    loop?: boolean;
    volume?: number;
}

export interface EffectConfig {
    key: string;
    spritesheet?: string;
    frames?: string[];
    particleConfig?: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;
}

// 定义资源数据结构
export interface GameAssetsData {
    images: AssetConfig[];
    spritesheets: SpritesheetConfig[];
    audio: AudioConfig[];
    animations: AnimationConfig[];
    effects: EffectConfig[];
}

// 导出实际数据（可以逐步添加）
export const GAME_ASSETS_DATA: GameAssetsData = {
    images: [
        // { key: 'testBackground', path: '/images/testBackground.webp' },
    ],

    spritesheets: [
        // 可以为空或添加资源
        // { 
        //   key: 'player', 
        //   path: '/sprites/player.png', 
        //   frameConfig: { 
        //     frameWidth: 32, 
        //     frameHeight: 48 
        //   } 
        // }
        { 
          key: 'player', 
          path: '/robobo/baseRobot.png', 
          frameConfig: { 
            frameWidth: 90, 
            frameHeight: 128 
          } 
        }
    ],

    audio: [
        // 可以为空或添加资源
        // { 
        //   key: 'bgm', 
        //   path: '/audio/bgm.mp3', 
        //   loop: true, 
        //   volume: 0.7 
        // }
    ],

    animations: [
        // 可以为空或添加资源
        // { 
        //   key: 'player-walk',
        //   spritesheet: 'player',
        //   frames: ['0', '1', '2', '3'],
        //   frameRate: 10,
        //   repeat: -1
        // }
        { 
          key: 'player-jump',
          spritesheet: 'player',
          frames: ['0', '1', '2', '3','4','5'],
          frameRate: 10,
          repeat: -1
        }
    ],

    effects: [
        // 可以为空或添加资源
        // {
        //   key: 'explosion',
        //   spritesheet: 'effects',
        //   frames: ['0', '1', '2', '3'],
        // }
    ]
}; 

// 导出资源键名类型
export type ImageKey = typeof GAME_ASSETS_DATA.images[number]['key'];
export type SpriteKey = typeof GAME_ASSETS_DATA.spritesheets[number]['key'];
export type AnimationKey = typeof GAME_ASSETS_DATA.animations[number]['key'];
export type AudioKey = typeof GAME_ASSETS_DATA.audio[number]['key'];
export type EffectKey = typeof GAME_ASSETS_DATA.effects[number]['key']; 
