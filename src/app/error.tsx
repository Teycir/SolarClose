'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card/80 backdrop-blur-sm border rounded-lg p-6 shadow-lg text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
