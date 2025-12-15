'use client';

import type { SolarLead } from '@/types/solar';

interface ResultsCardProps {
  data: SolarLead;
}

export function ResultsCard({ data }: ResultsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-lg">
      <div className="text-center">
        <h2 className="text-xs sm:text-sm text-muted-foreground mb-2">25-Year Savings</h2>
        <p className="text-3xl sm:text-5xl font-bold text-primary">
          {formatCurrency(data.twentyFiveYearSavings)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="text-center p-3 sm:p-4 bg-secondary rounded-lg">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Break-Even Year</p>
          <p className="text-xl sm:text-2xl font-bold">Year {data.breakEvenYear}</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-secondary rounded-lg">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">System Cost</p>
          <p className="text-xl sm:text-2xl font-bold">{formatCurrency(data.systemCost)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Utility (25 years)</span>
          <span className="text-destructive font-medium">
            {formatCurrency(data.currentMonthlyBill * 12 * 25 * Math.pow(1.04, 12.5))}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Solar (25 years)</span>
          <span className="text-primary font-medium">{formatCurrency(data.systemCost)}</span>
        </div>
      </div>

      <div className="relative h-8 bg-secondary rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
          style={{ 
            width: `${Math.min(100, (data.twentyFiveYearSavings / (data.systemCost * 2)) * 100)}%` 
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          Savings Progress
        </div>
      </div>
    </div>
  );
}