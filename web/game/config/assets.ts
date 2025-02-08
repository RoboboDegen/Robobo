export interface AssetConfig {
    key: string;
    path: string;
}

export interface AsepriteConfig {
    key: string;
    imagePath: string;
    spritePath: string;
}

export interface AnimationConfig {
    key: string;
    frames: {
        key: string;
    };
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
    aseprites: AsepriteConfig[];
    audio: AudioConfig[];
    animations: AnimationConfig[];
    effects: EffectConfig[];

}

// 导出实际数据（可以逐步添加）
export const GAME_ASSETS_DATA: GameAssetsData = {
    images: [
        { key: 'homeBackground', path: '/gameui/home/background_scene.png' },
        { key: 'loginBackground', path: '/gameui/login/background_scene.png' },
        { key: 'mintBackground', path: '/gameui/mint/background_scene.png' },
        { key: 'pkBackground', path: '/gameui/pk/background_scene.png' },
        { key: 'inventoryBackground', path: '/gameui/inventory/background_scene.png' },
        { key: 'chatBackground', path: '/gameui/chat/background_scene.png' },
    ],
    aseprites: [
        { key: 'baseRobot', imagePath: '/robobo/robobo.png', spritePath: '/robobo/robobo.json'},
    ],
    audio: [
        {
            key: 'bgm',
            path: '/music/bgm.mp3',
            loop: true,
            volume: 0.5
        },
        {
            key: 'click',
            path: '/music/click.mp3',
            loop: false,
            volume: 0.5
        }
    ],
    animations: [
        {
            key: 'idle',
            frames: { key: 'baseRobot' },
            repeat: -1,
            frameRate: 10
        },
        {
            key: 'hit',
            frames: { key: 'baseRobot' },
            repeat: 2,
            frameRate: 10
        },
        {
            key: 'underattack',
            frames: { key: 'baseRobot' },
            repeat: 0,
            frameRate: 10
        },
        {
            key: 'defence',
            frames: { key: 'baseRobot' },
            repeat: 0,
            frameRate: 10
        },
        {
            key: 'win',
            frames: { key: 'baseRobot' },
            repeat: 0,
            frameRate: 10
        },
        {
            key: 'chat',
            frames: { key: 'baseRobot' },
            repeat: 0,
            frameRate: 10
        },
        {
            key: 'defeated',
            frames: { key: 'baseRobot' },
            repeat: 0,
            frameRate: 10
        }
    ],
    effects: []
};

// 导出资源键名类型
export type ImageKey = typeof GAME_ASSETS_DATA.images[number]['key'];
export type SpriteKey = typeof GAME_ASSETS_DATA.aseprites[number]['key'];
export type AnimationKey = typeof GAME_ASSETS_DATA.animations[number]['key'];
export type AudioKey = typeof GAME_ASSETS_DATA.audio[number]['key'];
export type EffectKey = typeof GAME_ASSETS_DATA.effects[number]['key']; 
