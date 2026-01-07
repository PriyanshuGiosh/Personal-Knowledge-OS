# Storage Layer

A clean, local-first storage abstraction layer for the Personal Knowledge OS using IndexedDB.

## Design Principles

### **IndexedDB over LocalStorage**
- **Performance**: Async operations, better for large datasets
- **Capacity**: ~1GB+ storage vs LocalStorage's ~5-10MB limit
- **Querying**: Rich querying capabilities with indices
- **Transactions**: ACID compliance for data consistency

### **Clean Abstraction**
- **UI Isolation**: Components don't need to know storage implementation details
- **Domain Focus**: API methods named after business operations
- **Error Handling**: Consistent error handling across all operations
- **Extensibility**: Easy to add new entity types and operations

### **Local-First Architecture**
- **Offline-First**: Works without network connectivity
- **Sync-Ready**: Built-in versioning and conflict resolution primitives
- **Migration Support**: Schema evolution capabilities
- **Performance**: Optimized for local data access patterns

## Architecture

```
UI Components
    ↓
StorageAdapter Interface
    ↓
IndexedDB Implementation
    ↓
IndexedDB Browser API
```

## Usage

### Initialization

The storage layer is automatically initialized when the app starts via `StorageInitializer` component.

### Basic CRUD Operations

```typescript
import { getStorage } from '@/lib/storage';

const storage = getStorage();

// Create a note
const note = await storage.createNote({
  title: 'My Note',
  content: '# Content',
  tags: [],
  backlinks: [],
  isArchived: false,
  isPinned: false,
});

// Get a note
const note = await storage.getNote('note-id');

// Get all notes with filtering
const notes = await storage.getAllNotes({
  limit: 20,
  isArchived: false,
  tags: ['tag-id'],
  searchTerm: 'search query'
});

// Update a note
const updatedNote = await storage.updateNote('note-id', {
  title: 'New Title',
  content: 'New content'
});

// Delete a note
await storage.deleteNote('note-id');
```

### Advanced Queries

```typescript
// Get recent notes
const recentNotes = await storage.getAllNotes({
  limit: 10,
  sortBy: 'updatedAt',
  sortOrder: 'desc'
});

// Get pinned notes
const pinnedNotes = await storage.getAllNotes({
  isPinned: true
});

// Search notes
const searchResults = await storage.getAllNotes({
  searchTerm: 'knowledge management'
});
```

### Error Handling

```typescript
try {
  const note = await storage.createNote(noteData);
} catch (error) {
  if (error instanceof StorageError) {
    switch (error.code) {
      case StorageErrorCodes.DATABASE_OPEN_FAILED:
        // Handle database initialization failure
        break;
      case StorageErrorCodes.KEY_NOT_FOUND:
        // Handle missing entity
        break;
      default:
        // Handle other errors
        break;
    }
  }
}
```

## Database Schema

### Notes Store
- **Key**: `id` (UUID)
- **Indices**:
  - `createdAt`
  - `updatedAt`
  - `isArchived`
  - `isPinned`
  - `tags` (multi-entry)

### Tags Store (Future)
- **Key**: `id` (UUID)
- **Indices**:
  - `name` (unique)
  - `createdAt`

### Backlinks Store (Future)
- **Key**: `id` (UUID)
- **Indices**:
  - `sourceNoteId`
  - `targetNoteId`
  - `linkType`

## Performance Considerations

### **Indexing Strategy**
- Created indices for common query patterns
- Multi-entry indices for array fields (tags)
- Compound indices for complex queries

### **Batch Operations**
- `batchCreate` for bulk insertions
- Transaction-based operations for consistency

### **Query Optimization**
- Index-based filtering where possible
- In-memory filtering for complex queries
- Pagination support with `limit` and `offset`

## Future Extensions

### **Cloud Sync**
The storage layer is designed for future cloud synchronization:
- Version numbers for conflict resolution
- Sync timestamps and metadata
- Soft deletes for data preservation
- Device attribution for multi-device sync

### **Search**
- Full-text search capabilities
- Search index store for performance
- Tokenization and indexing strategies

### **Attachments**
- File storage integration
- Metadata tracking
- Sync capabilities for binary data

## Testing

The storage layer is designed for easy testing:
- Interface-based design allows mocking
- Singleton pattern ensures consistent state
- Clear error boundaries for testing failure scenarios

## Migration Strategy

When schema changes are needed:
1. Increment database version
2. Implement migration logic in `onupgradeneeded`
3. Handle data transformation during upgrades
4. Maintain backward compatibility where possible