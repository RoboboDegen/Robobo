import { Character } from '@elizaos/core';
import { ElizantSpec,ElizantExtension,ElizantCharacter } from '../types/elizant';

/**
 * Agent工厂类
 * 用于从Spec文档创建Agent实例
 */
export class AgentFactory {
    /**
     * 从Spec文档创建Agent实例
     * @param spec spec文档是OpenAPIV3.Document的扩展
     * @returns Agent实例
     */
    static fromSpec(spec: ElizantSpec): Character {
        const elizantCharacter: ElizantCharacter = spec['x-elizant'];
        
        // 验证必要的字段
        if (!elizantCharacter) {
            throw new Error('OpenAPIV3 document miss x-elizant extension field');
        }

        // 转换为Character实例
        const character: Character = {
            // 基本信息
            name: elizantCharacter.name,
            bio: elizantCharacter.bio,
            system: elizantCharacter.system || "",
            
            // 个性化字段
            lore: elizantCharacter.lore || [],
            topics: elizantCharacter.topics || [],
            adjectives: elizantCharacter.adjectives || [],
            style: elizantCharacter.style || { all: [], chat: [], post: [] },
            
            // 示例
            messageExamples: elizantCharacter.messageExamples || [],
            postExamples: elizantCharacter.postExamples || [],
            
            // 知识
            knowledge: elizantCharacter.knowledge || [],
            
            // 其他
            nft: elizantCharacter.nft,
            
            // 配置相关
            plugins: elizantCharacter.plugins || [],
            clients: elizantCharacter.clients || [],
            settings: elizantCharacter.settings || {},
            modelProvider: elizantCharacter.modelProvider,
            
            // 扩展字段处理
            extends: this.processExtends(spec['x-elizant'].extends)
        };

        return character;
    }

    /**
     * 处理extends字段的转换
     * @param extends_ 原始的extends字段值
     * @returns 处理后的extends字段值
     */
    private static processExtends(extends_?: ElizantExtension | string[]): string[] | undefined {
        if (!extends_) return undefined;
        
        // 如果已经是字符串数组，直接返回
        if (Array.isArray(extends_)) {
            return extends_;
        }
        
        // 如果是Extension对象，转换为JSON字符串
        return [JSON.stringify(extends_)];
    }

    /**
     * 从extends字段中获取Extension对象
     * 这个方法可以在运行时使用，用于从Character实例中获取游戏相关的配置
     * @param character Character实例
     * @returns Extension对象，如果不存在则返回undefined
     */
    static getExtension(character: Character): ElizantExtension {
        if (!character.extends || character.extends.length === 0) return {};
        // 如果只有一个扩展,尝试使用JSON.parse解析
        // 否则直接按照数组解析,并且使用string数组index作为key
        try {
            if (character.extends.length === 1) {
                return JSON.parse(character.extends[0]);
            }else{
                return character.extends.map((item,index) => ({
                    [index]: JSON.parse(item)
                }));
            }
        } catch (e) {
            return {};
        }
    }
}
