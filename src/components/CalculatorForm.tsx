'use client';

import { useEffect } from 'react';
import type { SolarLead } from '@/types/solar';
import { calculateSolarSavings } from '@/lib/calculations';

interface CalculatorFormProps {
  data: SolarLead;
  onUpdate: (updates: Partial<SolarLead>) => void;
}

export function CalculatorForm({ data, onUpdate }: CalculatorFormProps) {
  useEffect(() => {
    const results = calculateSolarSavings({
      currentMonthlyBill: data.currentMonthlyBill,
      yearlyInflationRate: data.yearlyInflationRate,
      systemCost: data.systemCost,
      systemSizeKw: data.systemSizeKw,
    });

    onUpdate({
      twentyFiveYearSavings: results.twentyFiveYearSavings,
      breakEvenYear: results.breakEvenYear,
    });
  }, [data.currentMonthlyBill, data.yearlyInflationRate, data.systemCost, data.systemSizeKw, onUpdate]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Date</label>
        <input
          type="date"
          value={data.date}
          onChange={(e) => onUpdate({ date: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Client Name</label>
        <input
          type="text"
          value={data.clientName}
          onChange={(e) => onUpdate({ clientName: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Address</label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => onUpdate({ address: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          placeholder="123 Main St"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Company Name</label>
        <input
          type="text"
          value={data.companyName}
          onChange={(e) => onUpdate({ companyName: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          placeholder="Your Solar Company"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Current Monthly Bill: ${data.currentMonthlyBill}
        </label>
        <input
          type="range"
          min="50"
          max="1000"
          step="10"
          value={data.currentMonthlyBill}
          onChange={(e) => onUpdate({ currentMonthlyBill: Number(e.target.value) })}
          className="w-full h-3 sm:h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Yearly Inflation Rate: {data.yearlyInflationRate}%
        </label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={data.yearlyInflationRate}
          onChange={(e) => onUpdate({ yearlyInflationRate: Number(e.target.value) })}
          className="w-full h-3 sm:h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          System Size: {data.systemSizeKw} kW
        </label>
        <input
          type="range"
          min="3"
          max="20"
          step="0.5"
          value={data.systemSizeKw}
          onChange={(e) => onUpdate({ systemSizeKw: Number(e.target.value) })}
          className="w-full h-3 sm:h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          System Cost: ${data.systemCost.toLocaleString()}
        </label>
        <input
          type="range"
          min="5000"
          max="50000"
          step="1000"
          value={data.systemCost}
          onChange={(e) => onUpdate({ systemCost: Number(e.target.value) })}
          className="w-full h-3 sm:h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}