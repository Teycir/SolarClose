'use client';

import { useEffect } from 'react';

const logError = (error: Error | null) => {
  try {
    const errorMessage = error?.message || 'Unknown error';
    console.error('Application error:', errorMessage.replace(/[\r\n]/g, ' '));
  } catch {
    console.error('Failed to log error');
  }
};

const handleReset = (reset: () => void) => {
  try {
    reset();
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to reset:', errorMsg.replace(/[\r\n]/g, ' '));
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

  const defaultMessage = 'An unexpected error occurred. Please try again.';
  const sanitizedMessage = error?.message?.replace(/[<>"'&]/g, '');
  const displayMessage = sanitizedMessage || defaultMessage;
  const onReset = () => handleReset(reset);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card/80 backdrop-blur-sm border rounded-lg p-6 shadow-lg text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          {displayMessage}
        </p>
        <button
          onClick={onReset}
          className="bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
