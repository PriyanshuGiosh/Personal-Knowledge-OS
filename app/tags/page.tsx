'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import { GlobalSearch } from '@/components/global-search';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { TagList } from '@/components/tags';
import { Note } from '@/types/models';

export default function TagsPage() {
  const router = useRouter();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const handleNoteSelect = (note: Note) => {
    setSelectedNoteId(note.id);
    router.push(`/notes/${note.id}`);
  };

  const handleNoteCreate = () => {
    setSelectedNoteId(null);
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
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Tags</h1>
            <p className="text-muted-foreground">
              Manage and organize your notes with tags. Click on tags to filter notes.
            </p>
          </div>

          <div className="flex-1">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-3">All Tags</h2>
              <TagList
                selectedTags={selectedTags}
                onTagSelect={handleTagSelect}
                onTagDeselect={handleTagDeselect}
                onClearTags={handleClearTags}
                className="space-y-2"
              />
            </div>

            {selectedTags.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">
                  Notes with selected tags ({selectedTags.length})
                </h2>
                <div className="text-muted-foreground">
                  Note filtering by tags will be implemented here.
                </div>
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