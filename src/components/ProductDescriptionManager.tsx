'use client';

import { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { ConfirmDialog } from './ConfirmDialog';

interface ProductDescription {
  id: string;
  description: string;
  createdAt: number;
}

interface ProductDescriptionManagerProps {
  currentDescription: string;
  onSelect: (description: string) => void;
}

export function ProductDescriptionManager({ currentDescription, onSelect }: ProductDescriptionManagerProps) {
  const [descriptions, setDescriptions] = useState<ProductDescription[]>([]);
  const [showList, setShowList] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadDescriptions();
  }, []);

  const loadDescriptions = async () => {
    try {
      const db = await openDB('solar-leads', 2, {
        upgrade(db, oldVersion) {
          if (!db.objectStoreNames.contains('leads')) {
            db.createObjectStore('leads', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('product-descriptions')) {
            db.createObjectStore('product-descriptions', { keyPath: 'id' });
          }
        },
      });
      const items = await db.getAll('product-descriptions');
      setDescriptions(items.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Failed to load descriptions:', error);
    }
  };

  const saveCurrentDescription = async () => {
    if (!currentDescription.trim()) return;
    try {
      const db = await openDB('solar-leads', 2);
      const newDesc: ProductDescription = {
        id: `desc-${Date.now()}`,
        description: currentDescription,
        createdAt: Date.now(),
      };
      await db.add('product-descriptions', newDesc);
      await loadDescriptions();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save description:', error);
    }
  };

  const deleteDescription = async (id: string) => {
    try {
      const db = await openDB('solar-leads', 2);
      await db.delete('product-descriptions', id);
      await loadDescriptions();
    } catch (error) {
      console.error('Failed to delete description:', error);
    }
    setConfirmDialog(null);
  };

  const clearAllDescriptions = async () => {
    try {
      const db = await openDB('solar-leads', 2);
      const tx = db.transaction('product-descriptions', 'readwrite');
      await tx.objectStore('product-descriptions').clear();
      await tx.done;
      setDescriptions([]);
    } catch (error) {
      console.error('Failed to clear descriptions:', error);
    }
    setConfirmDialog(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={saveCurrentDescription}
          disabled={!currentDescription.trim()}
          className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90 disabled:opacity-50"
        >
          💾 Save
        </button>
        {saveSuccess && <span className="text-xs text-green-600">✓ Saved</span>}
        <button
          type="button"
          onClick={() => setShowList(!showList)}
          className="text-xs bg-secondary px-3 py-1 rounded hover:opacity-90"
        >
          {showList ? '✕ Hide' : `📋 Saved (${descriptions.length})`}
        </button>
      </div>

      {showList && descriptions.length > 0 && (
        <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold">Saved</span>
            <button
              type="button"
              onClick={() => {
                setConfirmDialog({
                  isOpen: true,
                  title: 'Clear All',
                  message: 'Delete all saved product descriptions?',
                  onConfirm: clearAllDescriptions
                });
              }}
              className="text-xs text-destructive hover:underline"
            >
              Clear All
            </button>
          </div>
          {descriptions.map(desc => (
            <div key={desc.id} className="flex items-start gap-2 p-2 bg-secondary/50 rounded">
              <button
                type="button"
                onClick={() => {
                  onSelect(desc.description);
                  setShowList(false);
                }}
                className="flex-1 text-left text-xs hover:bg-secondary/80 p-1 rounded transition-colors"
              >
                {desc.description.substring(0, 100)}{desc.description.length > 100 ? '...' : ''}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: 'Delete Template',
                    message: 'Are you sure you want to delete this template?',
                    onConfirm: () => deleteDescription(desc.id)
                  });
                }}
                className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors text-xs"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          confirmText="Confirm"
          cancelText="Cancel"
          isDangerous={confirmDialog.title.includes('Delete') || confirmDialog.title.includes('Clear')}
        />
      )}
    </div>
  );
}
