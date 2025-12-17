'use client';

import { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { ConfirmDialog } from './ConfirmDialog';
import { getTranslation, type Language, type TranslationKey } from '@/lib/translations';

interface ProductDescription {
  id: string;
  description: string;
  createdAt: number;
}

interface ProductDescriptionManagerProps {
  currentDescription: string;
  onSelect: (description: string) => void;
  language?: Language;
}

export function ProductDescriptionManager({ currentDescription, onSelect, language = 'en' }: ProductDescriptionManagerProps) {
  const t = (key: string) => getTranslation(language, key as TranslationKey);
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
        upgrade(db) {
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
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to load descriptions:', errorMsg.replace(/[\r\n]/g, ' '));
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
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to save description:', errorMsg.replace(/[\r\n]/g, ' '));
    }
  };

  const deleteDescription = async (id: string) => {
    try {
      const db = await openDB('solar-leads', 2);
      await db.delete('product-descriptions', id);
      await loadDescriptions();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to delete description:', errorMsg.replace(/[\r\n]/g, ' '));
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
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to clear descriptions:', errorMsg.replace(/[\r\n]/g, ' '));
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
          💾 {t('save')}
        </button>
        {saveSuccess && <span className="text-xs text-green-600">✓ {t('saved')}</span>}
        <button
          type="button"
          onClick={() => setShowList(!showList)}
          className="text-xs bg-secondary px-3 py-1 rounded hover:opacity-90"
        >
          {showList ? `✕ ${t('hide')}` : `📋 ${t('saved')} (${descriptions.length})`}
        </button>
      </div>

      {showList && descriptions.length > 0 && (
        <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold">{t('saved')}</span>
            <button
              type="button"
              onClick={() => {
                setConfirmDialog({
                  isOpen: true,
                  title: t('clearAll'),
                  message: t('clearAllConfirmation'),
                  onConfirm: clearAllDescriptions
                });
              }}
              className="text-xs text-destructive hover:underline"
            >
              {t('clearAll')}
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
                    title: t('delete'),
                    message: t('deleteConfirmation'),
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
          confirmText={t('confirm')}
          cancelText={t('cancel')}
          isDangerous={confirmDialog.title.includes(t('delete')) || confirmDialog.title.includes(t('clearAll'))}
        />
      )}
    </div>
  );
}
