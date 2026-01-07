'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Note } from '@/types/models';
import { getStorage } from '@/lib/storage';
import { useStorage } from '@/components/storage-provider';

interface RecentNotesProps {
  onNewNote: () => void;
  onSearch: () => void;
}

export function RecentNotes({ onNewNote, onSearch }: RecentNotesProps) {
  const router = useRouter();
  const { isInitialized, error: storageError } = useStorage();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load data when storage is initialized
    if (!isInitialized) return;

    const loadRecentNotes = async () => {
      try {
        setLoading(true);
        const storage = getStorage();
        const allNotes = await storage.getAllNotes();

        // Sort by updatedAt and take the 5 most recent
        const sorted = allNotes
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);

        setRecentNotes(sorted);
      } catch (error) {
        console.error('Failed to load recent notes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentNotes();
  }, [isInitialized]);

  const handleNoteClick = (note: Note) => {
    router.push(`/notes/${note.id}`);
  };

  // Show loading state while storage is initializing
  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state if storage failed to initialize
  if (storageError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Failed to load recent notes. Please refresh the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {recentNotes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No notes yet</h3>
            <p className="text-muted-foreground mb-4">
              Start writing your thoughts and ideas. Your recent notes will appear here.
            </p>
            <Button onClick={onNewNote}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first note
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => handleNoteClick(note)}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{note.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Edited {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {note.content.split('\n').length} lines
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <Button variant="outline" onClick={onSearch} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search all notes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}