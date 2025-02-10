import {
  Service,
  ServiceType,
  IAgentRuntime,
  elizaLogger,
  IDatabaseAdapter,
  IDatabaseCacheAdapter,
} from "@elizaos/core";
import { ElizantServiceType } from "../types";
import path from "path";

/**
 * 存储服务接口
 * 提供统一的数据库和缓存适配器访问方法
 */
export interface IStorageService extends Service {
  /**
   * 获取数据库适配器实例
   * @throws {Error} 当数据库适配器未初始化时抛出异常
   * @returns {IDatabaseAdapter} 数据库适配器实例
   */
  getDatabaseAdapter(): IDatabaseAdapter;

  /**
   * 获取缓存适配器实例
   * @throws {Error} 当缓存适配器未初始化时抛出异常
   * @returns {IDatabaseCacheAdapter} 缓存适配器实例
   */
  getCacheAdapter(): IDatabaseCacheAdapter;
}

/**
 * 基础配置接口，所有具体配置都继承自此接口
 * 提供通用的 options 字段，允许扩展额外的配置选项
 */
interface BaseConfig {
  options?: Record<string, unknown>;
}

/**
 * 数据库配置部分
 * 支持多种数据库类型，每种类型都有其特定的配置选项
 */
interface SQLiteDatabaseConfig extends BaseConfig {
  type: "sqlite";
  options?: {
    sqlitePath?: string;     // 数据库文件路径
    memory?: boolean;        // 是否使用内存数据库
    readonly?: boolean;      // 是否只读模式
    fileMustExist?: boolean; // 文件必须存在
  };
}

interface PostgresDatabaseConfig extends BaseConfig {
  type: "postgres";
  options: {
    connectionString: string;           // 连接字符串
    max?: number;                       // 最大连接数
    idleTimeoutMillis?: number;        // 空闲超时时间
    connectionTimeoutMillis?: number;   // 连接超时时间
  };
}

interface SupabaseDatabaseConfig extends BaseConfig {
  type: "supabase";
  options: {
    supabaseUrl: string;    // Supabase URL
    supabaseKey: string;    // Supabase API Key
  };
}

interface PGLiteDatabaseConfig extends BaseConfig {
  type: "pglite";
  options?: {
    dataDir?: string;    // 数据目录
    memory?: boolean;    // 是否使用内存模式
  };
}

/**
 * 缓存配置部分
 * 支持多种缓存实现，包括专用缓存（Redis）和数据库复用（SQLite/Postgres/PGLite）
 */
interface RedisCacheConfig extends BaseConfig {
  type: "redis";
  options: {
    url: string;    // Redis 连接 URL
  };
}

interface SQLiteCacheConfig extends BaseConfig {
  type: "sqlite";
  options?: {
    sqlitePath?: string;     // 缓存数据库文件路径
    memory?: boolean;        // 是否使用内存数据库
    readonly?: boolean;      // 是否只读模式
    fileMustExist?: boolean; // 文件必须存在
  };
}

interface PostgresCacheConfig extends BaseConfig {
  type: "postgres";
  options: {
    connectionString: string;           // 连接字符串
    max?: number;                       // 最大连接数
    idleTimeoutMillis?: number;        // 空闲超时时间
    connectionTimeoutMillis?: number;   // 连接超时时间
  };
}

interface PGLiteCacheConfig extends BaseConfig {
  type: "pglite";
  options?: {
    dataDir?: string;    // 数据目录
    memory?: boolean;    // 是否使用内存模式
  };
}

// 数据库配置类型联合
export type DatabaseConfig =
  | SQLiteDatabaseConfig
  | PostgresDatabaseConfig
  | SupabaseDatabaseConfig
  | PGLiteDatabaseConfig;

// 缓存配置类型联合
export type CacheConfig =
  | RedisCacheConfig
  | SQLiteCacheConfig
  | PostgresCacheConfig
  | PGLiteCacheConfig;

/**
 * 存储服务的完整配置接口
 * 允许分别配置数据库和缓存，两者都是可选的
 * 如果都不配置，将使用默认的 SQLite 实现
 */
export interface StorageConfig {
  database?: DatabaseConfig;
  cache?: CacheConfig;
}

/**
 * 具有初始化能力的适配器接口
 */
type AdapterWithInit = {
  init: () => Promise<void>;
};

/**
 * 具有关闭能力的适配器接口
 */
type AdapterWithClose = {
  close: () => Promise<void>;
};

/**
 * StorageService 类
 * 负责管理存储适配器的生命周期，提供统一的存储访问接口
 * 
 * 主要功能：
 * 1. 提供零配置的默认存储方案（SQLite）
 * 2. 支持灵活切换不同的存储适配器
 * 3. 支持数据库和缓存分离或复用
 * 4. 管理适配器的初始化和关闭
 * 
 * 设计考虑：
 * 1. 适配器实例管理：通过 isSharedInstance 标志管理实例共享
 * 2. 类型安全：使用类型守卫确保类型安全
 * 3. 优雅降级：在缺少配置时提供合理的默认值
 * 4. 资源管理：正确处理初始化和清理
 */
export class StorageService extends Service implements IStorageService {
  private databaseAdapter?: IDatabaseAdapter;         // 数据库适配器实例
  private cacheAdapter?: IDatabaseCacheAdapter;       // 缓存适配器实例
  private isSharedInstance = false;                   // 是否共享实例标志

  constructor(config?: StorageConfig) {
    super();
    this.initializeAdapters(config);
  }

  /**
   * 初始化默认的 SQLite 适配器
   * 用于零配置场景或作为后备方案
   */
  private initializeDefaultSQLite() {
    const { SqliteDatabaseAdapter } = require("@elizaos/adapter-sqlite");
    const Database = require("better-sqlite3");
    const dataDir = path.join(process.cwd(), "data");
    const dbPath = path.join(dataDir, "elizant.db");
    return new SqliteDatabaseAdapter(new Database(dbPath));
  }

  /**
   * 初始化数据库适配器
   * 根据配置创建相应的数据库适配器实例
   */
  private initializeDatabaseAdapter(config?: DatabaseConfig): IDatabaseAdapter {
    if (!config) {
      return this.initializeDefaultSQLite();
    }

    switch (config.type) {
      case "sqlite": {
        const { SqliteDatabaseAdapter } = require("@elizaos/adapter-sqlite");
        const Database = require("better-sqlite3");
        const dbPath =
          config.options?.sqlitePath ||
          path.join(process.cwd(), "data", "elizant.db");
        return new SqliteDatabaseAdapter(
          new Database(dbPath, {
            memory: config.options?.memory,
            readonly: config.options?.readonly,
            fileMustExist: config.options?.fileMustExist,
          })
        );
      }

      case "postgres": {
        const { PostgresDatabaseAdapter } = require("@elizaos/adapter-postgres");
        return new PostgresDatabaseAdapter({
          connectionString: config.options.connectionString,
          max: config.options.max || 20,
          idleTimeoutMillis: config.options.idleTimeoutMillis || 30000,
          connectionTimeoutMillis: config.options.connectionTimeoutMillis || 2000,
        });
      }

      case "supabase": {
        const { SupabaseDatabaseAdapter } = require("@elizaos/adapter-supabase");
        return new SupabaseDatabaseAdapter(
          config.options.supabaseUrl,
          config.options.supabaseKey
        );
      }

      case "pglite": {
        const { PGLiteDatabaseAdapter } = require("@elizaos/adapter-pglite");
        return new PGLiteDatabaseAdapter({
          dataDir: config.options?.dataDir || path.join(process.cwd(), "data"),
          memory: config.options?.memory,
        });
      }

      default:
        throw new Error(`Unsupported database type: ${(config as any).type}`);
    }
  }

  /**
   * 初始化缓存适配器
   * 根据配置创建相应的缓存适配器实例
   */
  private initializeCacheAdapter(config?: CacheConfig): IDatabaseCacheAdapter {
    if (!config) {
      return this.initializeDefaultSQLite();
    }

    switch (config.type) {
      case "redis": {
        const { RedisClient } = require("@elizaos/adapter-redis");
        return new RedisClient(config.options.url);
      }

      case "sqlite": {
        const { SqliteDatabaseAdapter } = require("@elizaos/adapter-sqlite");
        const Database = require("better-sqlite3");
        const dbPath =
          config.options?.sqlitePath ||
          path.join(process.cwd(), "data", "elizant-cache.db");
        return new SqliteDatabaseAdapter(
          new Database(dbPath, {
            memory: config.options?.memory,
            readonly: config.options?.readonly,
            fileMustExist: config.options?.fileMustExist,
          })
        );
      }

      case "postgres": {
        const { PostgresDatabaseAdapter } = require("@elizaos/adapter-postgres");
        return new PostgresDatabaseAdapter({
          connectionString: config.options.connectionString,
          max: config.options.max || 20,
          idleTimeoutMillis: config.options.idleTimeoutMillis || 30000,
          connectionTimeoutMillis: config.options.connectionTimeoutMillis || 2000,
        });
      }

      case "pglite": {
        const { PGLiteDatabaseAdapter } = require("@elizaos/adapter-pglite");
        return new PGLiteDatabaseAdapter({
          dataDir: config.options?.dataDir || path.join(process.cwd(), "data"),
          memory: config.options?.memory,
        });
      }

      default:
        throw new Error(`Unsupported cache type: ${(config as any).type}`);
    }
  }

  /**
   * 初始化适配器
   * 处理四种场景：
   * 1. 无配置：使用默认SQLite作为共享实例
   * 2. 仅数据库配置：初始化数据库，尝试复用作为缓存
   * 3. 仅缓存配置：使用默认SQLite作为数据库，配置的缓存实例
   * 4. 完整配置：分别初始化数据库和缓存实例
   */
  private initializeAdapters(config?: StorageConfig): void {
    if (!config?.database && !config?.cache) {
      // 场景1: 无配置，使用默认SQLite作为共享实例
      const defaultAdapter = this.initializeDefaultSQLite();
      this.databaseAdapter = defaultAdapter;
      this.cacheAdapter = defaultAdapter;
      this.isSharedInstance = true;
      return;
    }

    // 初始化数据库适配器
    if (config?.database) {
      this.databaseAdapter = this.initializeDatabaseAdapter(config.database);
    } else {
      // 场景3: 仅缓存配置，使用默认SQLite作为数据库
      this.databaseAdapter = this.initializeDefaultSQLite();
    }

    // 初始化缓存适配器
    if (config?.cache) {
      // 场景3和4: 使用配置的缓存实例
      this.cacheAdapter = this.initializeCacheAdapter(config.cache);
      this.isSharedInstance = false;
    } else {
      // 场景2: 尝试复用数据库适配器作为缓存
      const adapter = this.databaseAdapter;
      if (this.isCacheAdapter(adapter)) {
        this.cacheAdapter = adapter;
        this.isSharedInstance = true;
      } else {
        // 数据库不支持缓存功能，使用默认SQLite
        this.cacheAdapter = this.initializeDefaultSQLite();
        this.isSharedInstance = false;
      }
    }
  }

  /**
   * 类型守卫：检查适配器是否实现了缓存接口
   */
  private isCacheAdapter(adapter: unknown): adapter is IDatabaseCacheAdapter {
    if (!adapter || typeof adapter !== "object") return false;

    return (
      "getCache" in adapter &&
      "setCache" in adapter &&
      "deleteCache" in adapter &&
      typeof (adapter as IDatabaseCacheAdapter).getCache === "function" &&
      typeof (adapter as IDatabaseCacheAdapter).setCache === "function" &&
      typeof (adapter as IDatabaseCacheAdapter).deleteCache === "function"
    );
  }

  static get serviceType(): ServiceType {
    return ElizantServiceType.STORAGE;
  }

  /**
   * 初始化服务
   * 按需初始化数据库和缓存适配器
   * 如果是共享实例，避免重复初始化
   */
  async initialize(_runtime: IAgentRuntime): Promise<void> {
    if (this.databaseAdapter && this.isAdapterWithInit(this.databaseAdapter)) {
      await this.databaseAdapter.init();
    }
    if (
      this.cacheAdapter &&
      this.isAdapterWithInit(this.cacheAdapter) &&
      !this.isSharedInstance
    ) {
      await this.cacheAdapter.init();
    }
    elizaLogger.info("StorageService initialized");
  }

  /**
   * 类型守卫：检查适配器是否支持初始化
   */
  private isAdapterWithInit(adapter: unknown): adapter is AdapterWithInit {
    return (
      adapter !== null &&
      typeof adapter === "object" &&
      "init" in adapter &&
      typeof (adapter as AdapterWithInit).init === "function"
    );
  }

  /**
   * 类型守卫：检查适配器是否支持关闭
   */
  private isAdapterWithClose(adapter: unknown): adapter is AdapterWithClose {
    return (
      adapter !== null &&
      typeof adapter === "object" &&
      "close" in adapter &&
      typeof (adapter as AdapterWithClose).close === "function"
    );
  }

  /**
   * 获取数据库适配器实例
   * 如果未初始化则抛出异常
   */
  getDatabaseAdapter(): IDatabaseAdapter {
    if (!this.databaseAdapter) {
      throw new Error("No database adapter initialized");
    }
    return this.databaseAdapter;
  }

  /**
   * 获取缓存适配器实例
   * 如果未初始化则抛出异常
   */
  getCacheAdapter(): IDatabaseCacheAdapter {
    if (!this.cacheAdapter) {
      throw new Error("No cache adapter initialized");
    }
    return this.cacheAdapter;
  }

  /**
   * 关闭服务
   * 按需关闭数据库和缓存适配器
   * 如果是共享实例，避免重复关闭
   */
  async close(): Promise<void> {
    if (this.databaseAdapter && this.isAdapterWithClose(this.databaseAdapter)) {
      await this.databaseAdapter.close();
    }
    if (
      this.cacheAdapter &&
      this.isAdapterWithClose(this.cacheAdapter) &&
      !this.isSharedInstance
    ) {
      await this.cacheAdapter.close();
    }
    elizaLogger.info("StorageService closed");
  }
}
