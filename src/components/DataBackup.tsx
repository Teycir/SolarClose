'use client';

import { useState } from 'react';
import { openDB } from 'idb';
import type { SolarLead, Language } from '@/types/solar';
import { getTranslation, type TranslationKey } from '@/lib/translations';
import { Tooltip } from './Tooltip';

interface DataBackupProps {
  data?: { language?: Language };
}

export function DataBackup({ data }: DataBackupProps) {
  const lang: Language = (data?.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as TranslationKey);
  const [status, setStatus] = useState<'idle' | 'exporting' | 'importing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const exportData = async () => {
    try {
      setStatus('exporting');
      const db = await openDB('solar-leads', 2);
      const leads = await db.getAll('leads');
      
      const dataStr = JSON.stringify(leads, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `solarclose-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatus('success');
      setMessage(`Exported ${leads.length} leads`);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Export failed: ${errorMsg}`);
      console.error('Export failed:', errorMsg);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setStatus('importing');
      const text = await file.text();
      const leads = JSON.parse(text) as SolarLead[];
      
      if (!Array.isArray(leads)) {
        throw new Error('Invalid backup file');
      }

      const db = await openDB('solar-leads', 2);
      let imported = 0;
      
      for (const lead of leads) {
        if (lead.id && lead.clientName) {
          await db.put('leads', lead);
          imported++;
        }
      }
      
      setStatus('success');
      setMessage(`Imported ${imported} leads`);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Import failed: ${errorMsg}`);
      console.error('Import failed:', errorMsg);
      setTimeout(() => setStatus('idle'), 3000);
    }
    
    event.target.value = '';
  };

  return (
    <>
      <Tooltip text={t('tooltipBackup')}>
        <button
          onClick={exportData}
          disabled={status === 'exporting'}
          className="w-[100px] sm:w-[120px] bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black font-semibold py-2 px-1 sm:px-3 rounded-lg transition-all text-[10px] sm:text-xs shadow-md shimmer-button disabled:opacity-50"
        >
          <span className="block truncate">⬇️ {t('backup')}</span>
        </button>
      </Tooltip>
      
      <Tooltip text={t('tooltipRestore')}>
        <label className="w-[100px] sm:w-[120px] bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black font-semibold py-2 px-1 sm:px-3 rounded-lg transition-all text-[10px] sm:text-xs shadow-md shimmer-button cursor-pointer block text-center">
          ⬆️ {t('restore')}
          <input
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
            disabled={status === 'importing'}
          />
        </label>
      </Tooltip>
      
      {status !== 'idle' && (
        <span className="text-xs text-muted-foreground">
          {status === 'exporting' && '⬇️ Exporting...'}
          {status === 'importing' && '⬆️ Importing...'}
          {status === 'success' && `✓ ${message}`}
          {status === 'error' && `⚠ ${message}`}
        </span>
      )}
    </>
  );
}
