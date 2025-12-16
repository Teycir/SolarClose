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

  const maxSavings = Math.max(...results.yearlyBreakdown.map(y => y.cumulativeSavings));
  const minSavings = Math.min(...results.yearlyBreakdown.map(y => y.cumulativeSavings));
  const range = Math.abs(maxSavings - minSavings) || 1;

  return (
    <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 sm:p-6 space-y-4">
      <h3 className="text-lg font-semibold">25-Year Cumulative Savings</h3>
      
      <div className="flex items-end justify-between gap-1 h-48 border-b border-muted">
        {results.yearlyBreakdown.filter((_, i) => i % 5 === 0 || i === 24).map((year) => {
          const isPositive = year.cumulativeSavings >= 0;
          const normalizedValue = year.cumulativeSavings - minSavings;
          const height = Math.max(5, (normalizedValue / range) * 100);
          
          return (
            <div key={year.year} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full h-full flex items-end">
                <div 
                  className={`w-full transition-all duration-300 ${isPositive ? 'bg-primary' : 'bg-destructive'} rounded-t group-hover:opacity-80`}
                  style={{ height: `${height}%`, minHeight: '8px' }}
                  title={`Year ${year.year}: ${formatCurrency(year.cumulativeSavings, data.currency)}`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{year.year}</span>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
        <span>Year 1</span>
        <span>Break-even: Year {data.breakEvenYear}</span>
        <span>Year 25</span>
      </div>
    </div>
  );
}
