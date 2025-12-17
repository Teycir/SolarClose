'use client';

import { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { ConfirmDialog } from './ConfirmDialog';

interface DataItem {
  id: string;
  value: string;
  createdAt: number;
}

interface GenericDataManagerProps {
  storeName: 'companies' | 'phones' | 'sales-reps' | 'proposal-conditions';
  currentValue: string;
  onSelect: (value: string) => void;
  label?: string;
  multiline?: boolean;
}

export function GenericDataManager({ storeName, currentValue, onSelect, label = 'item', multiline = false }: GenericDataManagerProps) {
  const [items, setItems] = useState<DataItem[]>([]);
  const [showList, setShowList] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadItems = async () => {
    try {
      const db = await openDB('solar-leads', 2);
      const stored = await db.getAll(storeName);
      setItems(Array.isArray(stored) ? stored.sort((a, b) => b.createdAt - a.createdAt) : []);
    } catch (error) {
      console.error(`Failed to load ${storeName}:`, error);
      setItems([]);
    }
  };

  const saveCurrent = async () => {
    if (!currentValue.trim()) return;
    try {
      const db = await openDB('solar-leads', 2);
      const newItem: DataItem = {
        id: `${storeName}-${Date.now()}`,
        value: currentValue,
        createdAt: Date.now(),
      };
      await db.add(storeName, newItem);
      await loadItems();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error(`Failed to save ${label}:`, error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const db = await openDB('solar-leads', 2);
      await db.delete(storeName, id);
      await loadItems();
    } catch (error) {
      console.error(`Failed to delete ${label}:`, error);
    }
    setConfirmDialog(null);
  };

  const clearAll = async () => {
    try {
      const db = await openDB('solar-leads', 2);
      const tx = db.transaction(storeName, 'readwrite');
      await tx.objectStore(storeName).clear();
      await tx.done;
      setItems([]);
    } catch (error) {
      console.error(`Failed to clear ${storeName}:`, error);
    }
    setConfirmDialog(null);
  };

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={saveCurrent}
          disabled={!currentValue.trim()}
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
          {showList ? '✕ Hide' : `📋 Saved (${items.length})`}
        </button>
      </div>

      {showList && items.length > 0 && (
        <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto mt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold">Saved</span>
            <button
              type="button"
              onClick={() => {
                setConfirmDialog({
                  isOpen: true,
                  title: 'Clear All',
                  message: `Delete all saved ${label}s?`,
                  onConfirm: clearAll
                });
              }}
              className="text-xs text-destructive hover:underline"
            >
              Clear All
            </button>
          </div>
          {items.map(item => (
            <div key={item.id} className={`flex ${multiline ? 'items-start' : 'items-center'} gap-2 p-2 bg-secondary/50 rounded`}>
              <button
                type="button"
                onClick={() => {
                  onSelect(item.value);
                  setShowList(false);
                }}
                className="flex-1 text-left text-xs hover:bg-secondary/80 p-1 rounded transition-colors"
              >
                {multiline && item.value.length > 100 ? `${item.value.substring(0, 100)}...` : item.value}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: 'Delete',
                    message: multiline ? `Delete this ${label}?` : `Delete "${item.value}"?`,
                    onConfirm: () => deleteItem(item.id)
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
          isDangerous={true}
        />
      )}
    </div>
  );
}
