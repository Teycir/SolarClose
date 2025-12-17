'use client';

import { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { ConfirmDialog } from './ConfirmDialog';
import { getTranslation, type Language, type TranslationKey } from '@/lib/translations';

interface SalesRepItem {
  id: string;
  name: string;
  createdAt: number;
}

interface SalesRepManagerProps {
  currentName: string;
  onSelect: (name: string) => void;
  language?: Language;
}

export function SalesRepManager({ currentName, onSelect, language = 'en' }: SalesRepManagerProps) {
  const t = (key: string) => getTranslation(language, key as TranslationKey);
  const [items, setItems] = useState<SalesRepItem[]>([]);
  const [showList, setShowList] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const db = await openDB('solar-leads', 2);
      const stored = await db.getAll('sales-reps');
      setItems(stored.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Failed to load sales reps:', error);
    }
  };

  const saveCurrent = async () => {
    if (!currentName.trim()) return;
    try {
      const db = await openDB('solar-leads', 2);
      const newItem: SalesRepItem = {
        id: `rep-${Date.now()}`,
        name: currentName,
        createdAt: Date.now(),
      };
      await db.add('sales-reps', newItem);
      await loadItems();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save sales rep:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const db = await openDB('solar-leads', 2);
      await db.delete('sales-reps', id);
      await loadItems();
    } catch (error) {
      console.error('Failed to delete sales rep:', error);
    }
    setConfirmDialog(null);
  };

  const clearAll = async () => {
    try {
      const db = await openDB('solar-leads', 2);
      const tx = db.transaction('sales-reps', 'readwrite');
      await tx.objectStore('sales-reps').clear();
      await tx.done;
      setItems([]);
    } catch (error) {
      console.error('Failed to clear sales reps:', error);
    }
    setConfirmDialog(null);
  };

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={saveCurrent}
          disabled={!currentName.trim()}
          className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90 disabled:opacity-50"
        >
          💾 {t('save')}
        </button>
        {saveSuccess && <span className="text-xs text-green-600">✓ {t('saved')}</span>}
        <button
          type="button"
          onClick={() => setShowList(!showList)}
          className="text-xs bg-secondary px-3 py-1 rounded hover:opacity-90"
        >
          {showList ? `✕ ${t('hide')}` : `📋 ${t('saved')} (${items.length})`}
        </button>
      </div>

      {showList && items.length > 0 && (
        <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto mt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold">{t('saved')}</span>
            <button
              type="button"
              onClick={() => {
                setConfirmDialog({
                  isOpen: true,
                  title: t('clearAll'),
                  message: t('clearAllConfirmation'),
                  onConfirm: clearAll
                });
              }}
              className="text-xs text-destructive hover:underline"
            >
              {t('clearAll')}
            </button>
          </div>
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
              <button
                type="button"
                onClick={() => {
                  onSelect(item.name);
                  setShowList(false);
                }}
                className="flex-1 text-left text-xs hover:bg-secondary/80 p-1 rounded transition-colors"
              >
                {item.name}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: t('delete'),
                    message: `${t('deleteConfirmation')} "${item.name}"?`,
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
          confirmText={t('confirm')}
          cancelText={t('cancel')}
          isDangerous={true}
        />
      )}
    </div>
  );
}
