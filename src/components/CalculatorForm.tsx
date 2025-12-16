'use client';

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

  const handleCalculate = () => {
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
        financingOption: data.financingOption as any,
        loanTerm: data.loanTerm,
        downPayment: data.downPayment,
        loanInterestRate: data.loanInterestRate,
        has25YearInverterWarranty: data.has25YearInverterWarranty,
      });

      onUpdate({
        twentyFiveYearSavings: results.twentyFiveYearSavings,
        breakEvenYear: results.breakEvenYear,
        yearlyBreakdown: results.yearlyBreakdown,
      });
    } catch (error) {
      const sanitizedError = error instanceof Error ? error.message.replace(/[\r\n]/g, ' ') : String(error).replace(/[\r\n]/g, ' ');
      console.error('Failed to calculate solar savings:', sanitizedError);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 overflow-hidden">
      <div className="flex justify-center pb-2">
        <button
          onClick={handleCalculate}
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black font-semibold py-3 px-8 rounded-lg transition-all text-base shadow-md shimmer-button hover:scale-105"
        >
          🧮 Calculate Savings
        </button>
      </div>
      
      <ClientInfoSection data={data} onUpdate={onUpdate} />
      <CompanyInfoSection data={data} onUpdate={onUpdate} />
      <PropertyFinancialSection data={data} onUpdate={onUpdate} />
      <SystemDetailsSection data={data} onUpdate={onUpdate} />
    </div>
  );
}