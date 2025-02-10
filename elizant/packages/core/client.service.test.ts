// import { ClientService } from '../services/client.service';
// import { IAgentRuntime, UUID, Media, Content, Memory, State, Actor, ModelClass } from '@elizaos/core';
// import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
// import * as core from '@elizaos/core';
// import { ModelProviderName } from '@elizaos/core';

// describe('ClientService', () => {
//   let clientService: ClientService;
//   let mockRuntime: IAgentRuntime;
//   let generateMessageResponseMock: Mock;

//   beforeEach(() => {
//     // 重置单例实例
//     (ClientService as any)._instance = undefined;
    
//     // 创建模拟的运行时
//     mockRuntime = {
//       agentId: 'test-id' as UUID,
//       serverUrl: 'http://test.com',
//       token: 'test-token',
//       modelProvider: ModelProviderName.OPENAI,
//       addMemory: vi.fn(),
//       getMemories: vi.fn(),
//       getMemory: vi.fn(),
//       removeMemory: vi.fn(),
//       clearMemories: vi.fn(),
//       getState: vi.fn(),
//       setState: vi.fn(),
//       clearState: vi.fn(),
//       getActor: vi.fn(),
//       setActor: vi.fn(),
//       clearActor: vi.fn(),
//       getModel: vi.fn(),
//       setModel: vi.fn(),
//       clearModel: vi.fn()
//     } as unknown as IAgentRuntime;

//     // 设置 generateMessageResponse 的 mock
//     generateMessageResponseMock = vi.fn(async () => ({
//       text: 'mock response',
//       source: 'agent',
//       attachments: []
//     }));

//     // 替换原始函数
//     const originalGenerateMessageResponse = core.generateMessageResponse;
//     (core as any).generateMessageResponse = generateMessageResponseMock;

//     clientService = ClientService.getInstance();
//   });

//   afterEach(() => {
//     vi.clearAllMocks();
//   });

//   describe('getInstance', () => {
//     it('应该返回单例实例', () => {
//       const instance1 = ClientService.getInstance();
//       const instance2 = ClientService.getInstance();
//       expect(instance1).toBe(instance2);
//     });
//   });

//   describe('serviceType', () => {
//     it('应该返回正确的服务类型', () => {
//       expect(clientService.serviceType).toBe(ClientService.serviceType);
//     });
//   });

//   describe('initialize', () => {
//     it('应该成功初始化服务', async () => {
//       await expect(clientService.initialize(mockRuntime)).resolves.not.toThrow();
//     });
//   });

//   describe('handleMessage', () => {
//     const mockParams = {
//       runtime: mockRuntime,
//       content: 'test message',
//       userId: 'test-user' as UUID,
//       roomId: 'test-room' as UUID,
//       attachments: [] as Media[],
//     };

//     const mockMemory: Memory = {
//       id: 'test-memory' as UUID,
//       agentId: 'test-agent' as UUID,
//       userId: 'test-user' as UUID,
//       roomId: 'test-room' as UUID,
//       content: {
//         text: 'test message',
//         source: 'user',
//         attachments: []
//       },
//       embedding: Array.from({ length: 1024 }, () => 0),
//       createdAt: Date.now()
//     };

//     const mockState: State = {
//       bio: 'Test bio',
//       lore: 'Test lore',
//       messageDirections: 'Test message directions',
//       postDirections: 'Test post directions',
//       roomId: 'test-room' as UUID,
//       actors: '',
//       recentMessages: '',
//       recentMessagesData: [mockMemory],
//       actionExamples: '',
//       knowledge: '',
//       providers: '',
//       attachments: '',
//       actions: '',
//       actorsData: [] as Actor[],
//     };

//     beforeEach(() => {
//       // 设置模拟响应
//       mockRuntime.getState.mockResolvedValue(mockState);
//       // 重置 mock
//       generateMessageResponseMock.mockClear();
//     });

//     it('应该成功处理消息并返回响应', async () => {
//       const responses = await clientService.handleMessage(mockParams);
      
//       // 验证调用
//       expect(mockRuntime.ensureConnection).toHaveBeenCalledWith(mockParams.userId, mockParams.roomId);
//       expect(mockRuntime.messageManager.createMemory).toHaveBeenCalled();
//       expect(mockRuntime.getState).toHaveBeenCalled();
//       expect(mockRuntime.processActions).toHaveBeenCalled();
//       expect(mockRuntime.evaluate).toHaveBeenCalled();
//       expect(generateMessageResponseMock).toHaveBeenCalled();
      
//       // 验证响应
//       expect(responses).toBeInstanceOf(Array);
//       expect(responses.length).toBeGreaterThan(0);
//     });

//     it('应该在消息处理失败时抛出错误', async () => {
//       mockRuntime.messageManager.createMemory.mockRejectedValue(new Error('Mock error'));
//       await expect(clientService.handleMessage(mockParams)).rejects.toThrow();
//     });
//   });

//   describe('API Handlers', () => {
//     it('应该返回所有API处理器', () => {
//       const handlers = clientService.getAPIHandlers();
//       expect(handlers).toHaveProperty('getAgents');
//       expect(handlers).toHaveProperty('getAgent');
//       expect(handlers).toHaveProperty('updateAgent');
//       expect(handlers).toHaveProperty('getMemories');
//     });
//   });
// }); 