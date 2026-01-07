import { UUID, Note, Tag, Backlink } from '@/types';
import { IndexedDBStorage } from './indexeddb';
import { DatabaseConfig, NoteQueryOptions } from './types';

/**
 * Clean storage abstraction layer for the Personal Knowledge OS
 *
 * Design choices:
 * - Clean interface: UI components don't need to know about IndexedDB
 * - Domain-focused: Methods named after business operations, not storage operations
 * - Async-first: All operations return Promises for non-blocking UI
 * - Error handling: Consistent error handling across all operations
 * - Extensible: Easy to add new entity types and operations
 * - Testable: Interface allows for easy mocking in tests
 */

export interface StorageAdapter {
  // Lifecycle
  initialize(): Promise<void>;
  close(): Promise<void>;

  // Notes CRUD
  createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'sync'>): Promise<Note>;
  getNote(id: UUID): Promise<Note | null>;
  getAllNotes(options?: NoteQueryOptions): Promise<Note[]>;
  updateNote(id: UUID, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'sync'>>): Promise<Note>;
  deleteNote(id: UUID): Promise<void>;

  // Tags CRUD (for future implementation)
  createTag?(tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'sync'>): Promise<Tag>;
  getTag?(id: UUID): Promise<Tag | null>;
  getAllTags?(): Promise<Tag[]>;
  updateTag?(id: UUID, updates: Partial<Omit<Tag, 'id' | 'createdAt' | 'sync'>>): Promise<Tag>;
  deleteTag?(id: UUID): Promise<void>;

  // Backlinks (for future implementation)
  createBacklink?(backlink: Omit<Backlink, 'id' | 'createdAt' | 'updatedAt' | 'sync'>): Promise<Backlink>;
  getBacklinksForNote?(noteId: UUID): Promise<Backlink[]>;

  // Utility methods
  getStats(): Promise<{ [storeName: string]: number }>;
  clearAllData(): Promise<void>;
}

/**
 * IndexedDB-backed storage adapter
 *
 * This implementation provides:
 * - Persistent local storage using IndexedDB
 * - Efficient querying with database indices
 * - Transaction safety for data consistency
 * - Migration support for schema evolution
 */
export class BrainStorage implements StorageAdapter {
  private db: IndexedDBStorage;

  constructor() {
    // Database configuration
    const config: DatabaseConfig = {
      name: 'BrainDB',
      version: 1,
      stores: [
        {
          name: 'notes',
          keyPath: 'id',
          indices: [
            { name: 'createdAt', keyPath: 'createdAt' },
            { name: 'updatedAt', keyPath: 'updatedAt' },
            { name: 'isArchived', keyPath: 'isArchived' },
            { name: 'isPinned', keyPath: 'isPinned' },
            { name: 'tags', keyPath: 'tags', unique: false }, // Multi-entry index
          ]
        },
        {
          name: 'tags',
          keyPath: 'id',
          indices: [
            { name: 'name', keyPath: 'name', unique: true },
            { name: 'createdAt', keyPath: 'createdAt' },
          ]
        },
        {
          name: 'backlinks',
          keyPath: 'id',
          indices: [
            { name: 'sourceNoteId', keyPath: 'sourceNoteId' },
            { name: 'targetNoteId', keyPath: 'targetNoteId' },
            { name: 'linkType', keyPath: 'linkType' },
          ]
        },
        // Future stores can be added here
        // { name: 'attachments', keyPath: 'id', indices: [...] },
        // { name: 'folders', keyPath: 'id', indices: [...] },
        // { name: 'searchIndex', keyPath: 'id', indices: [...] },
      ]
    };

    this.db = new IndexedDBStorage(config);
  }

  async initialize(): Promise<void> {
    await this.db.initialize();
  }

  async close(): Promise<void> {
    await this.db.close();
  }

  // Notes CRUD operations

  async createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'sync'>): Promise<Note> {
    // Initialize arrays if not provided
    const note = {
      ...noteData,
      tags: noteData.tags || [],
      backlinks: noteData.backlinks || [],
      isArchived: noteData.isArchived || false,
      isPinned: noteData.isPinned || false,
    };

    return this.db.create<Note>('notes', note);
  }

  async getNote(id: UUID): Promise<Note | null> {
    return this.db.get<Note>('notes', id);
  }

  async getAllNotes(options: NoteQueryOptions = {}): Promise<Note[]> {
    // For now, get all and filter in memory
    // In a production app, you'd implement more sophisticated querying
    let notes = await this.db.getAll<Note>('notes', {
      direction: options.direction || 'next',
      limit: options.limit,
      offset: options.offset,
    });

    // Apply filters
    if (options.tags && options.tags.length > 0) {
      notes = notes.filter(note =>
        options.tags!.some(tagId => note.tags.includes(tagId))
      );
    }

    if (options.isArchived !== undefined) {
      notes = notes.filter(note => note.isArchived === options.isArchived);
    }

    if (options.isPinned !== undefined) {
      notes = notes.filter(note => note.isPinned === options.isPinned);
    }

    // TODO: Implement full-text search when search index is added
    if (options.searchTerm) {
      const searchTerm = options.searchTerm.toLowerCase();
      notes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm)
      );
    }

    return notes;
  }

  async updateNote(
    id: UUID,
    updates: Partial<Omit<Note, 'id' | 'createdAt' | 'sync'>>
  ): Promise<Note> {
    return this.db.update<Note>('notes', id, updates);
  }

  async deleteNote(id: UUID): Promise<void> {
    // In a full implementation, you'd also clean up backlinks
    // that reference this note
    await this.db.delete('notes', id);
  }

  // Tags CRUD

  async createTag(tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'sync'>): Promise<Tag> {
    // Check if tag with this name already exists
    const existingTags = await this.db.getAll<Tag>('tags', {
      index: 'name',
      range: IDBKeyRange.only(tagData.name)
    });
    if (existingTags.length > 0) {
      return existingTags[0];
    }

    const tag = {
      ...tagData,
      color: tagData.color || '#3b82f6', // Default blue color
      description: tagData.description || '',
      parentId: tagData.parentId || undefined,
      isSystemTag: tagData.isSystemTag || false,
    };

    return this.db.create<Tag>('tags', tag);
  }

  async getTag(id: UUID): Promise<Tag | null> {
    return this.db.get<Tag>('tags', id);
  }

  async getAllTags(): Promise<Tag[]> {
    return this.db.getAll<Tag>('tags');
  }

  async updateTag(
    id: UUID,
    updates: Partial<Omit<Tag, 'id' | 'createdAt' | 'sync'>>
  ): Promise<Tag> {
    return this.db.update<Tag>('tags', id, updates);
  }

  async deleteTag(id: UUID): Promise<void> {
    // Remove this tag from all notes that reference it
    const notesWithTag = await this.db.getAll<Note>('notes', {
      index: 'tags',
      range: IDBKeyRange.only(id)
    });
    for (const note of notesWithTag) {
      const updatedTags = note.tags.filter(tagId => tagId !== id);
      await this.updateNote(note.id, { tags: updatedTags });
    }

    await this.db.delete('tags', id);
  }

  async getTagByName(name: string): Promise<Tag | null> {
    const tags = await this.db.getAll<Tag>('tags', {
      index: 'name',
      range: IDBKeyRange.only(name)
    });
    return tags.length > 0 ? tags[0] : null;
  }

  // Backlinks CRUD

  async createBacklink(backlinkData: Omit<Backlink, 'id' | 'createdAt' | 'updatedAt' | 'sync'>): Promise<Backlink> {
    return this.db.create<Backlink>('backlinks', backlinkData);
  }

  async getBacklink(id: UUID): Promise<Backlink | null> {
    return this.db.get<Backlink>('backlinks', id);
  }

  async getAllBacklinks(): Promise<Backlink[]> {
    return this.db.getAll<Backlink>('backlinks');
  }

  async updateBacklink(
    id: UUID,
    updates: Partial<Omit<Backlink, 'id' | 'createdAt' | 'sync'>>
  ): Promise<Backlink> {
    return this.db.update<Backlink>('backlinks', id, updates);
  }

  async deleteBacklink(id: UUID): Promise<void> {
    await this.db.delete('backlinks', id);
  }

  async getBacklinksForNote(noteId: UUID): Promise<Backlink[]> {
    // Get backlinks where this note is either source or target
    const sourceBacklinks = await this.db.getAll<Backlink>('backlinks', {
      index: 'sourceNoteId',
      range: IDBKeyRange.only(noteId)
    });

    const targetBacklinks = await this.db.getAll<Backlink>('backlinks', {
      index: 'targetNoteId',
      range: IDBKeyRange.only(noteId)
    });

    return [...sourceBacklinks, ...targetBacklinks];
  }

  // Utility methods

  async getStats(): Promise<{ [storeName: string]: number }> {
    return this.db.getStats();
  }

  async clearAllData(): Promise<void> {
    // Clear all stores
    const stores = ['notes', 'tags', 'backlinks'];
    for (const store of stores) {
      await this.db.clear(store);
    }
  }
}

/**
 * Singleton instance for the application
 * This ensures consistent access to storage across the app
 */
let storageInstance: BrainStorage | null = null;

export function getStorage(): BrainStorage {
  if (!storageInstance) {
    storageInstance = new BrainStorage();
  }
  return storageInstance;
}

/**
 * Initialize storage on app startup
 * Call this in your app's initialization code
 */
export async function initializeStorage(): Promise<void> {
  const storage = getStorage();
  await storage.initialize();
}

/**
 * Cleanup storage on app shutdown
 * Call this when the app is closing
 */
export async function cleanupStorage(): Promise<void> {
  if (storageInstance) {
    await storageInstance.close();
    storageInstance = null;
  }
}