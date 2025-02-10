import { t } from 'elysia'

// 定义模型提供商枚举
export enum ModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  AZURE = 'azure'
}

// 使用 string 替代 UUID，因为在 API 层面我们使用字符串
export interface Agent {
  id: string;
  name: string;
  description?: string;
  topics?: string[];
  style?: string;
  knowledge?: string;
  modelProvider: ModelProvider;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  agentId: string;
  title: string;
  createdAt: Date;
  lastMessageAt: Date;
}

// 路由参数类型
export interface RouteParams {
  id: string;
  agentId: string;
  conversationId: string;
}

// Elysia 验证器
export const CreateAgentSchema = {
  body: t.Object({
    name: t.String(),
    description: t.Optional(t.String()),
    topics: t.Optional(t.Array(t.String())),
    style: t.Optional(t.String()),
    knowledge: t.Optional(t.String()),
    modelProvider: t.Enum(ModelProvider)
  })
}

export const ChatMessageSchema = {
  body: t.Object({
    message: t.String()
  })
}

export type CreateAgentBody = {
  name: string;
  description?: string;
  topics?: string[];
  style?: string;
  knowledge?: string;
  modelProvider: ModelProvider;
}

export type ChatMessageBody = {
  message: string;
} 