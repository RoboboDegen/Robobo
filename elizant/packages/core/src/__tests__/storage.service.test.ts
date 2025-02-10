import { StorageService, StorageConfig } from '../services/storage.service';
import { IAgentRuntime, IDatabaseAdapter, IDatabaseCacheAdapter } from '@elizaos/core';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { UUID } from 'crypto';
import { ModelProviderName } from '@elizaos/core';

vi.mock('@elizaos/adapter-sqlite');
vi.mock('@elizaos/adapter-postgres');
vi.mock('@elizaos/adapter-supabase');
vi.mock('@elizaos/adapter-pglite');
vi.mock('better-sqlite3');

describe('StorageService', () => {
  let storageService: StorageService;
  let mockRuntime: IAgentRuntime;

  beforeEach(() => {
    mockRuntime = {
      agentId: 'test-agent' as UUID,
      serverUrl: 'http://test.com',
      token: 'test-token',
      modelProvider: ModelProviderName.OPENAI
    } as unknown as IAgentRuntime;
  });

  describe('默认配置', () => {
    beforeEach(() => {
      storageService = new StorageService();
    });

    it('应该使用默认的 SQLite 配置初始化', () => {
      expect(storageService.getDatabaseAdapter()).toBeDefined();
      expect(storageService.getCacheAdapter()).toBeDefined();
    });
  });

  describe('SQLite 配置', () => {
    const sqliteConfig: StorageConfig = {
      database: {
        type: 'sqlite',
        options: {
          sqlitePath: ':memory:',
          memory: true
        }
      },
      cache: {
        type: 'sqlite',
        options: {
          sqlitePath: ':memory:',
          memory: true
        }
      }
    };

    beforeEach(() => {
      storageService = new StorageService(sqliteConfig);
    });

    it('应该正确初始化 SQLite 适配器', () => {
      const dbAdapter = storageService.getDatabaseAdapter();
      const cacheAdapter = storageService.getCacheAdapter();

      expect(dbAdapter).toBeDefined();
      expect(cacheAdapter).toBeDefined();
    });
  });

  describe('Postgres 配置', () => {
    const postgresConfig: StorageConfig = {
      database: {
        type: 'postgres',
        options: {
          connectionString: 'postgresql://localhost:5432/test'
        }
      },
      cache: {
        type: 'postgres',
        options: {
          connectionString: 'postgresql://localhost:5432/test_cache'
        }
      }
    };

    beforeEach(() => {
      storageService = new StorageService(postgresConfig);
    });

    it('应该正确初始化 Postgres 适配器', () => {
      const dbAdapter = storageService.getDatabaseAdapter();
      const cacheAdapter = storageService.getCacheAdapter();

      expect(dbAdapter).toBeDefined();
      expect(cacheAdapter).toBeDefined();
    });
  });

  describe('Supabase 配置', () => {
    const supabaseConfig: StorageConfig = {
      database: {
        type: 'supabase',
        options: {
          supabaseUrl: 'https://test.supabase.co',
          supabaseKey: 'test-key'
        }
      }
    };

    beforeEach(() => {
      storageService = new StorageService(supabaseConfig);
    });

    it('应该正确初始化 Supabase 适配器', () => {
      const dbAdapter = storageService.getDatabaseAdapter();
      expect(dbAdapter).toBeDefined();
    });
  });

  describe('PGLite 配置', () => {
    const pgliteConfig: StorageConfig = {
      database: {
        type: 'pglite',
        options: {
          memory: true
        }
      }
    };

    beforeEach(() => {
      storageService = new StorageService(pgliteConfig);
    });

    it('应该正确初始化 PGLite 适配器', () => {
      const dbAdapter = storageService.getDatabaseAdapter();
      expect(dbAdapter).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('应该在配置类型无效时抛出错误', () => {
      const invalidConfig = {
        database: {
          type: 'invalid' as any
        }
      };

      expect(() => new StorageService(invalidConfig)).toThrow();
    });

    it('应该在适配器未初始化时抛出错误', () => {
      const emptyService = new StorageService();
      (emptyService as any).databaseAdapter = undefined;
      (emptyService as any).cacheAdapter = undefined;

      expect(() => emptyService.getDatabaseAdapter()).toThrow();
      expect(() => emptyService.getCacheAdapter()).toThrow();
    });
  });

  describe('生命周期管理', () => {
    let mockDbAdapter: IDatabaseAdapter & { init: Mock; close: Mock };
    let mockCacheAdapter: IDatabaseCacheAdapter & { init: Mock; close: Mock };

    beforeEach(() => {
      mockDbAdapter = {
        init: vi.fn(),
        close: vi.fn(),
      } as unknown as IDatabaseAdapter & { init: Mock; close: Mock };

      mockCacheAdapter = {
        init: vi.fn(),
        close: vi.fn(),
      } as unknown as IDatabaseCacheAdapter & { init: Mock; close: Mock };

      storageService = new StorageService();
      (storageService as any).databaseAdapter = mockDbAdapter;
      (storageService as any).cacheAdapter = mockCacheAdapter;
    });

    it('应该正确初始化适配器', async () => {
      await storageService.initialize(mockRuntime);
      
      expect(mockDbAdapter.init).toHaveBeenCalled();
      expect(mockCacheAdapter.init).toHaveBeenCalled();
    });

    it('应该正确关闭适配器', async () => {
      await storageService.close();
      
      expect(mockDbAdapter.close).toHaveBeenCalled();
      expect(mockCacheAdapter.close).toHaveBeenCalled();
    });
  });
}); 