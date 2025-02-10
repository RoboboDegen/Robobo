import { OpenAPIV3 } from 'openapi-types';
import { Character as ElizaCharacter, ModelProviderName } from '@elizaos/core';

/**
 * Elizant配置扩展参数
 * 当extends字段为Extension类型时，会被转换为JSON字符串并存储在Character的extends数组中
 * 这样可以在保持与ElizaCharacter兼容的同时，存储额外的游戏相关信息
 */
export interface ElizantExtension {
    /** 其他游戏相关的扩展字段可以在这里添加 */
    [key: string]: any;
}


/**
 * Elizant配置字段,基于ElizaCharacter
 */
export type ElizantCharacter= Pick<
    ElizaCharacter,
    // 基本信息
    | 'name' // 角色名称
    | 'bio' // 角色简介,字符串,角色描述
    | 'system' // 系统提示词,用于指导模型的行为
    // 个性化字段
    | 'lore' // 背景故事,用于构建角色的历史和个性
    | 'topics' // 话题,擅长的话题领域
    | 'adjectives' // 性格特征标签,用于描述角色的性格
    | 'style' // 风格,用于描述角色的风格和语气
    // 示例
    | 'messageExamples' // 示例对话,用于描述角色的典型对话模式
    | 'postExamples' // 示例帖子,用于描述角色的典型帖子模式
    // 知识
    | 'knowledge' // 知识库,用于描述角色的知识
    // 配置相关
    | 'plugins' // 插件,用于描述角色的插件
    | 'clients' // 客户端,用于描述角色的客户端
    | 'settings' // 设置,用于描述角色的设置
    | 'modelProvider' // 模型提供商,用于描述角色的模型提供商
>;
/**
 * OpenAPI文档描述的Elizant定义
 */
export type ElizantSpec = Omit<OpenAPIV3.Document, 'x-elizant'> & {
    'x-elizant': ElizantCharacter  
    & {
        /** 
         * 游戏相关配置
         * - 如果是string[]类型，直接作为Character的extends字段
         * - 如果是Extension类型，会被转换为JSON字符串并存储在extends数组中
         */
        extends?: ElizantExtension | string[];
    };
};

