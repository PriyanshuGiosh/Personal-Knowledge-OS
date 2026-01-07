'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/global-search';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { DashboardStats, RecentNotes, QuickActions } from '@/components/dashboard';
import { getStorage } from '@/lib/storage';
import { useStorage } from '@/components/storage-provider';

/**
 * DashboardPage - Command center for the Personal Knowledge OS
 *
 * UX Decisions:
 * - Command center layout: stats at top, actions in middle, recent activity below
 * - Clean, minimal design that works in both light and dark modes
 * - Real data integration: no mock data, uses actual storage
 * - Responsive: adapts to different screen sizes
 * - Empty states: helpful guidance when no data exists
 * - Keyboard shortcuts: preserved for power users
 */

export default function DashboardPage() {
  const router = useRouter();
  const { isInitialized, error: storageError } = useStorage();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Dashboard data state
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalTags: 0,
    recentEdits: 0
  });

  // Load dashboard data on mount
  useEffect(() => {
    // Only load data when storage is initialized
    if (!isInitialized) return;

    const loadDashboardData = async () => {
      try {
        const storage = getStorage();
        const allNotes = await storage.getAllNotes();

        // Calculate stats
        const totalNotes = allNotes.length;

        // Count unique tags across all notes
        const tagSet = new Set<string>();
        allNotes.forEach(note => {
          note.tags.forEach(tagId => tagSet.add(tagId));
        });
        const totalTags = tagSet.size;

        // Count notes edited in the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentEdits = allNotes.filter(note =>
          new Date(note.updatedAt) > oneDayAgo
        ).length;

        setStats({ totalNotes, totalTags, recentEdits });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [isInitialized]);

  const handleNoteCreate = useCallback(async () => {
    try {
      const storage = getStorage();
      const newNote = await storage.createNote({
        title: 'Untitled Note',
        content: '# Untitled Note\n\nStart writing your thoughts here...',
        tags: [],
        backlinks: [],
        isArchived: false,
        isPinned: false,
      });

      // Navigate to the newly created note
      router.push(`/notes/${newNote.id}`);
    } catch (error) {
      console.error('Failed to create note:', error);
      // Could add toast notification here in the future
    }
  }, [router]);

  const handleSearch = () => {
    setIsSearchOpen(true);
  };

  const handleSettings = () => {
    router.push('/settings');
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
  }, [isSearchOpen, isShortcutsOpen, handleNoteCreate]);

  return (
    <>
      <AppSidebar
        selectedNoteId={null}
        selectedTags={selectedTags}
        onNoteSelect={() => {}} // Dashboard doesn't select specific notes
        onNoteCreate={handleNoteCreate}
        onTagSelect={handleTagSelect}
        onTagDeselect={handleTagDeselect}
        onClearTags={handleClearTags}
      />
      <SidebarInset>
        <Header onSearchOpen={handleSearch} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Show loading state while storage initializes */}
            {!isInitialized && !storageError && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your knowledge base...</p>
                </div>
              </div>
            )}

            {/* Show error state if storage failed */}
            {storageError && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Storage Error</h2>
                  <p className="text-muted-foreground mb-4">
                    Failed to load your knowledge base. Please refresh the page.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              </div>
            )}

            {/* Show dashboard content when storage is ready */}
            {isInitialized && !storageError && (
              <>
                {/* Welcome Header */}
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold">Welcome to Brain</h1>
                  <p className="text-muted-foreground text-lg">
                    Your personal knowledge operating system
                  </p>
                </div>

            {/* Quick Stats */}
            <DashboardStats
              totalNotes={stats.totalNotes}
              totalTags={stats.totalTags}
              recentEdits={stats.recentEdits}
            />

            {/* Quick Actions */}
            <QuickActions
              onNewNote={handleNoteCreate}
              onSearch={handleSearch}
              onSettings={handleSettings}
            />

            {/* Recent Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentNotes
                onNewNote={handleNoteCreate}
                onSearch={handleSearch}
              />

              {/* Getting Started Card */}
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>🖊️ <strong>Create notes</strong> to capture your thoughts and ideas</p>
                  <p>🏷️ <strong>Use tags</strong> like #project or #idea to organize</p>
                  <p>🔗 <strong>Link notes</strong> with [[note-title]] syntax</p>
                  <p>🔍 <strong>Search</strong> with Cmd/Ctrl + K to find anything</p>
                  <p>⚡ <strong>Autosave</strong> keeps your work safe automatically</p>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </SidebarInset>

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNoteSelect={(note) => router.push(`/notes/${note.id}`)}
      />

      <KeyboardShortcuts
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
}