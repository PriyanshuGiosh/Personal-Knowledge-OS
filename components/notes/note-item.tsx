'use client';

import { Note } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function NoteItem({ note, isSelected, onSelect, onDelete }: NoteItemProps) {
  // Extract preview text from content (first line or first 100 chars)
  const getPreviewText = (content: string): string => {
    const lines = content.split('\n').filter(line => line.trim());
    const firstLine = lines[0];

    if (firstLine && firstLine.length > 100) {
      return firstLine.substring(0, 100) + '...';
    }

    return firstLine || content.substring(0, 100) + (content.length > 100 ? '...' : '');
  };

  const previewText = getPreviewText(note.content);
  const timeAgo = formatDistanceToNow(note.updatedAt, { addSuffix: true });

  return (
    <div
      className={cn(
        'group relative p-3 rounded-lg cursor-pointer transition-colors',
        'hover:bg-accent/50',
        isSelected && 'bg-accent border border-border'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'font-medium text-sm truncate',
            isSelected ? 'text-accent-foreground' : 'text-foreground'
          )}>
            {note.title || 'Untitled Note'}
          </h3>

          {previewText && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {previewText}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>

            {note.isPinned && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                Pinned
              </span>
            )}

            {note.tags.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {note.tags.length} tag{note.tags.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity',
                isSelected && 'opacity-100'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}