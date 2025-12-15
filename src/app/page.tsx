'use client';

import { useState } from 'react';
import { useSolarLead } from '@/hooks/useSolarLead';
import { CalculatorForm } from '@/components/CalculatorForm';
import { ResultsCard } from '@/components/ResultsCard';
import { ExportButton } from '@/components/ExportButton';

export default function Home() {
  const [currentLeadId, setCurrentLeadId] = useState('default-lead');
  const [showLeads, setShowLeads] = useState(false);
  const { data, setData, saveStatus } = useSolarLead(currentLeadId);

  const handleNewLead = () => {
    if (data?.clientName && !confirm('Create new lead? Current lead will be saved.')) return;
    const newId = `lead-${Date.now()}`;
    setCurrentLeadId(newId);
    setShowLeads(false);
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
          <h1 className="text-2xl sm:text-4xl font-bold text-primary">SolarClose</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLeads(!showLeads)}
              className="bg-secondary text-foreground font-semibold py-2 px-4 rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm"
              aria-label={showLeads ? 'Hide leads panel' : 'View leads panel'}
            >
              📋 {showLeads ? 'Hide' : 'View'} Leads
            </button>
            <button
              onClick={handleNewLead}
              className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm"
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

        {showLeads && (
          <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 mb-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Current Lead</h3>
            <p className="text-base mb-2">📋 {data.clientName || 'New Lead (No Name Yet)'}</p>
            <p className="text-sm text-muted-foreground">All your leads are automatically saved on this device. Click &quot;New Lead&quot; to start a new proposal.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Calculator</h2>
            <CalculatorForm data={data} onUpdate={setData} />
          </div>

          <div className="space-y-4 sm:space-y-6">
            <ResultsCard data={data} />
            <ExportButton data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
