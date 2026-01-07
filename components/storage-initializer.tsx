'use client';

import { useEffect } from 'react';
import { initializeStorage } from '@/lib/storage';

/**
 * Client component to initialize storage on app startup
 * This ensures IndexedDB is ready before any storage operations
 */
export function StorageInitializer() {
  useEffect(() => {
    initializeStorage().catch(console.error);
  }, []);

  return null; // This component doesn't render anything
}