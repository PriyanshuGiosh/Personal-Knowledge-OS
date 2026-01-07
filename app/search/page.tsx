'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import { GlobalSearch } from '@/components/global-search';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { Note } from '@/types/models';

export default function SearchPage() {
  const router = useRouter();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(true); // Open search by default on search page
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const handleNoteSelect = (note: Note) => {
    setSelectedNoteId(note.id);
    setIsSearchOpen(false); // Close search when note is selected
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
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Search Notes</h1>
            <p className="text-muted-foreground mb-8">
              Use Cmd/Ctrl + K to open search, or click the search button in the header.
            </p>
            <div className="text-sm text-muted-foreground">
              Search functionality is available through the global search modal.
            </div>
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