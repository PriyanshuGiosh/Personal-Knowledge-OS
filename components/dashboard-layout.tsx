'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import { NoteEditor } from '@/components/note-editor';
import { BacklinksPanel } from '@/components/backlinks-panel';
import { GlobalSearch } from '@/components/global-search';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { Note } from '@/types/models';

const defaultContent = `# Welcome to Brain

Your personal knowledge operating system. Start writing your thoughts, ideas, and notes here.

## Features

- **Live Preview**: See your markdown rendered in real-time
- **Autosave**: Your work is automatically saved as you type
- **Code Blocks**: Write and highlight code with syntax coloring
- **Tags**: Use #hashtags to organize your notes
- **Wiki Links**: Link to other notes using [[note-title]] syntax

## Code Example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet('Brain'));
\`\`\`

## Getting Started

1. Write in the editor on the left
2. See the preview on the right
3. Your changes are automatically saved

> This is a blockquote. You can use it to highlight important information.

| Feature | Status |
|---------|--------|
| Markdown | ✅ |
| Autosave | ✅ |
| Code Highlighting | ✅ |
| Tags | ✅ |
| Wiki Links | ✅ |
| Backlinks | ✅ |

## Example Wiki Links

Try creating a new note called "Project Ideas" and then link to it from here:

I have some thoughts about [[Project Ideas]] that I want to explore further.

The wiki link will appear in purple and show backlinks when you view the target note.
`;

export default function DashboardLayout() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const handleNoteSelect = (note: Note) => {
    setSelectedNoteId(note.id);
    setSelectedNote(note);
  };

  const handleNoteCreate = () => {
    setSelectedNoteId(null);
    setSelectedNote(null);
  };

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev => [...prev, tagId]);
  };

  const handleTagDeselect = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  };

  const handleClearTags = () => {
    setSelectedTags([]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      // Cmd/Ctrl + N to create new note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNoteCreate();
        return;
      }

      // Cmd/Ctrl + S to save (handled by note editor)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        // Let the note editor handle this
        return;
      }

      // ? to show keyboard shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }

      // Escape to close search if open
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        return;
      }

      // Escape to close shortcuts if open
      if (e.key === 'Escape' && isShortcutsOpen) {
        setIsShortcutsOpen(false);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isShortcutsOpen]);

  return (
    <>
      <AppSidebar
        selectedNoteId={selectedNoteId}
        selectedTags={selectedTags}
        onNoteSelect={handleNoteSelect}
        onNoteCreate={handleNoteCreate}
        onTagSelect={handleTagSelect}
        onTagDeselect={handleTagDeselect}
        onClearTags={handleClearTags}
      />
      <SidebarInset>
        <Header onSearchOpen={() => setIsSearchOpen(true)} />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex flex-1 gap-4 flex-col lg:flex-row">
            <div className="flex-1 min-h-0">
              <NoteEditor
                key={selectedNoteId || 'default'}
                initialContent={selectedNote?.content || defaultContent}
                noteId={selectedNoteId || undefined}
                className="h-full"
              />
            </div>
            {selectedNoteId && (
              <div className="w-full lg:w-80 shrink-0">
                <BacklinksPanel
                  noteId={selectedNoteId}
                  onNoteSelect={handleNoteSelect}
                  className="h-full"
                />
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNoteSelect={handleNoteSelect}
      />

      <KeyboardShortcuts
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
}