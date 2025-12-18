'use client';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false
}: ConfirmDialogProps) {
  
  if (!isOpen) return null;

  const baseButtonClass = 'px-4 py-2 rounded-lg transition-colors text-sm font-medium';
  const cancelButtonClass = `${baseButtonClass} bg-secondary hover:bg-secondary/80`;
  const dangerClass = 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
  const primaryClass = 'bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black hover:opacity-90';
  const confirmButtonClass = `${baseButtonClass} ${isDangerous ? dangerClass : primaryClass}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="bg-card border rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4">
        <h3 id="dialog-title" className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex gap-3 justify-end">
          {cancelText && (
            <button
              onClick={() => {
                try {
                  onCancel();
                } catch (error: unknown) {
                  const errorMessage = error instanceof Error ? error.message : String(error);
                  console.error('Error in cancel handler:', errorMessage.replace(/[\r\n]/g, ' '));
                  if (error instanceof Error && error.stack) {
                    console.error('Stack trace:', error.stack.replace(/[\r\n]/g, ' | '));
                  }
                }
              }}
              className={cancelButtonClass}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              try {
                onConfirm();
              } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error('Error in confirm handler:', errorMessage.replace(/[\r\n]/g, ' '));
                if (error instanceof Error && error.stack) {
                  console.error('Stack trace:', error.stack.replace(/[\r\n]/g, ' | '));
                }
              }
            }}
            className={confirmButtonClass}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
