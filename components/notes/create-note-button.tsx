'use client';

import { useState } from 'react';
import { getStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CreateNoteButtonProps {
  onNoteCreate: () => void;
  disabled?: boolean;
}

export function CreateNoteButton({ onNoteCreate, disabled = false }: CreateNoteButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const storage = getStorage();

  const handleCreateNote = async () => {
    if (isCreating) return;

    try {
      setIsCreating(true);
      await storage.createNote({
        title: '',
        content: '# New Note\n\nStart writing...',
        tags: [],
        backlinks: [],
        isArchived: false,
        isPinned: false,
      });

      onNoteCreate();
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreateNote}
      disabled={disabled || isCreating}
      className="w-full"
    >
      <Plus className="h-4 w-4 mr-2" />
      {isCreating ? 'Creating...' : 'New Note'}
    </Button>
  );
}