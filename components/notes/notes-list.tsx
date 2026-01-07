'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStorage } from '@/lib/storage';
import { Note } from '@/types/models';
import { NoteItem } from './note-item';
import { CreateNoteButton } from './create-note-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStorage } from '@/components/storage-provider';

interface NotesListProps {
  selectedNoteId?: string | null;
  selectedTags?: string[];
  onNoteSelect: (note: Note) => void;
  onNoteCreate: () => void;
  onNoteDelete?: (noteId: string) => void;
  className?: string;
}

type SortOrder = 'createdAt' | 'updatedAt' | 'title';
type SortDirection = 'asc' | 'desc';

export function NotesList({
  selectedNoteId,
  selectedTags = [],
  onNoteSelect,
  onNoteCreate,
  onNoteDelete,
  className
}: NotesListProps) {
  const { isInitialized, error: storageError } = useStorage();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOrder>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storage = getStorage();

  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allNotes = await storage.getAllNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
      setError(error instanceof Error ? error.message : 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  // Load notes on mount when storage is initialized
  useEffect(() => {
    if (isInitialized) {
      loadNotes();
    }
  }, [loadNotes, isInitialized]);

  // Filter and sort notes when data changes
  useEffect(() => {
    let filtered = notes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = notes.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note =>
        selectedTags.some(tagId => note.tags.includes(tagId))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredNotes(filtered);
  }, [notes, searchQuery, sortBy, sortDirection, selectedTags]);

  const handleNoteDelete = async (noteId: string) => {
    try {
      await storage.deleteNote(noteId);
      await loadNotes(); // Refresh the list

      // If the deleted note was selected, clear selection
      if (selectedNoteId === noteId) {
        onNoteDelete?.(noteId);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleSortToggle = (field: SortOrder) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortOrder) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />;
  };

  return (
    <div className={className}>
      {/* Header with create button */}
      <div className="p-4 border-b">
        <CreateNoteButton onNoteCreate={onNoteCreate} disabled={!isInitialized || !!storageError} />
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Sort controls */}
      <div className="p-2 border-b">
        <div className="flex gap-1">
          <Button
            variant={sortBy === 'updatedAt' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleSortToggle('updatedAt')}
            className="flex-1 text-xs"
          >
            Modified {getSortIcon('updatedAt')}
          </Button>
          <Button
            variant={sortBy === 'createdAt' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleSortToggle('createdAt')}
            className="flex-1 text-xs"
          >
            Created {getSortIcon('createdAt')}
          </Button>
          <Button
            variant={sortBy === 'title' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleSortToggle('title')}
            className="flex-1 text-xs"
          >
            Title {getSortIcon('title')}
          </Button>
        </div>
      </div>

      {/* Notes list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {!isInitialized ? (
            <div className="text-center py-8 text-muted-foreground">
              Initializing storage...
            </div>
          ) : storageError ? (
            <div className="text-center py-8 text-destructive">
              Failed to initialize storage: {storageError.message}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              {error}
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12 px-4">
              {searchQuery ? (
                <div className="space-y-3">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground">No notes found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your search or create a new note.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="mt-4"
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Welcome to Brain!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start by creating your first note to capture your thoughts and ideas.
                    </p>
                  </div>
                  <Button
                    onClick={onNoteCreate}
                    className="mt-4"
                    disabled={!isInitialized || !!storageError}
                  >
                    Create your first note
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={note.id === selectedNoteId}
                  onSelect={() => onNoteSelect(note)}
                  onDelete={() => handleNoteDelete(note.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}