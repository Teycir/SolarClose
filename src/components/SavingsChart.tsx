'use client';

import type { SolarLead } from '@/types/solar';
import { calculateSolarSavings } from '@/lib/calculations';
import { formatCurrency } from '@/lib/currency';

interface SavingsChartProps {
  data: SolarLead;
}

export function SavingsChart({ data }: SavingsChartProps) {
  const results = calculateSolarSavings({
    currentMonthlyBill: data.currentMonthlyBill,
    yearlyInflationRate: data.yearlyInflationRate,
    systemCost: data.systemCost,
    systemSizeKw: data.systemSizeKw,
    electricityRate: data.electricityRate,
    sunHoursPerDay: data.sunHoursPerDay,
    federalTaxCreditPercent: data.federalTaxCredit,
    stateIncentiveDollars: data.stateIncentive,
    financingOption: data.financingOption as any,
    loanTerm: data.loanTerm,
    downPayment: data.downPayment,
  });

  if (!results.yearlyBreakdown.length) return null;

  const maxUtility = Math.max(...results.yearlyBreakdown.map(y => y.utilityCost));
  const maxSolar = Math.max(...results.yearlyBreakdown.map(y => y.solarCost));
  const maxValue = Math.max(maxUtility, maxSolar);

  return (
    <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 sm:p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cost Comparison Over 25 Years</h3>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-destructive rounded"></div>
            <span>Utility Cost</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>Solar Cost</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-64 border-l border-b border-muted">
        <svg className="w-full h-full" viewBox="0 0 500 250" preserveAspectRatio="none">
          <polyline
            points={results.yearlyBreakdown.map((y, i) => 
              `${(i / 24) * 500},${250 - (y.utilityCost / maxValue) * 240}`
            ).join(' ')}
            fill="none"
            stroke="rgb(239, 68, 68)"
            strokeWidth="2"
          />
          <polyline
            points={results.yearlyBreakdown.map((y, i) => 
              `${(i / 24) * 500},${250 - (y.solarCost / maxValue) * 240}`
            ).join(' ')}
            fill="none"
            stroke="rgb(255, 193, 7)"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute left-0 top-0 -ml-12 text-xs text-muted-foreground">
          {formatCurrency(maxValue, data.currency)}
        </div>
        <div className="absolute left-0 bottom-0 -ml-12 text-xs text-muted-foreground">
          $0
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Year 1</span>
        <span className="text-primary font-semibold">Break-even: Year {data.breakEvenYear}</span>
        <span>Year 25</span>
      </div>
      
      <div className="text-center pt-2 border-t">
        <span className="text-sm text-muted-foreground">Total 25-Year Savings: </span>
        <span className="text-lg font-bold text-primary">{formatCurrency(data.twentyFiveYearSavings, data.currency)}</span>
      </div>
    </div>
  );
}
