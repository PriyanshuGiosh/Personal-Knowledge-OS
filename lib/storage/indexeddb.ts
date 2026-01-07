import { UUID, SyncableEntity } from '@/types';
import {
  DatabaseConfig,
  StorageResult,
  StorageError,
  StorageErrorCodes,
  QueryOptions
} from './types';

/**
 * IndexedDB implementation for local-first storage
 *
 * Design choices:
 * - IndexedDB over LocalStorage: Better performance, larger storage (~1GB+), async operations
 * - Single database with multiple object stores for different entity types
 * - Indexed fields for efficient querying (tags, timestamps, etc.)
 * - Version-based migrations for schema evolution
 * - Transaction-based operations for data consistency
 * - Error handling with custom StorageError types
 */
export class IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private readonly config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  /**
   * Initialize the database connection
   * Handles database creation, upgrades, and migrations
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);

      request.onerror = () => {
        reject(new StorageError(
          'Failed to open database',
          StorageErrorCodes.DATABASE_OPEN_FAILED,
          request.error
        ));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  /**
   * Create object stores based on configuration
   * Each entity type gets its own store with appropriate indices
   */
  private createObjectStores(db: IDBDatabase): void {
    this.config.stores.forEach(storeConfig => {
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(storeConfig.name)) {
        const store = db.createObjectStore(storeConfig.name, {
          keyPath: storeConfig.keyPath
        });

        // Create indices for efficient querying
        storeConfig.indices?.forEach(index => {
          store.createIndex(index.name, index.keyPath, { unique: index.unique });
        });
      }
    });
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Generic CRUD operations
   */

  async create<T extends SyncableEntity>(
    storeName: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'sync'>
  ): Promise<T> {
    if (!this.db) throw new StorageError('Database not initialized', StorageErrorCodes.DATABASE_OPEN_FAILED);

    const now = new Date();
    const entity = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      sync: {
        version: 1,
        syncedAt: undefined,
        isDeleted: false
      }
    } as T;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(entity);

      request.onsuccess = () => resolve(entity);
      request.onerror = () => reject(new StorageError(
        `Failed to create ${storeName}`,
        StorageErrorCodes.TRANSACTION_FAILED,
        request.error
      ));
    });
  }

  async get<T>(storeName: string, id: UUID): Promise<T | null> {
    if (!this.db) throw new StorageError('Database not initialized', StorageErrorCodes.DATABASE_OPEN_FAILED);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new StorageError(
        `Failed to get ${storeName} with id ${id}`,
        StorageErrorCodes.TRANSACTION_FAILED,
        request.error
      ));
    });
  }

  async getAll<T>(
    storeName: string,
    options: QueryOptions = {}
  ): Promise<T[]> {
    if (!this.db) throw new StorageError('Database not initialized', StorageErrorCodes.DATABASE_OPEN_FAILED);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      let request: IDBRequest;

      if (options.index && options.range) {
        const index = store.index(options.index);
        request = index.openCursor(options.range, options.direction);
      } else {
        request = store.openCursor(null, options.direction);
      }

      const results: T[] = [];
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && (!options.limit || count < options.limit)) {
          if (!options.offset || count >= options.offset) {
            results.push(cursor.value);
          }
          count++;
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(new StorageError(
        `Failed to get all ${storeName}`,
        StorageErrorCodes.TRANSACTION_FAILED,
        request.error
      ));
    });
  }

  async update<T extends SyncableEntity>(
    storeName: string,
    id: UUID,
    updates: Partial<T>
  ): Promise<T> {
    if (!this.db) throw new StorageError('Database not initialized', StorageErrorCodes.DATABASE_OPEN_FAILED);

    // First get the current entity
    const current = await this.get<T>(storeName, id);
    if (!current) {
      throw new StorageError(
        `${storeName} with id ${id} not found`,
        StorageErrorCodes.KEY_NOT_FOUND
      );
    }

    // Merge updates
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date(),
      sync: {
        ...current.sync,
        version: current.sync.version + 1
      }
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(updated);

      request.onsuccess = () => resolve(updated);
      request.onerror = () => reject(new StorageError(
        `Failed to update ${storeName} with id ${id}`,
        StorageErrorCodes.TRANSACTION_FAILED,
        request.error
      ));
    });
  }

  async delete(storeName: string, id: UUID): Promise<void> {
    if (!this.db) throw new StorageError('Database not initialized', StorageErrorCodes.DATABASE_OPEN_FAILED);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new StorageError(
        `Failed to delete ${storeName} with id ${id}`,
        StorageErrorCodes.TRANSACTION_FAILED,
        request.error
      ));
    });
  }

  /**
   * Batch operations for performance
   */
  async batchCreate<T extends SyncableEntity>(
    storeName: string,
    items: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'sync'>>
  ): Promise<StorageResult<T[]>> {
    if (!this.db) {
      return {
        success: false,
        error: 'Database not initialized'
      };
    }

    try {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const results: T[] = [];

      for (const item of items) {
        const entity = await new Promise<T>((resolve, reject) => {
          const now = new Date();
          const entity = {
            ...item,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
            sync: {
              version: 1,
              syncedAt: undefined,
              isDeleted: false
            }
          } as T;

          const request = store.add(entity);
          request.onsuccess = () => resolve(entity);
          request.onerror = () => reject(request.error);
        });
        results.push(entity);
      }

      return { success: true, data: results };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch create failed'
      };
    }
  }

  /**
   * Clear all data (useful for testing or reset)
   */
  async clear(storeName: string): Promise<void> {
    if (!this.db) throw new StorageError('Database not initialized', StorageErrorCodes.DATABASE_OPEN_FAILED);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new StorageError(
        `Failed to clear ${storeName}`,
        StorageErrorCodes.TRANSACTION_FAILED,
        request.error
      ));
    });
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{ [storeName: string]: number }> {
    if (!this.db) throw new StorageError('Database not initialized', StorageErrorCodes.DATABASE_OPEN_FAILED);

    const stats: { [storeName: string]: number } = {};

    for (const storeName of this.db.objectStoreNames) {
      const count = await new Promise<number>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      stats[storeName] = count;
    }

    return stats;
  }
}