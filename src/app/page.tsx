'use client';

import { useSolarLead } from '@/hooks/useSolarLead';
import { CalculatorForm } from '@/components/CalculatorForm';
import { ResultsCard } from '@/components/ResultsCard';
import { ExportButton } from '@/components/ExportButton';

export default function Home() {
  const { data, setData, saveStatus } = useSolarLead('default-lead');

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-2 sm:mb-0">SolarClose</h1>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {saveStatus === 'saving' && '💾 Saving...'}
            {saveStatus === 'saved' && '✓ Saved'}
            {saveStatus === 'error' && '⚠ Error'}
          </div>
        </div>

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
