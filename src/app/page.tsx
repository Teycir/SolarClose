'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSolarLead } from '@/hooks/useSolarLead';
import { getTranslation, languageFlags, type Language } from '@/lib/translations';
import { ExportButton } from '@/components/ExportButton';

export default function Home() {
  const router = useRouter();
  const [currentLeadId, setCurrentLeadId] = useState('default-lead');
  const { data, setData, saveStatus } = useSolarLead(currentLeadId);

  const handleNewLead = () => {
    if (data?.clientName && !confirm('Create new lead? Current lead will be saved.')) return;
    const newId = `lead-${Date.now()}`;
    router.push(`/calculator/${newId}`);
  };

  const handleOpenCalculator = () => {
    router.push(`/calculator/${currentLeadId}`);
  };

  if (!data) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground" role="status" aria-live="polite">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
          <div className="flex items-center gap-3">
            <select
              value={data.language || 'en'}
              onChange={(e) => setData({ language: e.target.value as Language })}
              className="text-2xl bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Select language"
              title="Select language"
            >
              <option value="en">{languageFlags.en}</option>
              <option value="es">{languageFlags.es}</option>
              <option value="it">{languageFlags.it}</option>
              <option value="fr">{languageFlags.fr}</option>
              <option value="de">{languageFlags.de}</option>
            </select>
            <h1 className="text-2xl sm:text-4xl font-bold text-primary">{getTranslation((data.language || 'en') as Language, 'title')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-64">
              <ExportButton data={data} />
            </div>
            <button
              onClick={handleNewLead}
              className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm whitespace-nowrap"
              aria-label="Create new lead"
            >
              ➕ New Lead
            </button>
            <div className="text-xs sm:text-sm text-muted-foreground" role="status" aria-live="polite">
              {saveStatus === 'saving' && <span aria-label="Saving">💾 Saving...</span>}
              {saveStatus === 'saved' && <span aria-label="Saved successfully">✓ Saved</span>}
              {saveStatus === 'error' && <span aria-label="Save error">⚠ Error</span>}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-bold">
              Solar ROI Calculator
            </h2>
            <p className="text-lg text-muted-foreground">
              Calculate 25-year savings and generate professional proposals
            </p>
          </div>

          <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Current Lead</h3>
            <p className="text-lg mb-4">📋 {data.clientName || 'New Lead (No Name Yet)'}</p>
            <button
              onClick={handleOpenCalculator}
              className="w-full bg-gradient-to-r from-primary via-yellow-500 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-primary-foreground font-bold py-4 px-8 rounded-lg transition-all duration-500 text-lg shadow-lg"
            >
              🧮 Open Calculator
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
