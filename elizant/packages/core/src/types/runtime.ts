import { Character,ModelProviderName} from "@elizaos/core";
import {ElizantExtension,ElizantSpec,ElizantCharacter} from "./elizant";

// 使用 eliza 的 UUID 类型
export type UUID = `${string}-${string}-${string}-${string}-${string}`;

// /**
//  * ElizantAgent运行时配置
//  * 包含了ElizantAgent实例的运行时信息
//  */
// export interface ElizantAgentRuntimeSpec{
//     /** 配置 ID */
//     id: UUID;
//     /** 从 x-elizant 获取角色定义 */
//     character: ElizantCharacter;
//     /** 从 x-elizant.extends 获取扩展配置 */
//     extension:  ElizantExtension;
//     /** 创建时间 */
//     createdAt: number;
// }; 

