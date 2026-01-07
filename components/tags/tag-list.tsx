'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStorage } from '@/lib/storage';
import { Tag } from '@/types/models';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Hash } from 'lucide-react';
import { useStorage } from '@/components/storage-provider';

interface TagListProps {
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  onTagDeselect: (tagId: string) => void;
  onClearTags: () => void;
  className?: string;
}

export function TagList({
  selectedTags,
  onTagSelect,
  onTagDeselect,
  onClearTags,
  className
}: TagListProps) {
  const { isInitialized, error: storageError } = useStorage();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storage = getStorage();

  const loadTags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allTags = await storage.getAllTags();
      setTags(allTags);
    } catch (error) {
      console.error('Failed to load tags:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    if (isInitialized) {
      loadTags();
    }
  }, [loadTags, isInitialized]);

  const handleTagClick = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagDeselect(tagId);
    } else {
      onTagSelect(tagId);
    }
  };

  if (!isInitialized) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        Initializing tags...
      </div>
    );
  }

  if (storageError) {
    return (
      <div className="text-center py-4 text-destructive text-sm">
        Failed to load tags
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-destructive text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Filtering by:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearTags}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <Badge
                  key={tagId}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-secondary/80"
                  style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}
                  onClick={() => onTagDeselect(tagId)}
                >
                  #{tag.name}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* All tags */}
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="space-y-3">
                <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">No tags yet</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tags will appear here as you add #hashtags to your notes.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            tags.map(tag => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <Button
                  key={tag.id}
                  variant={isSelected ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-left h-8"
                  onClick={() => handleTagClick(tag.id)}
                  style={isSelected ? {
                    backgroundColor: `${tag.color}20`,
                    borderColor: tag.color
                  } : {}}
                >
                  <Hash className="h-3 w-3 mr-2" style={{ color: tag.color }} />
                  <span className="text-sm">{tag.name}</span>
                </Button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}