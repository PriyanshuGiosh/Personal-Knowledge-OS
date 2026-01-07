'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import { GlobalSearch } from '@/components/global-search';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { Button } from '@/components/ui/button';
import { Note } from '@/types/models';

export default function SettingsPage() {
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
            <h1 className="text-2xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Configure your Brain experience.
            </p>
          </div>

          <div className="max-w-2xl space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Appearance</h2>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Dark Mode</div>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Toggle Theme
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Auto-save</div>
                  <p className="text-sm text-muted-foreground">
                    Automatically save notes as you type
                  </p>
                </div>
                <div className="text-sm text-green-600 font-medium">Enabled</div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Editor</h2>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Line Numbers</div>
                  <p className="text-sm text-muted-foreground">
                    Display line numbers in the editor
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">Disabled</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Word Wrap</div>
                  <p className="text-sm text-muted-foreground">
                    Wrap long lines in the editor
                  </p>
                </div>
                <div className="text-sm text-green-600 font-medium">Enabled</div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Data</h2>

              <div className="space-y-2">
                <Button variant="outline">Export All Notes</Button>
                <p className="text-sm text-muted-foreground">
                  Download all your notes as a JSON file
                </p>
              </div>

              <div className="space-y-2">
                <Button variant="outline">Import Notes</Button>
                <p className="text-sm text-muted-foreground">
                  Import notes from a JSON file
                </p>
              </div>

              <div className="space-y-2">
                <Button variant="destructive">Clear All Data</Button>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all notes and settings
                </p>
              </div>
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