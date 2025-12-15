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
        <p className="text-muted-foreground">Loading...</p>
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
            >
              📋 {showLeads ? 'Hide' : 'View'} Leads
            </button>
            <button
              onClick={handleNewLead}
              className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm"
            >
              ➕ New Lead
            </button>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {saveStatus === 'saving' && '💾 Saving...'}
              {saveStatus === 'saved' && '✓ Saved'}
              {saveStatus === 'error' && '⚠ Error'}
            </div>
          </div>
        </div>

        {showLeads && (
          <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 mb-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Saved Leads</h3>
            <p className="text-sm text-muted-foreground mb-3">Current: {data.clientName || 'Unnamed'} (ID: {currentLeadId.slice(0, 12)}...)</p>
            <p className="text-xs text-muted-foreground">Note: All leads are saved locally in your browser. Use browser dev tools (F12 → Application → IndexedDB → solar-leads) to view all saved leads.</p>
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
