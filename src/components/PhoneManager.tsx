'use client';

import { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { ConfirmDialog } from './ConfirmDialog';

interface PhoneItem {
  id: string;
  phone: string;
  createdAt: number;
}

interface PhoneManagerProps {
  currentPhone: string;
  onSelect: (phone: string) => void;
}

export function PhoneManager({ currentPhone, onSelect }: PhoneManagerProps) {
  const [items, setItems] = useState<PhoneItem[]>([]);
  const [showList, setShowList] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const db = await openDB('solar-leads', 2);
      const stored = await db.getAll('phones');
      setItems(stored.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Failed to load phones:', error);
    }
  };

  const saveCurrent = async () => {
    if (!currentPhone.trim()) return;
    try {
      const db = await openDB('solar-leads', 2);
      const newItem: PhoneItem = {
        id: `phone-${Date.now()}`,
        phone: currentPhone,
        createdAt: Date.now(),
      };
      await db.add('phones', newItem);
      await loadItems();
    } catch (error) {
      console.error('Failed to save phone:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const db = await openDB('solar-leads', 2);
      await db.delete('phones', id);
      await loadItems();
    } catch (error) {
      console.error('Failed to delete phone:', error);
    }
    setConfirmDialog(null);
  };

  const clearAll = async () => {
    try {
      const db = await openDB('solar-leads', 2);
      const tx = db.transaction('phones', 'readwrite');
      await tx.objectStore('phones').clear();
      await tx.done;
      setItems([]);
    } catch (error) {
      console.error('Failed to clear phones:', error);
    }
    setConfirmDialog(null);
  };

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={saveCurrent}
          disabled={!currentPhone.trim()}
          className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90 disabled:opacity-50"
        >
          💾 Save
        </button>
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
            <span className="text-xs font-semibold">Saved Phones</span>
            <button
              type="button"
              onClick={() => {
                setConfirmDialog({
                  isOpen: true,
                  title: 'Clear All',
                  message: 'Delete all saved phones?',
                  onConfirm: clearAll
                });
              }}
              className="text-xs text-destructive hover:underline"
            >
              Clear All
            </button>
          </div>
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
              <button
                type="button"
                onClick={() => {
                  onSelect(item.phone);
                  setShowList(false);
                }}
                className="flex-1 text-left text-xs hover:bg-secondary/80 p-1 rounded transition-colors"
              >
                {item.phone}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: 'Delete',
                    message: `Delete "${item.phone}"?`,
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
