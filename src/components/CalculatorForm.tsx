'use client';

import { useEffect } from 'react';
import type { SolarLead } from '@/types/solar';
import { calculateSolarSavings } from '@/lib/calculations';
import { ClientInfoSection } from './form-sections/ClientInfoSection';
import { CompanyInfoSection } from './form-sections/CompanyInfoSection';
import { SystemDetailsSection } from './form-sections/SystemDetailsSection';
import { PropertyFinancialSection } from './form-sections/PropertyFinancialSection';

interface CalculatorFormProps {
  data: SolarLead;
  onUpdate: (updates: Partial<SolarLead>) => void;
}

export function CalculatorForm({ data, onUpdate }: CalculatorFormProps) {

  useEffect(() => {
    try {
      const results = calculateSolarSavings({
        currentMonthlyBill: data.currentMonthlyBill,
        yearlyInflationRate: data.yearlyInflationRate,
        systemCost: data.systemCost,
        systemSizeKw: data.systemSizeKw,
        electricityRate: data.electricityRate,
        sunHoursPerDay: data.sunHoursPerDay,
        federalTaxCreditPercent: data.federalTaxCredit,
        stateIncentiveDollars: data.stateIncentive,
        financingOption: (data.financingOption as 'Cash' | 'Loan') || 'Cash',
        loanTerm: data.loanTerm,
        downPayment: data.downPayment,
        loanInterestRate: data.loanInterestRate,
        has25YearInverterWarranty: data.has25YearInverterWarranty,
      });

      if (results) {
        onUpdate({
          twentyFiveYearSavings: results.twentyFiveYearSavings,
          breakEvenYear: results.breakEvenYear,
          yearlyBreakdown: results.yearlyBreakdown,
        });
      }
    } catch (error) {
      const sanitizedError = error instanceof Error ? error.message.replace(/[\r\n]/g, ' ') : String(error).replace(/[\r\n]/g, ' ');
      console.error('Failed to calculate solar savings:', sanitizedError);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack.replace(/[\r\n]/g, ' | '));
      }
    }
  }, [
    data.currentMonthlyBill,
    data.yearlyInflationRate,
    data.systemCost,
    data.systemSizeKw,
    data.electricityRate,
    data.sunHoursPerDay,
    data.federalTaxCredit,
    data.stateIncentive,
    data.financingOption,
    data.loanTerm,
    data.downPayment,
    data.loanInterestRate,
    data.has25YearInverterWarranty,
    onUpdate
  ]);

  return (
    <>
      <div className="space-y-4 sm:space-y-6 overflow-hidden">
        <SystemDetailsSection data={data} onUpdate={onUpdate} />
      </div>
      
      <div className="mt-6 space-y-4 sm:space-y-6 overflow-hidden">
        <ClientInfoSection data={data} onUpdate={onUpdate} />
        <CompanyInfoSection data={data} onUpdate={onUpdate} />
        <PropertyFinancialSection data={data} onUpdate={onUpdate} />
      </div>
    </>
  );
}