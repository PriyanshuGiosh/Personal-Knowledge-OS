'use client';

import { Plus, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * QuickActions - Primary action buttons for the dashboard
 *
 * UX Decisions:
 * - Large, prominent buttons for key actions
 * - Icons provide visual hierarchy and recognition
 * - Grid layout balances the actions visually
 * - Consistent spacing and sizing
 * - Keyboard shortcuts shown as hints
 */
interface QuickActionsProps {
  onNewNote: () => void;
  onSearch: () => void;
  onSettings: () => void;
}

export function QuickActions({ onNewNote, onSearch, onSettings }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Button
        onClick={onNewNote}
        size="lg"
        className="h-16 text-base font-medium"
      >
        <Plus className="h-5 w-5 mr-3" />
        New Note
        <span className="ml-auto text-xs opacity-70">⌘N</span>
      </Button>

      <Button
        onClick={onSearch}
        variant="outline"
        size="lg"
        className="h-16 text-base font-medium"
      >
        <Search className="h-5 w-5 mr-3" />
        Search Notes
        <span className="ml-auto text-xs opacity-70">⌘K</span>
      </Button>

      <Button
        onClick={onSettings}
        variant="outline"
        size="lg"
        className="h-16 text-base font-medium"
      >
        <Settings className="h-5 w-5 mr-3" />
        Settings
      </Button>
    </div>
  );
}