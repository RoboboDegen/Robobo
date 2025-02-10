import { Agent, CreateAgentBody } from '../types'
import { RuntimeManager, StorageService } from '@elizant/core'
import { AgentSpecService } from './spec.service'

export class AgentService {
  private static instance: AgentService;
  private runtimeManager: RuntimeManager;
  private storageService: StorageService;
  private specService: AgentSpecService;

  private constructor() {
    this.runtimeManager = new RuntimeManager();
    this.storageService = new StorageService({
      database: {
        type: 'sqlite',
        options: {
          sqlitePath: './data/elizant.db'
        }
      }
    });
    this.specService = AgentSpecService.getInstance();
  }

  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  async createAgent(data: CreateAgentBody): Promise<Agent> {
    // 1. 创建 Spec
    const specData = await this.specService.createSpec({
      name: data.name,
      bio: data.description || `A helpful agent named ${data.name}`,
      system: `You are ${data.name}, ${data.description || 'a helpful assistant'}.`,
      modelProvider: data.modelProvider || 'openai',
      knowledge: data.knowledge ? [data.knowledge] : [],
      lore: data.style
    });

    // 2. 生成 OpenAPI Spec
    const spec = await this.specService.generateOpenAPISpec(specData.id);
    if (!spec) {
      throw new Error('Failed to generate OpenAPI spec');
    }

    // 3. 创建 Agent Runtime
    const runtime = await this.runtimeManager.createAgent(
      spec,
      this.storageService,
      process.env.OPENAI_API_KEY || ''
    );

    // 4. 构建返回数据
    const agent: Agent = {
      id: runtime.agentId,
      name: data.name,
      description: data.description,
      topics: data.topics,
      style: data.style,
      knowledge: data.knowledge,
      modelProvider: data.modelProvider,
      createdAt: new Date()
    };

    return agent;
  }

  async getAgent(id: string): Promise<Agent | null> {
    const runtime = await this.runtimeManager.getAgent(id);
    if (!runtime) return null;

    const character = runtime.character;
    return {
      id: runtime.agentId,
      name: character.name,
      description: character.bio,
      topics: character.topics,
      style: character.style.all.join(', '),
      knowledge: character.knowledge.join('\n'),
      modelProvider: character.modelProvider,
      createdAt: new Date() // TODO: 需要从存储中获取实际创建时间
    };
  }

  async getAllAgents(): Promise<Agent[]> {
    const runtimes = await this.runtimeManager.getAllAgents();
    return runtimes.map(runtime => ({
      id: runtime.agentId,
      name: runtime.character.name,
      description: runtime.character.bio,
      topics: runtime.character.topics,
      style: runtime.character.style.all.join(', '),
      knowledge: runtime.character.knowledge.join('\n'),
      modelProvider: runtime.character.modelProvider,
      createdAt: new Date() // TODO: 需要从存储中获取实际创建时间
    }));
  }
} 