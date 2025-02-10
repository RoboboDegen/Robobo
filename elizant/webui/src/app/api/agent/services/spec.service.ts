import { v4 as uuidv4 } from 'uuid';
import { ElizantSpec } from '@elizant/core';

// 用户输入的 Agent 配置格式
export interface AgentSpecInput {
  id?: string;
  // 基础信息（必填）
  name: string;                     // Agent 名称
  bio: string;                      // Agent 的自我认知描述
  system: string;                   // 系统指令,用于限制 Agent 的行为和输出
  modelProvider: string;            // 模型提供商
  
  // 知识库（可选）
  knowledge?: string[];              // Agent 的知识库内容
  
  // 可选字段
  lore?: string;                    // Agent 的详细背景故事
  createdAt?: Date;
}

export class AgentSpecService {
  private static instance: AgentSpecService;
  private specs: Map<string, AgentSpecInput> = new Map();

  private constructor() {}

  public static getInstance(): AgentSpecService {
    if (!AgentSpecService.instance) {
      AgentSpecService.instance = new AgentSpecService();
    }
    return AgentSpecService.instance;
  }

  // 创建新的 Agent Spec
  async createSpec(input: Omit<AgentSpecInput, 'id' | 'createdAt'>): Promise<AgentSpecInput> {
    const id = uuidv4();
    const spec: AgentSpecInput = {
      id,
      ...input,
      createdAt: new Date()
    };
    this.specs.set(id, spec);
    return spec;
  }

  // 获取特定的 Agent Spec
  async getSpec(id: string): Promise<AgentSpecInput | null> {
    return this.specs.get(id) || null;
  }

  // 获取所有 Agent Specs
  async getAllSpecs(): Promise<AgentSpecInput[]> {
    return Array.from(this.specs.values());
  }

  // 生成 OpenAPI 规范
  async generateOpenAPISpec(id: string): Promise<ElizantSpec | null> {
    const spec = await this.getSpec(id);
    if (!spec) return null;

    const openAPISpec: ElizantSpec = {
      openapi: '3.0.0',
      info: {
        title: spec.name,
        description: spec.bio,
        version: '1.0.0'
      },
      paths: {
        '/chat': {
          post: {
            summary: 'Chat with the agent',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Agent response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        response: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      'x-elizant': {
        name: spec.name,
        bio: spec.bio,
        system: spec.system,
        modelProvider: spec.modelProvider,
        knowledge: spec.knowledge || [],
        lore: spec.lore ? [spec.lore] : [],
        topics: [],
        adjectives: [],
        style: {
          all: [],
          chat: [],
          post: []
        },
        messageExamples: [],
        postExamples: [],
        plugins: [],
        clients: [],
        settings: {}
      }
    };

    return openAPISpec;
  }
} 