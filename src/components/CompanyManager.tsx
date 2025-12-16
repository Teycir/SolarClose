'use client';

import { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { ConfirmDialog } from './ConfirmDialog';

interface CompanyItem {
  id: string;
  name: string;
  createdAt: number;
}

interface CompanyManagerProps {
  currentName: string;
  currentLogo?: string;
  onSelect: (name: string) => void;
  onLogoChange: (logo: string | undefined) => void;
}

export function CompanyManager({ currentName, currentLogo, onSelect, onLogoChange }: CompanyManagerProps) {
  const [items, setItems] = useState<CompanyItem[]>([]);
  const [showList, setShowList] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoSaveSuccess, setLogoSaveSuccess] = useState(false);
  const [logoError, setLogoError] = useState<string>('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const db = await openDB('solar-leads', 2);
      const stored = await db.getAll('companies');
      setItems(Array.isArray(stored) ? stored.sort((a, b) => b.createdAt - a.createdAt) : []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to load companies:', errorMessage);
      setItems([]);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError('');

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setLogoError('Only PNG and JPG files are allowed');
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      setLogoError('Logo must be under 500KB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Validate dimensions (relaxed)
          if (img.width < 100 || img.width > 1000) {
            setLogoError('Logo width should be between 100-1000px');
            return;
          }
          if (img.height < 50 || img.height > 500) {
            setLogoError('Logo height should be between 50-500px');
            return;
          }
          onLogoChange(event.target?.result as string);
        };
        img.onerror = () => {
          setLogoError('Failed to load image');
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        setLogoError('Failed to read file');
      };
      reader.readAsDataURL(file);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLogoError(`Failed to upload logo: ${errorMsg}`);
      console.error('Failed to upload logo:', errorMsg);
    }
  };

  const saveCurrent = async () => {
    if (!currentName.trim()) return;
    try {
      const db = await openDB('solar-leads', 2);
      const newItem: CompanyItem = {
        id: `company-${Date.now()}`,
        name: currentName,
        createdAt: Date.now(),
      };
      await db.add('companies', newItem);
      await loadItems();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to save company:', errorMessage);
      setLogoError(`Failed to save company: ${errorMessage}`);
    }
  };

  const saveLogo = () => {
    if (!currentLogo) return;
    try {
      localStorage.setItem('solarclose-logo', currentLogo);
      setLogoSaveSuccess(true);
      setTimeout(() => setLogoSaveSuccess(false), 2000);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLogoError(`Failed to save logo: ${errorMsg}`);
      console.error('Failed to save logo:', errorMsg);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const db = await openDB('solar-leads', 2);
      await db.delete('companies', id);
      await loadItems();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to delete company:', errorMsg);
    }
    setConfirmDialog(null);
  };

  const clearAll = async () => {
    try {
      const db = await openDB('solar-leads', 2);
      const tx = db.transaction('companies', 'readwrite');
      await tx.objectStore('companies').clear();
      await tx.done;
      setItems([]);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to clear companies:', errorMsg);
    }
    setConfirmDialog(null);
  };

  return (
    <div className="space-y-4 mt-2">
      <div className="space-y-1">
        <label className="block text-sm font-medium">
          Company Logo
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleLogoUpload}
            className="text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:opacity-90"
          />
          {currentLogo && (
            <button
              type="button"
              onClick={() => onLogoChange(undefined)}
              className="text-sm text-destructive hover:underline"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">PNG or JPG, 100-1000px wide, 50-500px tall, max 500KB</p>
        {logoError && <p className="text-xs text-destructive">{logoError}</p>}
        {currentLogo && (
          <div className="bg-white p-2 rounded border flex justify-center items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentLogo} alt="Company logo" className="max-h-16 max-w-[200px] object-contain" />
          </div>
        )}
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={saveLogo}
            disabled={!currentLogo}
            className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90 disabled:opacity-50"
          >
            💾 Save Logo
          </button>
          {logoSaveSuccess && <span className="text-xs text-green-600">✓ Saved</span>}
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={saveCurrent}
          disabled={!currentName.trim()}
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
                  message: 'Delete all saved companies?',
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
                    title: 'Delete',
                    message: `Delete "${item.name}"?`,
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
