'use client';

import { useState } from 'react';
import { useSolarLead } from '@/hooks/useSolarLead';
import { getTranslation, languageFlags, type Language } from '@/lib/translations';
import { CalculatorForm } from '@/components/CalculatorForm';
import { ResultsCard } from '@/components/ResultsCard';
import { ExportButton } from '@/components/ExportButton';

export default function Home() {
  const [currentLeadId, setCurrentLeadId] = useState('default-lead');
  const { data, setData, saveStatus } = useSolarLead(currentLeadId);

  const handleNewLead = () => {
    if (data?.clientName && !confirm('Create new lead? Current lead will be saved.')) return;
    const newId = `lead-${Date.now()}`;
    setCurrentLeadId(newId);
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-card/80 backdrop-blur-sm border rounded-lg p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">{getTranslation((data.language || 'en') as Language, 'calculator')}</h2>
            <CalculatorForm data={data} onUpdate={setData} />
          </div>

          <div className="space-y-4 sm:space-y-6">
            <ResultsCard data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
