'use client';

import type { SolarLead, Language } from '@/types/solar';
import { getTranslation, type TranslationKey } from '@/lib/translations';
import { getCurrencySymbol } from '@/lib/currency';

interface SystemDetailsSectionProps {
  data: SolarLead;
  onUpdate: (updates: Partial<SolarLead>) => void;
}

export function SystemDetailsSection({ data, onUpdate }: SystemDetailsSectionProps) {
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);
  const currencySymbol = getCurrencySymbol(data.currency || 'USD');

  // Calculate max useful monthly bill based on system size only
  const PERFORMANCE_RATIO = 0.8;
  const annualProduction = data.systemSizeKw * data.sunHoursPerDay * 365 * PERFORMANCE_RATIO;
  const monthlyProductionValue = (annualProduction / 12) * data.electricityRate;
  const productionBasedMax = data.electricityRate > 0 ? Math.ceil(monthlyProductionValue / 10) * 10 : 1000;
  const cappedMaxBill = Math.min(Math.max(productionBasedMax, 100), 2000);
  const isAtMaxCapacity = data.currentMonthlyBill >= cappedMaxBill - 10;

  // Auto-adjust monthly bill if it exceeds new max
  const handleSystemSizeChange = (newSize: number) => {
    const newAnnualProduction = newSize * data.sunHoursPerDay * 365 * PERFORMANCE_RATIO;
    const newMonthlyValue = (newAnnualProduction / 12) * data.electricityRate;
    const newMax = data.electricityRate > 0 ? Math.ceil(newMonthlyValue / 10) * 10 : 1000;
    const newCappedMax = Math.min(Math.max(newMax, 100), 2000);
    const updates: Partial<SolarLead> = { systemSizeKw: newSize };
    if (data.currentMonthlyBill > newCappedMax) {
      updates.currentMonthlyBill = newCappedMax;
    }
    onUpdate(updates);
  };

  const handleSunHoursChange = (newHours: number) => {
    const newAnnualProduction = data.systemSizeKw * newHours * 365 * PERFORMANCE_RATIO;
    const newMonthlyValue = (newAnnualProduction / 12) * data.electricityRate;
    const newMax = data.electricityRate > 0 ? Math.ceil(newMonthlyValue / 10) * 10 : 1000;
    const newCappedMax = Math.min(Math.max(newMax, 100), 2000);
    const updates: Partial<SolarLead> = { sunHoursPerDay: newHours };
    if (data.currentMonthlyBill > newCappedMax) {
      updates.currentMonthlyBill = newCappedMax;
    }
    onUpdate(updates);
  };

  const handleElectricityRateChange = (newRate: number) => {
    const newMonthlyValue = (annualProduction / 12) * newRate;
    const newMax = newRate > 0 ? Math.ceil(newMonthlyValue / 10) * 10 : 1000;
    const newCappedMax = Math.min(Math.max(newMax, 100), 2000);
    const updates: Partial<SolarLead> = { electricityRate: newRate };
    if (data.currentMonthlyBill > newCappedMax) {
      updates.currentMonthlyBill = newCappedMax;
    }
    onUpdate(updates);
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('systemSize')}: {data.systemSizeKw} kW
        </label>
        <input
          type="range"
          min="3"
          max="20"
          step="0.5"
          value={data.systemSizeKw}
          onChange={(e) => handleSystemSizeChange(Number(e.target.value))}
          className="w-full h-3 sm:h-2 bg-white/10 dark:bg-black/20 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('currentMonthlyBill')}: {currencySymbol}{data.currentMonthlyBill}
          {isAtMaxCapacity && <span className="ml-2 text-xs text-amber-500">⚠️ Max</span>}
        </label>
        <input
          type="range"
          min="50"
          max={cappedMaxBill}
          step="10"
          value={Math.min(data.currentMonthlyBill, cappedMaxBill)}
          onChange={(e) => onUpdate({ currentMonthlyBill: Number(e.target.value) })}
          className="w-full h-3 sm:h-2 bg-white/10 dark:bg-black/20 rounded-lg appearance-none cursor-pointer"
        />
        {isAtMaxCapacity && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            {t('systemAtMaxCapacity')}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('yearlyInflationRate')}: {data.yearlyInflationRate}%
        </label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={data.yearlyInflationRate}
          onChange={(e) => onUpdate({ yearlyInflationRate: Number(e.target.value) })}
          className="w-full h-3 sm:h-2 bg-white/10 dark:bg-black/20 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('systemCost')}: {currencySymbol}{data.systemCost.toLocaleString()}
        </label>
        <input
          type="range"
          min="5000"
          max="50000"
          step="1000"
          value={data.systemCost}
          onChange={(e) => onUpdate({ systemCost: Number(e.target.value) })}
          className="w-full h-3 sm:h-2 bg-white/10 dark:bg-black/20 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('electricityRate')}: {currencySymbol}{data.electricityRate}/kWh
        </label>
        <input
          type="range"
          min="0.08"
          max="0.40"
          step="0.01"
          value={data.electricityRate}
          onChange={(e) => handleElectricityRateChange(Number(e.target.value))}
          className="w-full h-3 sm:h-2 bg-white/10 dark:bg-black/20 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('sunHoursPerDay')}: {data.sunHoursPerDay}
        </label>
        <input
          type="range"
          min="3"
          max="10"
          step="0.5"
          value={data.sunHoursPerDay}
          onChange={(e) => handleSunHoursChange(Number(e.target.value))}
          className="w-full h-3 sm:h-2 bg-white/10 dark:bg-black/20 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('taxCredit')}: {data.federalTaxCredit}%
        </label>
        <input
          type="range"
          min="0"
          max="30"
          step="5"
          value={data.federalTaxCredit}
          onChange={(e) => onUpdate({ federalTaxCredit: Number(e.target.value) })}
          className="w-full h-3 sm:h-2 bg-white/10 dark:bg-black/20 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('stateIncentive')}: {currencySymbol}{data.stateIncentive.toLocaleString()}
        </label>
        <input
          type="range"
          min="0"
          max="5000"
          step="100"
          value={data.stateIncentive}
          onChange={(e) => onUpdate({ stateIncentive: Number(e.target.value) })}
          className="w-full h-3 sm:h-2 bg-white/10 dark:bg-black/20 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-3 p-4 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20">
        <input
          type="checkbox"
          id="inverter-warranty"
          checked={data.has25YearInverterWarranty || false}
          onChange={(e) => onUpdate({ has25YearInverterWarranty: e.target.checked })}
          className="w-5 h-5 cursor-pointer"
        />
        <label htmlFor="inverter-warranty" className="text-sm font-medium cursor-pointer flex-1">
          {t('inverterWarranty25')}
        </label>
      </div>
    </>
  );
}
