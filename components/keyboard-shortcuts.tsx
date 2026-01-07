'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Search notes</span>
              <div className="flex items-center gap-1">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Create new note</span>
              <div className="flex items-center gap-1">
                <Kbd>⌘</Kbd>
                <Kbd>N</Kbd>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Save note</span>
              <div className="flex items-center gap-1">
                <Kbd>⌘</Kbd>
                <Kbd>S</Kbd>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Close search</span>
              <Kbd>Esc</Kbd>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Navigate search results</span>
              <div className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Press <Kbd>?</Kbd> to show this dialog again.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}