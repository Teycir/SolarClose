'use client';

import type { SolarLead } from '@/types/solar';

interface ResultsCardProps {
  data: SolarLead;
}

export function ResultsCard({ data }: ResultsCardProps) {
  const performanceRatio = 0.80;
  const annualProduction = data.systemSizeKw * data.sunHoursPerDay * 365 * performanceRatio;
  const annualUsage = data.electricityRate > 0 ? (data.currentMonthlyBill / data.electricityRate) * 12 : 0;
  const offsetPercentage = annualUsage > 0 ? Math.min((annualProduction / annualUsage) * 100, 100) : 0;
  const roiPercentage = data.systemCost > 0 ? Math.round((data.twentyFiveYearSavings / data.systemCost) * 100) : 0;
  const isNegativeSavings = data.twentyFiveYearSavings < 0;

  return (
    <article className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-lg" aria-label="Solar system results">
      <div className="text-center">
        <h2 className="text-xs sm:text-sm text-muted-foreground mb-2">25-Year {isNegativeSavings ? 'Loss' : 'Savings'}</h2>
        <p className={`text-3xl sm:text-5xl font-bold ${isNegativeSavings ? 'text-destructive' : 'text-primary'}`}>
          ${Math.abs(data.twentyFiveYearSavings).toLocaleString()}{isNegativeSavings ? ' loss' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="text-center p-3 sm:p-4 bg-secondary rounded-lg">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Break-Even Year</p>
          <p className="text-xl sm:text-2xl font-bold">{isNegativeSavings ? 'Never' : `Year ${data.breakEvenYear}`}</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-secondary rounded-lg">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">System Cost</p>
          <p className="text-xl sm:text-2xl font-bold">${data.systemCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">System Size</span>
          <span className="font-medium">{data.systemSizeKw} kW</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Est. Annual Production</span>
          <span className="font-medium">{Math.round(annualProduction).toLocaleString()} kWh</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Monthly Bill Offset</span>
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
          ROI: {roiPercentage}%
        </div>
      </div>
    </article>
  );
}