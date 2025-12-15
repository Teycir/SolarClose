'use client';

import { useEffect } from 'react';

const logError = (error: unknown) => {
  try {
    console.error('Application error:', error);
  } catch (e) {
    console.error('Failed to log error:', e);
  }
};

const handleReset = (reset: () => void) => {
  try {
    reset();
  } catch (e) {
    console.error('Failed to reset:', e);
  }
};

export default function Error({
  error,
  reset,
}: {
  error: (Error & { digest?: string }) | null;
  reset: () => void;
}) {
  useEffect(() => {
    logError(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card/80 backdrop-blur-sm border rounded-lg p-6 shadow-lg text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={() => handleReset(reset)}
          className="bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
