import { v4 as uuidv4 } from 'uuid';
import { Conversation, Message } from '../types';
import { RuntimeManager, ClientService } from '@elizant/core';

export class ConversationService {
  private static instance: ConversationService;
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private runtimeManager: RuntimeManager;
  private clientService: ClientService;

  private constructor() {
    this.runtimeManager = new RuntimeManager();
    this.clientService = ClientService.getInstance();
  }

  public static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService();
    }
    return ConversationService.instance;
  }

  async createConversation(agentId: string): Promise<Conversation> {
    const runtime = await this.runtimeManager.getAgent(agentId);
    if (!runtime) {
      throw new Error('Agent not found');
    }

    const conversation: Conversation = {
      id: uuidv4(),
      agentId,
      title: `对话 ${new Date().toLocaleString()}`,
      createdAt: new Date(),
      lastMessageAt: new Date()
    };

    this.conversations.set(conversation.id, conversation);
    this.messages.set(conversation.id, []);

    return conversation;
  }

  async getConversations(agentId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.agentId === agentId)
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return this.messages.get(conversationId) || [];
  }

  async sendMessage(agentId: string, conversationId: string, content: string): Promise<Message> {
    const runtime = await this.runtimeManager.getAgent(agentId);
    if (!runtime) {
      throw new Error('Agent not found');
    }

    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // 创建用户消息
    const userMessage: Message = {
      id: uuidv4(),
      conversationId,
      role: 'user',
      content,
      createdAt: new Date()
    };

    // 使用 ClientService 处理消息
    const responses = await this.clientService.handleMessage({
      runtime,
      content,
      userId: 'user',
      roomId: conversationId
    });

    // 创建 agent 响应消息
    const agentResponse: Message = {
      id: uuidv4(),
      conversationId,
      role: 'assistant',
      content: responses[0]?.text || '抱歉，我现在无法回答。',
      createdAt: new Date()
    };

    // 更新消息列表
    const messages = this.messages.get(conversationId) || [];
    messages.push(userMessage, agentResponse);
    this.messages.set(conversationId, messages);

    // 更新对话的最后消息时间
    conversation.lastMessageAt = new Date();
    this.conversations.set(conversationId, conversation);

    return agentResponse;
  }
} 