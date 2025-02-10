// 导出所有子模块的类型
export * from './elizant';
export * from './runtime';
import { 
    IAgentRuntime,
    Character,
    Memory,
    Content,
    State,
    Client,
    Plugin,
    Service,
    ServiceType,
    ModelClass,
    ModelProviderName,
    IDatabaseAdapter,
    IMemoryManager,
    CacheStore,
    ICacheManager,
    IDatabaseCacheAdapter
} from "@elizaos/core";

// 从 eliza 导出核心类型
export type {
  IAgentRuntime,
  Character,
  Memory,
  Content,
  State,
  Client,
  Plugin,
  Service,
  ServiceType,
  ModelClass,
  ModelProviderName,
  IDatabaseAdapter,
  IMemoryManager,
  CacheStore,
  ICacheManager,
  IDatabaseCacheAdapter
};
  
// 扩展 ServiceType
export const ElizantServiceType = {
    STORAGE: "elizant_storage" as ServiceType,
    CLIENT: "elizant_client" as ServiceType,
    RUNTIME: "elizant_runtime" as ServiceType,
    AGENT_CONFIG: "agent_config" as ServiceType,
} as const;

