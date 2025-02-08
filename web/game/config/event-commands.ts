import { GameEventData, RobotEventTypes, SceneEventTypes, AudioEventTypes } from "../core/event-types";
import { ImageKey } from "./assets";

// 定义参数类型
export interface CommandParam {
    name: string;
    type: 'string' | 'number' | 'select';
    key: string;
    options?: { label: string; value: string | number }[];
    default?: string | number;
}

// 扩展命令接口
export interface EventCommand {
    id: string;
    key: keyof GameEventData;
    name: string;
    description?: string;
    category: 'scene' | 'robot' | 'audio';
    params?: CommandParam[];
    getData: (params: Record<string, any>) => any;
}

// 场景相关命令
const sceneCommands: EventCommand[] = [
    {
        id: 'scene-change-background',
        key: 'SCENE',
        name: '切换背景',
        category: 'scene',
        params: [
            {
                name: '背景',
                type: 'select',
                key: 'background',
                default: 'loginBackground',
                options: [
                    { label: '登录场景', value: 'loginBackground' },
                    { label: 'PK场景', value: 'pkBackground' },
                    { label: '主页场景', value: 'homeBackground' },
                    { label: '铸造场景', value: 'mintBackground' },
                    { label: '背包场景', value: 'inventoryBackground' },
                    { label: '聊天场景', value: 'chatBackground' },
                ]
            }
        ],
        getData: (params) => ({
            type: SceneEventTypes.changeBackground,
            background: params.background
        })
    },
    {
        id: 'scene-camera-focus',
        key: 'SCENE',
        name: '相机聚焦',
        category: 'scene',
        getData: () => ({
            type: SceneEventTypes.cameraFocusOn
        })
    },
    {
        id: 'scene-camera-reset',
        key: 'SCENE',
        name: '相机重置',
        category: 'scene',
        getData: () => ({
            type: SceneEventTypes.cameraReset
        })
    },

    {
        id: 'scene-camera-shake',
        key: 'SCENE',
        name: '相机震动',
        category: 'scene',
        getData: () => ({

            type: SceneEventTypes.cameraShake
        })
    }
];

// 机器人相关命令
const robotCommands: EventCommand[] = [
    {
        id: 'robot-idle',
        key: 'ROBOT',
        name: '待机动作',
        category: 'robot',
        params: [
            {
                name: '机器人ID',
                type: 'string',
                key: 'robotId',
                default: '1'
            }
        ],
        getData: (params) => ({
            type: RobotEventTypes.idle,
            robotId: params.robotId
        })
    },
    {
        id: 'robot-defence',
        key: 'ROBOT',
        name: '防御动作',
        category: 'robot',
        params: [

            {
                name: '机器人ID',
                type: 'string',
                key: 'robotId',
                default: '1'
            }
        ],
        getData: (params) => ({
            type: RobotEventTypes.defence,
            robotId: params.robotId
        })
    },
    {
        id: 'robot-underattack',
        key: 'ROBOT',
        name: '受击动作',
        category: 'robot',
        params: [

            {
                name: '机器人ID',
                type: 'string',
                key: 'robotId',
                default: '1'
            }
        ],
        getData: (params) => ({
            type: RobotEventTypes.underattack,
            robotId: params.robotId
        })
    },
    {
        id: 'robot-win',
        key: 'ROBOT',
        name: '胜利动作',
        category: 'robot',
        params: [

            {
                name: '机器人ID',
                type: 'string',
                key: 'robotId',
                default: '1'
            }
        ],
        getData: (params) => ({
            type: RobotEventTypes.win,
            robotId: params.robotId
        })
    },
    {
        id: 'robot-lose',
        key: 'ROBOT',
        name: '失败动作',
        category: 'robot',
        params: [

            {
                name: '机器人ID',
                type: 'string',
                key: 'robotId',
                default: '1'
            }
        ],
        getData: (params) => ({
            type: RobotEventTypes.lose,
            robotId: params.robotId
        })
    },
    {
        id: 'robot-hit',
        key: 'ROBOT',
        name: '攻击动作',
        category: 'robot',
        params: [

            {
                name: '机器人ID',
                type: 'string',
                key: 'robotId',
                default: '1'
            }
        ],
        getData: (params) => ({
            type: RobotEventTypes.hit,
            robotId: params.robotId
        })
    },
    {
        id: 'robot-chat',
        key: 'ROBOT',
        name: '聊天动作',
        category: 'robot',
        params: [
            {
                name: '机器人ID',
                type: 'string',
                key: 'robotId',
                default: '1'
            }
        ],  
        getData: (params) => ({
            type: RobotEventTypes.chat,
            robotId: params.robotId
        })


    }
];

// 音频相关命令
const audioCommands: EventCommand[] = [
    {
        id: 'audio-play-effect',
        key: 'AUDIO',
        name: '播放音效',
        category: 'audio',
        params: [
            {
                name: '音效',
                type: 'select',
                key: 'audioKey',
                default: 'click',
                options: [
                    { label: '点击音效', value: 'click' }
                ]
            }
        ],
        getData: (params) => ({
            type: AudioEventTypes.play,
            audioKey: params.audioKey
        })
    },
    {
        id: 'audio-play-bgm',
        key: 'AUDIO',
        name: '播放背景音乐',
        category: 'audio',
        params: [

            {
                name: '音乐',
                type: 'select',
                key: 'audioKey',
                options: [
                    { label: '背景音乐', value: 'bgm' }
                ]
            }
        ],
        getData: (params) => ({
            type: AudioEventTypes.playBGM,
            audioKey: params.audioKey
        })
    },
    {
        id: 'audio-stop-bgm',
        key: 'AUDIO',
        name: '停止背景音乐',
        category: 'audio',
        getData: () => ({
            type: AudioEventTypes.stopAll
        })
    }
];

export const EVENT_COMMANDS = {
    scene: sceneCommands,
    robot: robotCommands,
    audio: audioCommands,
    all: [...sceneCommands, ...robotCommands, ...audioCommands]
}; 