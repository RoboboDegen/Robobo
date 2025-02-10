import {
  Service,
  ServiceType,
  IAgentRuntime,
  UUID,
  elizaLogger,
  Content,
  Memory,
  Media,
  generateMessageResponse,
  composeContext,
  ModelClass,
  getEmbeddingZeroVector,
} from "@elizaos/core";
import { ElizantServiceType } from "../types";

/**
 * 消息处理参数接口
 */
interface MessageHandlerParams {
  runtime: IAgentRuntime;
  content: string;
  userId: UUID;
  roomId: UUID;
  attachments?: Media[];
}

/**
 * API 路由处理器类型
 */
type RouteHandler = (runtime: IAgentRuntime, params: any, ...args: any[]) => Promise<any>;

/**
 * ClientService 类
 * 负责提供标准的消息处理和 API 路由处理接口
 * 
 * 主要功能：
 * 1. 提供标准的消息处理接口
 * 2. 提供标准的 API 路由处理接口
 * 3. 不负责具体的通信实现
 */
export class ClientService extends Service {
  private static _instance: ClientService;

  protected constructor() {
    super();
  }

  public static getInstance<T extends Service = ClientService>(): T {
    if (!ClientService._instance) {
      ClientService._instance = new ClientService();
    }
    return ClientService._instance as unknown as T;
  }

  static get serviceType(): ServiceType {
    return ElizantServiceType.CLIENT;
  }

  get serviceType(): ServiceType {
    return ClientService.serviceType;
  }

  async initialize(_runtime: IAgentRuntime): Promise<void> {
    elizaLogger.info("ClientService initialized");
  }

  /**
   * 创建消息记忆
   */
  private async createMessageMemory(params: MessageHandlerParams): Promise<Memory> {
    const { runtime, content, userId, roomId, attachments = [] } = params;
    const messageId = `${Date.now()}-${userId}` as UUID;

    const messageContent: Content = {
      text: content,
      attachments,
      source: "client",
      inReplyTo: undefined,
    };

    const memory: Memory = {
      id: messageId,
      agentId: runtime.agentId,
      userId,
      roomId,
      content: messageContent,
      embedding: getEmbeddingZeroVector(),
      createdAt: Date.now(),
    };

    await runtime.messageManager.addEmbeddingToMemory(memory);
    await runtime.messageManager.createMemory(memory);

    return memory;
  }

  /**
   * 生成响应
   */
  private async generateResponse(params: {
    runtime: IAgentRuntime;
    memory: Memory;
  }): Promise<Content[]> {
    const { runtime, memory } = params;

    // 1. 构建状态
    const state = await runtime.composeState(memory, {
      agentName: runtime.character.name,
    });

    // 2. 生成响应
    const context = composeContext({
      state,
      template: this.getMessageTemplate(),
    });

    const response = await generateMessageResponse({
      runtime,
      context,
      modelClass: ModelClass.LARGE,
    });

    if (!response) {
      throw new Error("No response generated");
    }

    // 3. 保存响应记忆
    const responseMemory: Memory = {
      id: `${Date.now()}-${runtime.agentId}` as UUID,
      agentId: runtime.agentId,
      userId: runtime.agentId,
      roomId: memory.roomId,
      content: response,
      embedding: getEmbeddingZeroVector(),
      createdAt: Date.now(),
    };

    await runtime.messageManager.createMemory(responseMemory);

    return [response];
  }

  /**
   * 处理动作和评估
   */
  private async processActionsAndEvaluate(params: {
    runtime: IAgentRuntime;
    memory: Memory;
    responses: Content[];
  }): Promise<void> {
    const { runtime, memory, responses } = params;

    // 1. 构建状态
    const state = await runtime.composeState(memory, {
      agentName: runtime.character.name,
    });

    // 2. 处理动作
    await runtime.processActions(memory, responses.map(content => ({
      ...memory,
      content,
    })), state);

    // 3. 评估
    await runtime.evaluate(memory, state);
  }

  /**
   * 获取消息模板
   */
  private getMessageTemplate(): string {
    return `{{actionExamples}}
(Action examples are for reference only. Do not use the information from them in your response.)

# Knowledge
{{knowledge}}

# Task: Generate dialog and actions for the character {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}

{{providers}}

{{attachments}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{messageDirections}}

{{recentMessages}}

{{actions}}

# Instructions: Write the next message for {{agentName}}.
`;
  }

  /**
   * 消息处理器
   */
  async handleMessage(params: MessageHandlerParams): Promise<Content[]> {
    const { runtime, userId, roomId } = params;
    
    // 1. 确保连接存在
    await runtime.ensureConnection(userId, roomId);

    // 2. 创建消息记忆
    const memory = await this.createMessageMemory(params);

    // 3. 生成响应
    const responses = await this.generateResponse({
      runtime,
      memory
    });

    // 4. 处理动作和评估
    await this.processActionsAndEvaluate({
      runtime,
      memory,
      responses
    });

    return responses;
  }

  /**
   * API 路由处理器
   */
  getAPIHandlers(): Record<string, RouteHandler> {
    return {
      // 基础 API
      'getAgents': this.handleGetAgents.bind(this),
      'getAgent': this.handleGetAgent.bind(this),
      'updateAgent': this.handleUpdateAgent.bind(this),
      
      // 记忆相关
      'getMemories': this.handleGetMemories.bind(this),
    };
  }

  /**
   * API 处理器实现
   */
  private async handleGetAgents(runtime: IAgentRuntime, params: any, runtimes: Map<UUID, IAgentRuntime>) {
    return Array.from(runtimes.values()).map(runtime => ({
      id: runtime.agentId,
      name: runtime.character.name,
    }));
  }

  private async handleGetAgent(runtime: IAgentRuntime, params: any) {
    return {
      id: runtime.agentId,
      character: runtime.character,
    };
  }

  private async handleUpdateAgent(runtime: IAgentRuntime, params: { character: any }) {
    return {
      id: runtime.agentId,
      character: params.character,
    };
  }

  private async handleGetMemories(runtime: IAgentRuntime, params: { roomId: UUID }) {
    const { roomId } = params;
    const memories = await runtime.messageManager.getMemories({ roomId });
    return memories.map(memory => ({
      id: memory.id,
      userId: memory.userId,
      content: memory.content,
      createdAt: memory.createdAt,
    }));
  }

} 