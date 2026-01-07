'use client';

import { useState, useEffect, useCallback } from 'react';
import { MarkdownEditor } from './markdown-editor';
import { MarkdownPreview } from './markdown-preview';
import { getStorage } from '@/lib/storage';
import { syncTagsForNote } from '@/lib/tags';
import { syncBacklinksForNote, updateBacklinksOnNoteRename } from '@/lib/backlinks';
import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NoteEditorProps {
  noteId?: string;
  initialContent?: string;
  onSave?: (note: Note) => void;
  className?: string;
  autoFocus?: boolean;
}

type ViewMode = 'edit' | 'preview' | 'split';

export function NoteEditor({
  noteId,
  initialContent = '',
  onSave,
  className,
  autoFocus = false
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalTitle, setOriginalTitle] = useState<string>('');

  const storage = getStorage();

  // Load note if noteId is provided
  useEffect(() => {
    if (noteId) {
      storage.getNote(noteId).then(note => {
        if (note) {
          setContent(note.content);
          setLastSaved(note.updatedAt);
          setOriginalTitle(note.title);
        }
      }).catch(console.error);
    } else {
      setOriginalTitle('');
    }
  }, [noteId, storage]);

  // Autosave functionality with debouncing
  const saveNote = useCallback(async (contentToSave: string) => {
    if (!contentToSave.trim()) return;

    setIsSaving(true);
    try {
      const newTitle = extractTitle(contentToSave);
      let savedNote: Note;

      if (noteId) {
        // Update existing note
        savedNote = await storage.updateNote(noteId, {
          title: newTitle,
          content: contentToSave,
          updatedAt: new Date()
        });

        // If title changed, update backlinks in other notes
        if (originalTitle && originalTitle !== newTitle) {
          await updateBacklinksOnNoteRename(originalTitle, newTitle);
          setOriginalTitle(newTitle);
        }

        // Sync tags for existing note
        await syncTagsForNote(noteId, contentToSave);
        // Sync backlinks for existing note
        await syncBacklinksForNote(noteId, contentToSave);
      } else {
        // Create new note
        savedNote = await storage.createNote({
          title: newTitle,
          content: contentToSave,
          tags: [],
          backlinks: [],
          isArchived: false,
          isPinned: false
        });
        // Sync tags for new note
        await syncTagsForNote(savedNote.id, contentToSave);
        // Sync backlinks for new note
        await syncBacklinksForNote(savedNote.id, contentToSave);
        // Reload the note to get updated tags
        savedNote = await storage.getNote(savedNote.id) || savedNote;
        setOriginalTitle(newTitle);
      }

      setLastSaved(savedNote.updatedAt);
      setHasUnsavedChanges(false);
      onSave?.(savedNote);

      // Show success toast
      toast.success(noteId ? 'Note updated' : 'Note created', {
        description: `"${newTitle}" has been saved successfully.`,
      });
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [noteId, storage, onSave, originalTitle]);

  const handleManualSave = useCallback(() => {
    saveNote(content);
  }, [saveNote, content]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !isSaving) {
          handleManualSave();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, isSaving, handleManualSave]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'edit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('edit')}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant={viewMode === 'split' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('split')}
          >
            Split
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('preview')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {isSaving && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <div className="h-3 w-3 border border-primary border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          )}
          {!isSaving && hasUnsavedChanges && (
            <div className="flex items-center gap-1 text-sm text-orange-600">
              <div className="h-2 w-2 bg-orange-600 rounded-full" />
              Unsaved changes
            </div>
          )}
          {!isSaving && !hasUnsavedChanges && lastSaved && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <div className="h-2 w-2 bg-green-600 rounded-full" />
              Saved {lastSaved.toLocaleTimeString()}
            </div>
          )}
          <Button
            onClick={handleManualSave}
            disabled={isSaving || !hasUnsavedChanges}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 flex overflow-hidden">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={cn(
            'flex-1',
            viewMode === 'split' ? 'border-r border-border/30' : ''
          )}>
            <MarkdownEditor
              value={content}
              onChange={handleContentChange}
              className="h-full"
              autoFocus={autoFocus}
            />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 overflow-auto">
            <MarkdownPreview
              content={content}
              className="h-full px-8 py-12 max-w-2xl mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to extract title from markdown content
function extractTitle(content: string): string {
  const lines = content.split('\n');
  const titleLine = lines.find(line => line.startsWith('# '));
  if (titleLine) {
    return titleLine.substring(2).trim();
  }

  // Fallback: use first non-empty line
  const firstLine = lines.find(line => line.trim());
  return firstLine ? firstLine.substring(0, 50) : 'Untitled Note';
}