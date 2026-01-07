'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import { NoteEditor } from '@/components/note-editor';
import { BacklinksPanel } from '@/components/backlinks-panel';
import { GlobalSearch } from '@/components/global-search';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { getStorage } from '@/lib/storage';
import { Note } from '@/types/models';

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isNewNote, setIsNewNote] = useState(false);

  const storage = getStorage();

  useEffect(() => {
    if (noteId) {
      storage.getNote(noteId).then(note => {
        if (note) {
          setSelectedNote(note);
          // Check if this is a newly created note (created within last 5 seconds)
          const timeSinceCreation = Date.now() - new Date(note.createdAt).getTime();
          setIsNewNote(timeSinceCreation < 5000); // 5 seconds
        } else {
          // Note not found, redirect to dashboard
          router.push('/dashboard');
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
        router.push('/dashboard');
      });
    }
  }, [noteId, storage, router]);

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    router.push(`/notes/${note.id}`);
  };

  const handleNoteCreate = () => {
    setSelectedNote(null);
    router.push('/dashboard');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!selectedNote) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Note Not Found</h1>
          <p className="text-muted-foreground mb-4">The note you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-primary hover:underline"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppSidebar
        selectedNoteId={selectedNote.id}
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
                key={selectedNote.id}
                initialContent={selectedNote.content}
                noteId={selectedNote.id}
                className="h-full"
                autoFocus={isNewNote}
              />
            </div>
            <div className="w-full lg:w-80 shrink-0">
              <BacklinksPanel
                noteId={selectedNote.id}
                onNoteSelect={handleNoteSelect}
                className="h-full"
              />
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