'use client';

import { useState, useEffect } from 'react';
import { useSolarLead } from '@/hooks/useSolarLead';
import { getTranslation, languageFlags, type Language } from '@/lib/translations';
import { CalculatorForm } from '@/components/CalculatorForm';
import { ResultsCard } from '@/components/ResultsCard';
import { ExportButton } from '@/components/ExportButton';
import { openDB } from 'idb';
import type { SolarLead } from '@/types/solar';

export default function Home() {
  const [currentLeadId, setCurrentLeadId] = useState('default-lead');
  const [allLeads, setAllLeads] = useState<SolarLead[]>([]);
  const [showLeads, setShowLeads] = useState(false);
  const { data, setData, saveStatus } = useSolarLead(currentLeadId);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const db = await openDB('solar-leads', 1);
        const leads = await db.getAll('leads');
        setAllLeads(leads.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error('Failed to load leads:', error);
      }
    };
    if (showLeads) loadLeads();
  }, [showLeads, currentLeadId, saveStatus]);

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div className="flex items-center gap-3">
            <select
              value={data.language || 'en'}
              onChange={(e) => {
                const lang = e.target.value as Language;
                const currency = lang === 'en' ? 'USD' : 'EUR';
                setData({ language: lang, currency });
              }}
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
            <button
              onClick={handleNewLead}
              className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm whitespace-nowrap"
              aria-label="Create new lead"
            >
              ➕ {getTranslation((data.language || 'en') as Language, 'newLead')}
            </button>
            <button
              onClick={() => setShowLeads(!showLeads)}
              className="bg-secondary text-foreground font-semibold py-2 px-4 rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm whitespace-nowrap"
            >
              {showLeads ? getTranslation((data.language || 'en') as Language, 'hideLeads') : getTranslation((data.language || 'en') as Language, 'viewLeads')}
            </button>
            <ExportButton data={data} />
            <div className="text-xs sm:text-sm text-muted-foreground" role="status" aria-live="polite">
              {saveStatus === 'saving' && <span aria-label="Saving">💾 Saving...</span>}
              {saveStatus === 'saved' && <span aria-label="Saved successfully">✓ Saved</span>}
              {saveStatus === 'error' && <span aria-label="Save error">⚠ Error</span>}
            </div>
          </div>
        </div>
        
        {showLeads && allLeads.length > 0 && (
          <div className="mb-4 bg-card/80 backdrop-blur-sm border rounded-lg p-4 shadow-lg">
            <h3 className="font-semibold mb-2">All Leads ({allLeads.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allLeads.map(lead => (
                <button
                  key={lead.id}
                  onClick={() => { setCurrentLeadId(lead.id); setShowLeads(false); }}
                  className={`w-full text-left p-2 rounded hover:bg-secondary transition-colors ${
                    lead.id === currentLeadId ? 'bg-secondary' : ''
                  }`}
                >
                  <div className="font-medium">{lead.clientName || 'Unnamed Lead'}</div>
                  <div className="text-xs text-muted-foreground">{lead.address || 'No address'} • {new Date(lead.createdAt).toLocaleDateString()}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <ResultsCard data={data} />
        </div>

        <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">{getTranslation((data.language || 'en') as Language, 'calculator')}</h2>
          <CalculatorForm data={data} onUpdate={setData} />
        </div>
      </div>
    </main>
  );
}
