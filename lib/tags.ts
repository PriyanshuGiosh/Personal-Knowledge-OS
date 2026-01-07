/**
 * Utility functions for tag detection and management
 */

import { getStorage } from '@/lib/storage';

/**
 * Extract hashtags from markdown content
 * Matches #tag format where tag can contain letters, numbers, underscores, and hyphens
 */
export function extractTagsFromContent(content: string): string[] {
  const hashtagRegex = /#([a-zA-Z0-9_-]+)/g;
  const tags: string[] = [];
  let match;

  while ((match = hashtagRegex.exec(content)) !== null) {
    const tag = match[1].toLowerCase(); // Normalize to lowercase
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }

  return tags;
}

/**
 * Remove hashtags from content while preserving the text
 * Useful for displaying content without the # symbols
 */
export function removeHashtagsFromContent(content: string): string {
  return content.replace(/#([a-zA-Z0-9_-]+)/g, '$1');
}

/**
 * Highlight hashtags in content for display
 */
export function highlightHashtags(content: string): string {
  return content.replace(
    /#([a-zA-Z0-9_-]+)/g,
    '<span class="text-blue-600 font-medium">#$1</span>'
  );
}

/**
 * Sync tags for a note based on its content
 * Creates new tags if they don't exist and updates the note's tags array
 */
export async function syncTagsForNote(noteId: string, content: string): Promise<string[]> {
  const storage = getStorage();
  const tagNames = extractTagsFromContent(content);
  const tagIds: string[] = [];

  // Get or create tags
  for (const tagName of tagNames) {
    let tag = await storage.getTagByName(tagName);
    if (!tag) {
      tag = await storage.createTag({
        name: tagName,
        color: getRandomTagColor(),
      });
    }
    tagIds.push(tag.id);
  }

  // Update the note with the new tags
  await storage.updateNote(noteId, { tags: tagIds });

  return tagIds;
}

/**
 * Generate a random color for tags
 */
function getRandomTagColor(): string {
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
    '#ec4899', // pink
    '#6b7280', // gray
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}