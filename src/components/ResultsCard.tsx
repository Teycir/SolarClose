'use client';

import type { SolarLead, Language } from '@/types/solar';
import { formatCurrency } from '@/lib/currency';
import { getTranslation } from '@/lib/translations';

interface ResultsCardProps {
  data: SolarLead;
}

// Solar system performance constants
const PERFORMANCE_RATIO = 0.80; // 80% real-world efficiency
const DAYS_PER_YEAR = 365;
const MONTHS_PER_YEAR = 12;

function getTranslate(language: string | undefined) {
  const lang = (language || 'en') as Language;
  return (key: string) => getTranslation(lang, key as any);
}

export function ResultsCard({ data }: ResultsCardProps) {
  const t = getTranslate(data.language);
  const annualProduction = data.systemSizeKw * data.sunHoursPerDay * DAYS_PER_YEAR * PERFORMANCE_RATIO;
  const annualUsage = data.electricityRate > 0 ? (data.currentMonthlyBill / data.electricityRate) * MONTHS_PER_YEAR : 0;
  const offsetPercentage = annualUsage > 0 ? Math.min((annualProduction / annualUsage) * 100, 100) : 0;
  const roiPercentage = data.systemCost > 0 ? Math.round((data.twentyFiveYearSavings / data.systemCost) * 100) : 0;
  const isNegativeSavings = data.twentyFiveYearSavings < 0;

  return (
    <article className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-lg" aria-label="Solar system results">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="text-center p-3 sm:p-4 bg-secondary rounded-lg">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t('breakEvenYear')}</p>
          <p className="text-lg sm:text-xl font-bold break-words">{isNegativeSavings ? t('never') : `Year ${data.breakEvenYear}`}</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-secondary rounded-lg">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t('systemCost')}</p>
          <p className="text-lg sm:text-xl font-bold break-words">{formatCurrency(data.systemCost, data.currency)}</p>
        </div>
      </div>

      <div className="text-center p-4 sm:p-6 bg-secondary rounded-lg">
        <h2 className="text-xs sm:text-sm text-muted-foreground mb-2">{isNegativeSavings ? t('twentyFiveYearLoss') : t('twentyFiveYearSavings')}</h2>
        <p className={`text-3xl sm:text-5xl font-bold break-words ${isNegativeSavings ? 'text-destructive' : 'text-primary'}`}>
          {formatCurrency(Math.abs(data.twentyFiveYearSavings), data.currency)}{isNegativeSavings ? ` ${t('loss')}` : ''}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('systemSize')}</span>
          <span className="font-medium">{data.systemSizeKw} kW</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('estAnnualProduction')}</span>
          <span className="font-medium">{Math.round(annualProduction).toLocaleString()} kWh</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('monthlyBillOffset')}</span>
          <span className="font-medium">{Math.round(offsetPercentage)}%</span>
        </div>
      </div>

      <div 
        className="relative h-8 bg-secondary rounded-full overflow-hidden"
        role="progressbar"
        aria-label="Return on investment progress"
        aria-valuenow={Math.max(0, Math.min(100, roiPercentage))}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div 
          className={`absolute left-0 top-0 h-full transition-all duration-300 ${isNegativeSavings ? 'bg-destructive' : 'bg-primary'}`}
          style={{ 
            width: `${Math.max(0, Math.min(100, roiPercentage))}%` 
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {t('roi')}: {roiPercentage}%
        </div>
      </div>
    </article>
  );
}