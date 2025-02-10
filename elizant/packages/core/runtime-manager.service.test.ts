// import { IAgentRuntime, UUID, AgentRuntime, Character } from '@elizaos/core';
// import { RuntimeManager } from '../services/runtime-manager.service';
// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { IStorageService } from '../services/storage.service';
// import { ElizantSpec } from '../types';

// describe('RuntimeManager', () => {
//   let runtimeManager: RuntimeManager;
//   let mockStorageService: IStorageService;
//   let mockSpec: ElizantSpec;

//   beforeEach(() => {
//     mockStorageService = {
//       getRuntime: vi.fn(),
//       setRuntime: vi.fn(),
//       removeRuntime: vi.fn(),
//       clearRuntimes: vi.fn()
//     } as unknown as IStorageService;

//     mockSpec = {
//       openapi: '3.0.0',
//       info: {
//         title: '测试API',
//         description: '测试用API',
//         version: '1.0.0'
//       },
//       paths: {},
//       'x-elizant': {
//         name: '测试Agent',
//         bio: '测试用Agent',
//         system: '你是一个测试用Agent',
//         lore: [],
//         topics: [],
//         adjectives: [],
//         style: { all: [], chat: [], post: [] },
//         messageExamples: [],
//         postExamples: [],
//         knowledge: [],
//         plugins: [],
//         clients: [],
//         settings: {},
//         modelProvider: 'openai',
//         extends: ['base_npc', 'shop_keeper']
//       }
//     };

//     runtimeManager = new RuntimeManager(mockStorageService);
//   });

//   describe('serviceType', () => {
//     it('应该返回正确的服务类型', () => {
//       expect(runtimeManager.serviceType).toBe(RuntimeManagerService.serviceType);
//     });
//   });

//   describe('initialize', () => {
//     it('应该成功初始化服务', async () => {
//       const mockRuntime = {} as IAgentRuntime;
//       await expect(runtimeManager.initialize(mockRuntime)).resolves.not.toThrow();
//     });
//   });

//   describe('createAgent', () => {
//     const token = 'test-token';
//     const memoryId = 'test-memory' as UUID;

//     it('应该成功创建代理实例', async () => {
//       const agent = await runtimeManager.createAgent(mockSpec, mockStorageService, token, memoryId);
      
//       expect(agent).toBeInstanceOf(AgentRuntime);
//       expect(agent.agentId).toBe(memoryId);
//       expect(mockStorageService.getDatabaseAdapter).toHaveBeenCalled();
//       expect(mockStorageService.getCacheAdapter).toHaveBeenCalled();
//     });

//     it('当角色配置无效时应该抛出错误', async () => {
//       const invalidSpec = {
//         openapi: '3.0.0',
//         info: {
//           title: 'Test API',
//           version: '1.0.0'
//         },
//         paths: {},
//         'x-elizant': {}
//       } as ElizantSpec;
//       await expect(runtimeManager.createAgent(invalidSpec, mockStorageService, token)).rejects.toThrow();
//     });
//   });

//   describe('getAgent', () => {
//     it('应该返回存在的代理实例', async () => {
//       const memoryId = 'test-memory' as UUID;
//       const agent = await runtimeManager.createAgent(mockSpec, mockStorageService, 'token', memoryId);
      
//       const retrievedAgent = await runtimeManager.getAgent(memoryId);
//       expect(retrievedAgent).toBe(agent);
//     });

//     it('当代理不存在时应该返回 undefined', async () => {
//       const nonExistentId = 'non-existent' as UUID;
//       const agent = await runtimeManager.getAgent(nonExistentId);
//       expect(agent).toBeUndefined();
//     });
//   });

//   describe('getAllAgents', () => {
//     it('应该返回所有代理实例', async () => {
//       await runtimeManager.createAgent(mockSpec, mockStorageService, 'token1', 'agent1' as UUID);
//       await runtimeManager.createAgent(mockSpec, mockStorageService, 'token2', 'agent2' as UUID);

//       const agents = await runtimeManager.getAllAgents();
//       expect(agents).toHaveLength(2);
//       expect(agents[0]).toBeInstanceOf(AgentRuntime);
//       expect(agents[1]).toBeInstanceOf(AgentRuntime);
//     });
//   });

//   describe('deleteAgent', () => {
//     it('应该成功删除存在的代理实例', async () => {
//       const memoryId = 'test-memory' as UUID;
//       await runtimeManager.createAgent(mockSpec, mockStorageService, 'token', memoryId);
      
//       const result = await runtimeManager.deleteAgent(memoryId);
//       expect(result).toBe(true);
      
//       const deletedAgent = await runtimeManager.getAgent(memoryId);
//       expect(deletedAgent).toBeUndefined();
//     });

//     it('当代理不存在时应该返回 false', async () => {
//       const nonExistentId = 'non-existent' as UUID;
//       const result = await runtimeManager.deleteAgent(nonExistentId);
//       expect(result).toBe(false);
//     });
//   });
// }); 