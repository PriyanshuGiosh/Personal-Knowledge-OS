// Base types for local-first data models with cloud sync extensibility

export type UUID = string;

// Common metadata for all entities
export interface BaseEntity {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
}

// Sync metadata for future cloud synchronization
export interface SyncMetadata {
  version: number;
  syncedAt?: Date;
  isDeleted?: boolean;
  lastModifiedBy?: string; // For multi-device sync
}

// Extended base with sync capabilities
export interface SyncableEntity extends BaseEntity {
  sync: SyncMetadata;
}

// Note entity
export interface Note extends SyncableEntity {
  title: string;
  content: string; // Markdown content
  tags: UUID[]; // References to Tag IDs
  backlinks: UUID[]; // References to Note IDs that link to this note
  // Future extensions
  attachments?: UUID[]; // File attachments
  isArchived?: boolean;
  isPinned?: boolean;
  folderId?: UUID; // For hierarchical organization
}

// Tag entity
export interface Tag extends SyncableEntity {
  name: string;
  color?: string; // Hex color code
  description?: string;
  // Future extensions
  parentId?: UUID; // For tag hierarchies
  isSystemTag?: boolean; // Built-in tags
}

// Backlink relationship (for explicit link tracking)
export interface Backlink extends SyncableEntity {
  sourceNoteId: UUID; // Note that contains the link
  targetNoteId: UUID; // Note being linked to
  linkType: 'wiki' | 'reference' | 'embed'; // Type of link
  context?: string; // Surrounding text context
  position?: {
    start: number;
    end: number;
  }; // Position in source note
}

// Metadata types for additional properties
export interface NoteMetadata {
  wordCount: number;
  readingTime: number; // in minutes
  lastAccessedAt?: Date;
  accessCount: number;
}

export interface TagMetadata {
  noteCount: number; // Number of notes using this tag
  lastUsedAt?: Date;
}

// Search and indexing types
export interface SearchIndex {
  id: UUID;
  entityType: 'note' | 'tag';
  entityId: UUID;
  content: string; // Indexed content for search
  tokens: string[]; // Tokenized words
}

// File attachment types (for future use)
export interface Attachment extends SyncableEntity {
  filename: string;
  mimeType: string;
  size: number;
  url: string; // Local file URL or blob
  noteId: UUID;
}

// Folder/Collection types (for future hierarchical organization)
export interface Folder extends SyncableEntity {
  name: string;
  parentId?: UUID;
  color?: string;
  isExpanded?: boolean;
}

// Database schema types for local storage
export interface DatabaseSchema {
  notes: Note[];
  tags: Tag[];
  backlinks: Backlink[];
  attachments: Attachment[];
  folders: Folder[];
  searchIndex: SearchIndex[];
}

// API response types for future cloud sync
export interface SyncResponse<T> {
  data: T;
  lastSync: Date;
  changes: {
    created: T[];
    updated: T[];
    deleted: UUID[];
  };
}

// Query types for data access
export interface NoteQuery {
  tags?: UUID[];
  folderId?: UUID;
  isArchived?: boolean;
  isPinned?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface TagQuery {
  search?: string;
  parentId?: UUID;
  limit?: number;
  offset?: number;
}

// Event types for real-time updates
export type EntityEventType = 'created' | 'updated' | 'deleted';

export interface EntityEvent<T> {
  type: EntityEventType;
  entityType: 'note' | 'tag' | 'backlink' | 'attachment' | 'folder';
  entity: T;
  timestamp: Date;
}

// Utility types
export type EntityType = Note | Tag | Backlink | Attachment | Folder;
export type EntityWithMetadata<T> = T & {
  metadata?: NoteMetadata | TagMetadata;
};