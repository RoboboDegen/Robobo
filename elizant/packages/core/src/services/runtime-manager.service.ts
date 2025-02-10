import { 
  Service, 
  ServiceType,
  IAgentRuntime,
  AgentRuntime,
  UUID,
  elizaLogger,
  ModelProviderName,
  ICacheManager,
  CacheStore,
  CacheOptions,
  Character,
  validateCharacterConfig,
  CacheManager,
  DbCacheAdapter,
  stringToUuid
} from "@elizaos/core";
import { ElizantServiceType, ElizantSpec } from "../types";
import { IStorageService } from "./storage.service";

/**
 * 运行时管理器服务
 * 负责管理代理运行时的生命周期，包括：
 * 1. 创建和初始化代理实例
 * 2. 管理代理的记忆空间
 * 3. 维护代理运行时的状态
 * 4. 处理代理的生命周期事件
 */
export class RuntimeManager extends Service {
  /** 存储所有运行中的代理实例，键为记忆空间ID */
  private runtimes: Map<UUID, AgentRuntime> = new Map();
  
  /** 获取服务类型 */
  static get serviceType(): ServiceType {
    return ElizantServiceType.RUNTIME;
  }

  /**
   * 初始化运行时管理器
   * @param _runtime 代理运行时实例
   */
  async initialize(_runtime: IAgentRuntime): Promise<void> {
    elizaLogger.info("AgentManager initialized");
  }

  /**
   * 类型守卫：检查是否是有效的角色配置
   * @param character 待验证的角色配置
   * @returns 是否为有效的角色配置
   */
  private isValidCharacter(character: unknown): character is Character {
    try {
      validateCharacterConfig(character);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 创建新的代理运行时实例
   * 
   * @param spec Elizant OpenAPI 规范，包含角色定义和扩展配置
   * @param storageService 存储服务，提供数据持久化和缓存能力
   * @param token 认证令牌，用于API调用和身份验证
   * @param memoryId 可选的记忆空间ID，用于：
   *                1. 隔离不同实例的记忆
   *                2. 允许多个实例共享记忆
   *                如果不提供，将基于角色名生成唯一ID
   * @returns 创建的代理运行时实例
   * @throws 如果角色配置无效，将抛出错误
   */
  async createAgent(
    spec: ElizantSpec,
    storageService: IStorageService,
    token: string,
    memoryId?: UUID,
  ): Promise<AgentRuntime> {
    // 从规范中提取角色配置
    const character = spec['x-elizant'] as Character;

    // 验证角色配置的有效性
    if (!this.isValidCharacter(character)) {
      throw new Error(`Invalid character configuration: ${JSON.stringify(character)}`);
    }

    // 确定记忆空间ID：优先使用传入的ID，否则基于角色名生成
    const agentMemoryId = memoryId || stringToUuid(character.name);

    // 创建代理运行时实例
    const agentRuntime = new AgentRuntime({
      // 基础配置
      agentId: agentMemoryId,
      character,
      modelProvider: character.modelProvider || ModelProviderName.OPENAI,
      token,
      
      // 存储配置
      databaseAdapter: storageService.getDatabaseAdapter(),
      cacheManager: new CacheManager(new DbCacheAdapter(storageService.getCacheAdapter(), agentMemoryId)),
      
      // 扩展配置
      plugins: character.plugins, // 插件列表，用于扩展功能
      services: [storageService], // 服务列表，可以从配置中加载
    });

    // 初始化运行时
    await agentRuntime.initialize();
    
    // 注册到运行时管理器
    this.runtimes.set(agentMemoryId, agentRuntime);
    
    return agentRuntime;
  }

  /**
   * 获取指定记忆空间ID的代理实例
   * @param id 记忆空间ID
   * @returns 代理运行时实例，如果不存在则返回undefined
   */
  async getAgent(id: UUID): Promise<AgentRuntime | undefined> {
    return this.runtimes.get(id);
  }

  /**
   * 获取所有运行中的代理实例
   * @returns 代理运行时实例数组
   */
  async getAllAgents(): Promise<AgentRuntime[]> {
    return Array.from(this.runtimes.values());
  }

  /**
   * 删除指定记忆空间ID的代理实例
   * @param id 记忆空间ID
   * @returns 是否成功删除
   */
  async deleteAgent(id: UUID): Promise<boolean> {
    const runtime = this.runtimes.get(id);
    if (runtime) {
      // 停止代理运行时
      await runtime.stop();
      // 从管理器中移除
      return this.runtimes.delete(id);
    }
    return false;
  }
} 