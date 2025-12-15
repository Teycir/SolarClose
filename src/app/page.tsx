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
        
        <footer className="mt-8 text-center text-sm text-muted-foreground pb-4">
          <div className="flex items-center justify-center gap-2">
            <span>Made by teycirbensotan.tn</span>
            <a 
              href="https://github.com/Teycir/SolarClose/#readme" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              aria-label="GitHub Repository"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
