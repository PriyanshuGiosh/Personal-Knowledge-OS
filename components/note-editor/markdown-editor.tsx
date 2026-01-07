'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing your note...',
  className,
  autoFocus = false
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert tab character
      const newValue = value.substring(0, start) + '\t' + value.substring(end);
      onChange(newValue);

      // Move cursor after the tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  return (
    <div className={cn('relative h-full flex justify-center', className)}>
      <div className="w-full max-w-2xl">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            // Clean writing-focused typography (not monospace)
            'w-full h-full px-8 py-12 text-base font-normal',
            // Use system font stack for better readability
            'font-sans tracking-normal',
            // Clean background and no borders
            'bg-background border-0 resize-none',
            // Focus states
            'focus:outline-none focus:ring-0',
            // Placeholder styling
            'placeholder:text-muted-foreground/60',
            // Better line height for writing
            'text-foreground'
          )}
          style={{
            minHeight: '100%',
            lineHeight: '1.9', // Very comfortable line height for distraction-free writing
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        />
      </div>

      {/* Line numbers are DISABLED for note-taking UX */}
      {/* This prevents the editor from looking like a code editor */}
      {/* Line numbers are only suitable for code editing, not prose writing */}
    </div>
  );
}