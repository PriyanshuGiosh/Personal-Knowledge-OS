/**
 * Utility functions for backlink detection and management
 */

import { getStorage } from '@/lib/storage';
import { Backlink, Note } from '@/types/models';

/**
 * Extract wiki links from markdown content
 * Matches [[note-title]] format
 */
export function extractWikiLinksFromContent(content: string): Array<{
  title: string;
  position: { start: number; end: number };
  context: string;
}> {
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
  const links: Array<{
    title: string;
    position: { start: number; end: number };
    context: string;
  }> = [];

  let match;
  while ((match = wikiLinkRegex.exec(content)) !== null) {
    const title = match[1].trim();
    const start = match.index;
    const end = match.index + match[0].length;

    // Get context (surrounding text, max 100 chars)
    const contextStart = Math.max(0, start - 50);
    const contextEnd = Math.min(content.length, end + 50);
    const context = content.substring(contextStart, contextEnd);

    links.push({
      title,
      position: { start, end },
      context
    });
  }

  return links;
}

/**
 * Remove wiki link syntax from content while preserving the text
 * Useful for displaying content without the [[ ]] symbols
 */
export function removeWikiLinksFromContent(content: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, '$1');
}

/**
 * Highlight wiki links in content for display
 */
export function highlightWikiLinks(content: string): string {
  return content.replace(
    /\[\[([^\]]+)\]\]/g,
    '<span class="text-purple-600 font-medium">[[$1]]</span>'
  );
}

/**
 * Sync backlinks for a note based on its content
 * Creates backlink relationships for all wiki links found
 */
export async function syncBacklinksForNote(noteId: string, content: string): Promise<void> {
  const storage = getStorage();
  const wikiLinks = extractWikiLinksFromContent(content);

  // Remove existing backlinks from this note
  await removeBacklinksFromNote(noteId);

  // Create new backlinks
  for (const link of wikiLinks) {
    // Find the target note by title
    const targetNote = await findNoteByTitle(link.title);
    if (targetNote) {
      await storage.createBacklink({
        sourceNoteId: noteId,
        targetNoteId: targetNote.id,
        linkType: 'wiki',
        context: link.context,
        position: link.position
      });
    }
  }
}

/**
 * Remove all backlinks from a specific note
 */
export async function removeBacklinksFromNote(noteId: string): Promise<void> {
  const storage = getStorage();

  // Get all backlinks where this note is the source
  const existingBacklinks = await storage.getBacklinksForNote(noteId);

  // Delete them
  for (const backlink of existingBacklinks) {
    await storage.deleteBacklink(backlink.id);
  }
}

/**
 * Find a note by its title (case-insensitive)
 */
export async function findNoteByTitle(title: string): Promise<Note | null> {
  const storage = getStorage();
  const allNotes = await storage.getAllNotes();

  // Try exact match first
  let note = allNotes.find(n => n.title.toLowerCase() === title.toLowerCase());
  if (note) return note;

  // Try partial match (title contains the search term)
  note = allNotes.find(n => n.title.toLowerCase().includes(title.toLowerCase()));
  if (note) return note;

  return null;
}

/**
 * Update backlinks when a note is renamed
 * This safely handles renaming by updating all references
 */
export async function updateBacklinksOnNoteRename(oldTitle: string, newTitle: string): Promise<void> {
  const storage = getStorage();

  // Find the note with the old title
  const note = await findNoteByTitle(oldTitle);
  if (!note) return;

  // Get all notes that might contain links to this note
  const allNotes = await storage.getAllNotes();

  for (const sourceNote of allNotes) {
    if (sourceNote.id === note.id) continue; // Skip the note itself

    // Check if this note contains wiki links to the old title
    const content = sourceNote.content;
    const regex = new RegExp(`\\[\\[${oldTitle}\\]\\]`, 'gi');

    if (regex.test(content)) {
      // Update the content to use the new title
      const updatedContent = content.replace(regex, `[[${newTitle}]]`);

      // Update the note
      await storage.updateNote(sourceNote.id, { content: updatedContent });

      // Re-sync backlinks for this note
      await syncBacklinksForNote(sourceNote.id, updatedContent);
    }
  }
}

/**
 * Get all notes that link to a specific note (incoming backlinks)
 */
export async function getIncomingBacklinks(noteId: string): Promise<Array<{
  sourceNote: Note;
  backlink: Backlink;
}>> {
  const storage = getStorage();
  const backlinks = await storage.getBacklinksForNote(noteId);

  const result = [];
  for (const backlink of backlinks) {
    const sourceNote = await storage.getNote(backlink.sourceNoteId);
    if (sourceNote) {
      result.push({
        sourceNote,
        backlink
      });
    }
  }

  return result;
}

/**
 * Get all notes that a specific note links to (outgoing links)
 */
export async function getOutgoingLinks(noteId: string): Promise<Array<{
  targetNote: Note;
  backlink: Backlink;
}>> {
  const storage = getStorage();

  // Get all backlinks where this note is the source
  const backlinks = await storage.getAllBacklinks();
  const outgoingBacklinks = backlinks.filter(bl => bl.sourceNoteId === noteId);

  const result = [];
  for (const backlink of outgoingBacklinks) {
    const targetNote = await storage.getNote(backlink.targetNoteId);
    if (targetNote) {
      result.push({
        targetNote,
        backlink
      });
    }
  }

  return result;
}