'use client';

import { useMemo } from 'react';

import type { SolarLead, Language } from '@/types/solar';
import { formatCurrency } from '@/lib/currency';
import { getTranslation } from '@/lib/translations';

interface BillSwapComparisonProps {
  data: SolarLead;
}

const MONTHS_PER_YEAR = 12;
const DAYS_PER_YEAR = 365;
const PERFORMANCE_RATIO = 0.8;

export function BillSwapComparison({ data }: BillSwapComparisonProps) {
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);

  const calculations = useMemo(() => {
    if (data.financingOption !== 'Loan' || !data.loanTerm) return null;

    const federalCredit = data.systemCost * (data.federalTaxCredit / 100);
    const netCost = Math.max(0, data.systemCost - federalCredit - data.stateIncentive);
    const loanAmount = Math.max(0, netCost - (data.downPayment || 0));
    const interestRate = (data.loanInterestRate || 6.99) / 100;
    const monthlyRate = interestRate / MONTHS_PER_YEAR;
    const numPayments = data.loanTerm * MONTHS_PER_YEAR;
    let monthlyLoanPayment = 0;
    if (loanAmount > 0) {
      if (monthlyRate === 0) {
        monthlyLoanPayment = loanAmount / numPayments;
      } else {
        const rateCompounded = Math.pow(1 + monthlyRate, numPayments);
        monthlyLoanPayment = (loanAmount * monthlyRate * rateCompounded) / (rateCompounded - 1);
      }
    }

    const annualProduction = data.systemSizeKw * data.sunHoursPerDay * DAYS_PER_YEAR * PERFORMANCE_RATIO;
    const annualUsage = data.electricityRate > 0 ? (data.currentMonthlyBill / data.electricityRate) * MONTHS_PER_YEAR : 0;
    const offsetPercentage = annualUsage > 0 ? Math.min(annualProduction / annualUsage, 1) : 0;
    const estimatedNewBill = data.currentMonthlyBill * (1 - offsetPercentage);
    const totalMonthlyPayment = monthlyLoanPayment + estimatedNewBill;
    const monthlySavings = data.currentMonthlyBill - totalMonthlyPayment;

    return { monthlyLoanPayment, estimatedNewBill, totalMonthlyPayment, monthlySavings };
  }, [
    data.financingOption,
    data.loanTerm,
    data.systemCost,
    data.federalTaxCredit,
    data.stateIncentive,
    data.downPayment,
    data.loanInterestRate,
    data.systemSizeKw,
    data.sunHoursPerDay,
    data.currentMonthlyBill,
    data.electricityRate,
  ]);

  if (!calculations) return null;

  const { monthlyLoanPayment, estimatedNewBill, totalMonthlyPayment, monthlySavings } = calculations;

  return (
    <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-sm border border-amber-700/50 rounded-lg p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">💰</span>
        <h3 className="text-lg font-semibold text-amber-400">{t('monthlyPaymentComparison')}</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-black/20 rounded-lg border-2 border-red-500/30">
          <p className="text-xs text-muted-foreground mb-2">{t('currentBill')}</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(data.currentMonthlyBill, data.currency)}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('perMonth')}</p>
        </div>
        
        <div className="text-center p-4 bg-black/20 rounded-lg border-2 border-green-500/30">
          <p className="text-xs text-muted-foreground mb-2">{t('newPayment')}</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalMonthlyPayment, data.currency)}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('perMonth')}</p>
        </div>
        
        <div className="text-center p-4 bg-black/20 rounded-lg border-2 border-primary/50">
          <p className="text-xs text-muted-foreground mb-2">{t('monthlySavings')}</p>
          <p className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-primary' : 'text-red-400'}`}>
            {monthlySavings >= 0 ? '+' : ''}{formatCurrency(monthlySavings, data.currency)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t('perMonth')}</p>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground bg-black/20 p-3 rounded">
        <p>💡 {t('newPaymentIncludes')} ({formatCurrency(monthlyLoanPayment, data.currency)}/mo) + {t('reducedUtilityBill')} ({formatCurrency(estimatedNewBill, data.currency)}/mo)</p>
      </div>
    </div>
  );
}
