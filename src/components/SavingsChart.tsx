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
  const zeroLine = minSavings < 0 ? ((0 - minSavings) / range) * 100 : 0;

  return (
    <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 sm:p-6 space-y-3">
      <h3 className="text-lg font-semibold">25-Year Cumulative Savings</h3>
      
      <div className="flex gap-2">
        <div className="flex flex-col justify-between text-xs text-muted-foreground py-2">
          <span>{formatCurrency(maxSavings, data.currency)}</span>
          <span>{formatCurrency(maxSavings / 2, data.currency)}</span>
          <span>{formatCurrency(minSavings, data.currency)}</span>
        </div>
        
        <div className="flex-1 relative">
          {minSavings < 0 && (
            <div className="absolute w-full border-t border-dashed border-muted-foreground/50" style={{ bottom: `${zeroLine}%` }} />
          )}
          <div className="flex items-end justify-between gap-1 h-64">
            {results.yearlyBreakdown.filter((_, i) => i % 5 === 0 || i === 24).map((year) => {
              const isPositive = year.cumulativeSavings >= 0;
              const normalizedValue = year.cumulativeSavings - minSavings;
              const height = Math.max(3, (normalizedValue / range) * 100);
              
              return (
                <div key={year.year} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="relative w-full h-full flex items-end">
                    <div 
                      className={`w-full transition-all duration-300 ${isPositive ? 'bg-primary' : 'bg-destructive'} rounded-t group-hover:opacity-80 cursor-pointer`}
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        Year {year.year}<br/>{formatCurrency(year.cumulativeSavings, data.currency)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{year.year}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
        <span>Break-even: Year {data.breakEvenYear}</span>
        <span className="text-primary font-semibold">{formatCurrency(data.twentyFiveYearSavings, data.currency)} total</span>
      </div>
    </div>
  );
}
