import { Character, ModelProviderName } from '@elizaos/core';
import { AgentFactory } from '../agent/factory';
import { ElizantSpec, ElizantCharacter } from '../types';
import { describe, it, expect } from 'vitest';

describe('AgentFactory', () => {
    describe('fromSepc', () => {
        it('应该能从OpenAPI文档创建一个有效的Agent实例', () => {
            // 准备测试数据
            const spec: ElizantSpec = {
                openapi: '3.0.0',
                info: {
                    title: '游戏NPC商人',
                    description: '一个在游戏中经营商店的NPC商人',
                    version: '1.0.0',
                },
                paths: {
                    '/shop/items': {
                        get: {
                            summary: '获取商店物品列表',
                            description: '返回当前商店可以购买的所有物品',
                            responses: {
                                '200': {
                                    description: '成功返回物品列表'
                                }
                            }
                        }
                    }
                },
                'x-elizant': {
                    name: '老王的杂货铺',
                    bio: '我是一个经营杂货铺的商人，专门收购和销售各种游戏道具。',
                    system: '你是一个游戏中的NPC商人，经营着一家杂货铺。',
                    lore: ['老王的杂货铺已经开了20年了，是这个城镇最古老的商店之一。'],
                    topics: ['商品交易', '市场行情', '道具知识'],
                    adjectives: ['精明', '和蔼', '健谈'],
                    style: { all: ['说话幽默'], chat: ['在生意上很认真'], post: [] },
                    messageExamples: [],
                    postExamples: [],
                    knowledge: ['商品定价规则', '道具属性知识'],
                    plugins: [],
                    clients: [],
                    settings: {},
                    modelProvider: ModelProviderName.OPENAI,
                    extends: {
                        UID: '0x1234567890'
                    }
                } as ElizantCharacter
            };

            // 执行测试
            const agent = AgentFactory.fromSpec(spec);

            // 验证结果
            expect(agent).toBeDefined();
            expect(agent.name).toBe('老王的杂货铺');
            expect(agent.bio).toBe('我是一个经营杂货铺的商人，专门收购和销售各种游戏道具。');
            expect(agent.system).toBe('你是一个游戏中的NPC商人，经营着一家杂货铺。');
            expect(agent.lore).toEqual(['老王的杂货铺已经开了20年了，是这个城镇最古老的商店之一。']);
            expect(agent.topics).toEqual(['商品交易', '市场行情', '道具知识']);
            expect(agent.adjectives).toEqual(['精明', '和蔼', '健谈']);
            expect(agent.style).toEqual({ all: ['说话幽默'], chat: ['在生意上很认真'], post: [] });
            expect(agent.messageExamples).toEqual([]);
            expect(agent.modelProvider).toBe(ModelProviderName.OPENAI);
            
            // 验证扩展字段
            expect(agent.extends).toEqual(['{"UID":"0x1234567890"}']);
            
            // 验证可以正确解析回Extension对象
            const extension = AgentFactory.getExtension(agent);
            expect(extension).toEqual({ UID: "0x1234567890" });
        });

        it('应该正确处理extends为字符串数组的情况', () => {
            const spec: ElizantSpec = {
                openapi: '3.0.0',
                info: {
                    title: '测试API',
                    description: '测试用API',
                    version: '1.0.0',
                },
                paths: {},
                'x-elizant': {
                    name: '测试Agent',
                    bio: '测试用Agent',
                    system: '你是一个测试用Agent',
                    lore: [],
                    topics: [],
                    adjectives: [],
                    style: { all: [], chat: [], post: [] },
                    messageExamples: [],
                    postExamples: [],
                    knowledge: [],
                    plugins: [],
                    clients: [],
                    settings: {},
                    modelProvider: ModelProviderName.OPENAI,
                    extends: ['base_npc', 'shop_keeper']
                } as ElizantCharacter
            };

            const agent = AgentFactory.fromSpec(spec);
            expect(agent.extends).toEqual(['base_npc', 'shop_keeper']);
            
            // 验证getExtension会返回空对象（表示没有额外配置）
            const extension = AgentFactory.getExtension(agent);
            expect(extension).toEqual({});
        });

        it('应该在缺少x-elizant字段时抛出错误', () => {
            const spec = {
                openapi: '3.0.0',
                info: {
                    title: '测试API',
                    description: '测试用API',
                    version: '1.0.0',
                },
                paths: {}
            } as ElizantSpec;

            expect(() => AgentFactory.fromSpec(spec)).toThrow('OpenAPIV3 document miss x-elizant extension field');
        });

        it('应该使用默认值填充缺失的字段', () => {
            const spec: ElizantSpec = {
                openapi: '3.0.0',
                info: {
                    title: '测试API',
                    description: '测试用API',
                    version: '1.0.0',
                },
                paths: {},
                'x-elizant': {
                    name: '测试Agent',
                    bio: '这是一个测试用Agent',
                    system: '你是一个测试用Agent',
                    lore: [],
                    topics: [],
                    adjectives: [],
                    style: { all: [], chat: [], post: [] },
                    messageExamples: [],
                    postExamples: [],
                    knowledge: [],
                    plugins: [],
                    clients: [],
                    settings: {},
                    modelProvider: ModelProviderName.OPENAI,
                    extends: {
                        UID: '0x1234567890'
                    }
                } as ElizantCharacter
            };

            const agent = AgentFactory.fromSpec(spec);

            expect(agent.topics).toEqual([]);
            expect(agent.messageExamples).toEqual([]);
            expect(agent.modelProvider).toBe(ModelProviderName.OPENAI);
            expect(agent.extends).toEqual(["{\"UID\":\"0x1234567890\"}"]);
        });
    });
}); 