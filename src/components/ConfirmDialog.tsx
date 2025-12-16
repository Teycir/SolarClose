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

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { isOpen, title, message, onConfirm, onCancel } = props;
  const { confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false } = props;
  
  if (!isOpen) return null;

  const baseButtonClass = 'px-4 py-2 rounded-lg transition-colors text-sm font-medium';
  const cancelButtonClass = `${baseButtonClass} bg-secondary hover:bg-secondary/80`;
  const dangerClass = 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
  const primaryClass = 'bg-primary text-primary-foreground hover:bg-primary/90';
  const confirmButtonClass = `${baseButtonClass} ${isDangerous ? dangerClass : primaryClass}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => {
              try {
                onCancel();
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error('Error in cancel handler:', errorMessage.replace(/[\r\n]/g, ' '));
              }
            }}
            className={cancelButtonClass}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              try {
                onConfirm();
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error('Error in confirm handler:', errorMessage.replace(/[\r\n]/g, ' '));
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
