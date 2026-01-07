// Example usage of the storage layer
// This demonstrates how to use the BrainStorage API

import { getStorage } from '@/lib/storage';

// Example: Creating a note
async function createExampleNote() {
  const storage = getStorage();

  try {
    const note = await storage.createNote({
      title: 'My First Note',
      content: '# Welcome to Brain\n\nThis is my first note in the knowledge base.',
      tags: [], // Will be populated when tags are implemented
      backlinks: [], // Will be auto-populated
      isArchived: false,
      isPinned: false,
    });

    console.log('Created note:', note);
    return note;
  } catch (error) {
    console.error('Failed to create note:', error);
  }
}

// Example: Getting all notes
async function getAllNotes() {
  const storage = getStorage();

  try {
    const notes = await storage.getAllNotes({
      limit: 10,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });

    console.log('All notes:', notes);
    return notes;
  } catch (error) {
    console.error('Failed to get notes:', error);
  }
}

// Example: Updating a note
async function updateNote(noteId: string) {
  const storage = getStorage();

  try {
    const updatedNote = await storage.updateNote(noteId, {
      title: 'Updated Note Title',
      content: '# Updated Content\n\nThis note has been modified.',
      updatedAt: new Date(),
    });

    console.log('Updated note:', updatedNote);
    return updatedNote;
  } catch (error) {
    console.error('Failed to update note:', error);
  }
}

// Example: Deleting a note
async function deleteNote(noteId: string) {
  const storage = getStorage();

  try {
    await storage.deleteNote(noteId);
    console.log('Note deleted successfully');
  } catch (error) {
    console.error('Failed to delete note:', error);
  }
}

// Example: Getting storage statistics
async function getStorageStats() {
  const storage = getStorage();

  try {
    const stats = await storage.getStats();
    console.log('Storage stats:', stats);
    return stats;
  } catch (error) {
    console.error('Failed to get stats:', error);
  }
}

export {
  createExampleNote,
  getAllNotes,
  updateNote,
  deleteNote,
  getStorageStats
};