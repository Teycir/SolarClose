'use client';

import { useParams } from 'next/navigation';
import { useSolarLead } from '@/hooks/useSolarLead';
import { getTranslation, type Language } from '@/lib/translations';
import { CalculatorForm } from '@/components/CalculatorForm';
import { ResultsCard } from '@/components/ResultsCard';
import { ExportButton } from '@/components/ExportButton';
import Link from 'next/link';

export default function CalculatorPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, setData, saveStatus } = useSolarLead(id);

  if (!data) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground" role="status" aria-live="polite">Loading...</p>
      </main>
    );
  }

  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);

  return (
    <main className="min-h-screen p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
          <Link href="/" className="text-2xl sm:text-4xl font-bold text-primary hover:opacity-80 transition-opacity">
            {t('title')}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-64">
              <ExportButton data={data} />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground" role="status" aria-live="polite">
              {saveStatus === 'saving' && <span aria-label="Saving">💾 Saving...</span>}
              {saveStatus === 'saved' && <span aria-label="Saved successfully">✓ Saved</span>}
              {saveStatus === 'error' && <span aria-label="Save error">⚠ Error</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-card/80 backdrop-blur-sm border rounded-lg p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('calculator')}</h2>
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
