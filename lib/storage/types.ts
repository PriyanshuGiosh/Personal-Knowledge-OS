import { UUID } from '@/types';

/**
 * Storage-specific types for the local-first architecture
 * These types handle the bridge between domain models and storage implementation
 */

// Database configuration
export interface DatabaseConfig {
  name: string;
  version: number;
  stores: ObjectStoreConfig[];
}

export interface ObjectStoreConfig {
  name: string;
  keyPath: string;
  indices?: IndexConfig[];
}

export interface IndexConfig {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
}

// Storage operation results
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BatchResult {
  success: boolean;
  successCount: number;
  errors: Array<{ id: UUID; error: string }>;
}

// Query options for advanced retrieval
export interface QueryOptions {
  index?: string;
  range?: IDBKeyRange;
  direction?: IDBCursorDirection;
  limit?: number;
  offset?: number;
}

export interface NoteQueryOptions extends QueryOptions {
  tags?: UUID[];
  isArchived?: boolean;
  isPinned?: boolean;
  searchTerm?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Migration types for database schema updates
export interface Migration {
  version: number;
  description: string;
  up: (db: IDBDatabase) => Promise<void>;
  down?: (db: IDBDatabase) => Promise<void>;
}

// Storage events for reactive updates
export type StorageEventType = 'created' | 'updated' | 'deleted';

export interface StorageEvent {
  type: StorageEventType;
  storeName: string;
  key: UUID;
  data?: unknown;
  timestamp: Date;
}

// Error types
export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export const StorageErrorCodes = {
  DATABASE_OPEN_FAILED: 'DATABASE_OPEN_FAILED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  OBJECT_STORE_NOT_FOUND: 'OBJECT_STORE_NOT_FOUND',
  KEY_NOT_FOUND: 'KEY_NOT_FOUND',
  INVALID_DATA: 'INVALID_DATA',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Type guards
export function isStorageError(error: unknown): error is StorageError {
  return error instanceof StorageError;
}