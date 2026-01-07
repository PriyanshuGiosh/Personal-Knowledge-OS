'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';

interface StorageContextType {
  isInitialized: boolean;
  error: Error | null;
}

const StorageContext = createContext<StorageContextType>({
  isInitialized: false,
  error: null,
});

interface StorageProviderProps {
  children: ReactNode;
}

export function StorageProvider({ children }: StorageProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initializeStorage()
      .then(() => {
        setIsInitialized(true);
      })
      .catch((err) => {
        console.error('Failed to initialize storage:', err);
        setError(err);
      });
  }, []);

  return (
    <StorageContext.Provider value={{ isInitialized, error }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}

interface StorageLoadingScreenProps {
  children: ReactNode;
}

export function StorageLoadingScreen({ children }: StorageLoadingScreenProps) {
  const { isInitialized, error } = useStorage();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Storage Error</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Failed to initialize storage. Please refresh the page to try again.
            </p>
          </div>
          <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-md">
            {error.message}
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh page
          </Button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-3xl">🧠</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Initializing Brain</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Setting up your personal knowledge space...
            </p>
          </div>
          <div className="w-32 h-2 bg-muted rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}