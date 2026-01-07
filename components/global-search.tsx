'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStorage } from '@/lib/storage';
import { Note, Tag } from '@/types/models';
import { useStorage } from '@/components/storage-provider';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  note: Note;
  score: number;
  matches: {
    title: boolean;
    content: boolean;
    tags: boolean;
  };
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteSelect: (note: Note) => void;
}

// Fuzzy search function
function fuzzySearch(text: string, query: string): boolean {
  if (!query) return true;

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match gets highest priority
  if (textLower.includes(queryLower)) return true;

  // Fuzzy matching - check if all query characters appear in order
  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === queryLower.length;
}

/**
 * Global search component for finding notes by title, content, or tags
 */
export function GlobalSearch({ isOpen, onClose, onNoteSelect }: GlobalSearchProps) {
  const { isInitialized } = useStorage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const storage = getStorage();

  // Load tags on mount
  useEffect(() => {
    if (isInitialized) {
      storage.getAllTags().then(setAllTags).catch(console.error);
    }
  }, [isInitialized, storage]);

  // Calculate relevance score
  const calculateScore = useCallback((note: Note, query: string, tags: Tag[]): SearchResult | null => {
    if (!query.trim()) return null;

    const queryLower = query.toLowerCase();
    let score = 0;
    const matches = {
      title: false,
      content: false,
      tags: false
    };

    // Title match (highest weight)
    if (fuzzySearch(note.title, query)) {
      matches.title = true;
      score += 100;
      // Exact title match gets bonus
      if (note.title.toLowerCase().includes(queryLower)) {
        score += 50;
      }
    }

    // Content match
    if (fuzzySearch(note.content, query)) {
      matches.content = true;
      score += 50;
      // Exact content match gets bonus
      if (note.content.toLowerCase().includes(queryLower)) {
        score += 25;
      }
    }

    // Tag match
    const noteTagNames = note.tags.map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return tag ? tag.name : '';
    }).filter(Boolean);

    if (noteTagNames.some(tagName => fuzzySearch(tagName, query))) {
      matches.tags = true;
      score += 75;
      // Exact tag match gets bonus
      if (noteTagNames.some(tagName => tagName.toLowerCase().includes(queryLower))) {
        score += 30;
      }
    }

    // Recency bonus (newer notes get slight preference)
    const daysSinceUpdate = (Date.now() - note.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 10 - daysSinceUpdate);

    return score > 0 ? { note, score, matches } : null;
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!isInitialized || !searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const allNotes = await storage.getAllNotes();

      const searchResults: SearchResult[] = [];
      for (const note of allNotes) {
        const result = calculateScore(note, searchQuery, allTags);
        if (result) {
          searchResults.push(result);
        }
      }

      // Sort by score (highest first)
      searchResults.sort((a, b) => b.score - a.score);

      setResults(searchResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, storage, calculateScore, allTags]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 150); // 150ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        onNoteSelect(results[selectedIndex].note);
        onClose();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onNoteSelect]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4">
        <div className="bg-background border rounded-lg shadow-2xl">
          {/* Search input */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 text-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          <ScrollArea className="max-h-96">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Searching...
              </div>
            ) : results.length === 0 && query ? (
              <div className="p-4 text-center text-muted-foreground">
                No results found for &ldquo;{query}&rdquo;
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Start typing to search notes...
              </div>
            ) : (
              <div className="p-2">
                {results.map((result, index) => (
                  <div
                    key={result.note.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-muted",
                      index === selectedIndex && "bg-muted"
                    )}
                    onClick={() => {
                      onNoteSelect(result.note);
                      onClose();
                    }}
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {result.note.title}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {result.note.content.substring(0, 100)}...
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {result.matches.title && (
                          <Badge variant="secondary" className="text-xs">
                            Title
                          </Badge>
                        )}
                        {result.matches.content && (
                          <Badge variant="secondary" className="text-xs">
                            Content
                          </Badge>
                        )}
                        {result.matches.tags && (
                          <Badge variant="secondary" className="text-xs">
                            Tags
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {result.note.updatedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="p-2 border-t bg-muted/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>
                {results.length > 0 && (
                  <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>Enter Select</span>
                <span>Esc Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;