'use client';

import { useState, useEffect, useCallback } from 'react';
import { getIncomingBacklinks, getOutgoingLinks } from '@/lib/backlinks';
import { Note, Backlink } from '@/types/models';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, FileText } from 'lucide-react';
import { useStorage } from '@/components/storage-provider';

interface BacklinksPanelProps {
  noteId: string;
  onNoteSelect: (note: Note) => void;
  className?: string;
}

export function BacklinksPanel({ noteId, onNoteSelect, className }: BacklinksPanelProps) {
  const { isInitialized } = useStorage();
  const [incomingLinks, setIncomingLinks] = useState<Array<{
    sourceNote: Note;
    backlink: Backlink;
  }>>([]);
  const [outgoingLinks, setOutgoingLinks] = useState<Array<{
    targetNote: Note;
    backlink: Backlink;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBacklinks = useCallback(async () => {
    try {
      setIsLoading(true);
      const [incoming, outgoing] = await Promise.all([
        getIncomingBacklinks(noteId),
        getOutgoingLinks(noteId)
      ]);
      setIncomingLinks(incoming);
      setOutgoingLinks(outgoing);
    } catch (error) {
      console.error('Failed to load backlinks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    if (isInitialized && noteId) {
      loadBacklinks();
    }
  }, [noteId, isInitialized, loadBacklinks]);

  if (!isInitialized) {
    return (
      <div className={className}>
        <div className="text-center py-4 text-muted-foreground text-sm">
          Initializing backlinks...
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ScrollArea className="h-full">
        <div className="space-y-4 p-4">
          {/* Outgoing Links */}
          <div className="border rounded-lg">
            <div className="p-3 border-b">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Links to Other Notes ({outgoingLinks.length})
              </h3>
            </div>
            <div className="p-3">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : outgoingLinks.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No outgoing links
                </div>
              ) : (
                <div className="space-y-2">
                  {outgoingLinks.map(({ targetNote, backlink }) => (
                    <div
                      key={backlink.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => onNoteSelect(targetNote)}
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {targetNote.title}
                        </div>
                        {backlink.context && (
                          <div className="text-xs text-muted-foreground truncate">
                            {backlink.context}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        wiki
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Incoming Links */}
          <div className="border rounded-lg">
            <div className="p-3 border-b">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Backlinks ({incomingLinks.length})
              </h3>
            </div>
            <div className="p-3">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : incomingLinks.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No backlinks
                </div>
              ) : (
                <div className="space-y-2">
                  {incomingLinks.map(({ sourceNote, backlink }) => (
                    <div
                      key={backlink.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => onNoteSelect(sourceNote)}
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {sourceNote.title}
                        </div>
                        {backlink.context && (
                          <div className="text-xs text-muted-foreground truncate">
                            {backlink.context}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        wiki
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}