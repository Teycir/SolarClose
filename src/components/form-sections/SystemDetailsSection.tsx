'use client';

import type { SolarLead, Language } from '@/types/solar';
import { getTranslation, type TranslationKey } from '@/lib/translations';

interface SystemDetailsSectionProps {
  data: SolarLead;
  onUpdate: (updates: Partial<SolarLead>) => void;
}

export function SystemDetailsSection({ data, onUpdate }: SystemDetailsSectionProps) {
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);

  // Calculate max useful monthly bill based on system cost and size
  const PERFORMANCE_RATIO = 0.8;
  const annualProduction = data.systemSizeKw * data.sunHoursPerDay * 365 * PERFORMANCE_RATIO;
  const productionBasedMax = data.electricityRate > 0 ? Math.ceil((annualProduction / 12) * data.electricityRate / 10) * 10 : 1000;
  const costBasedMax = Math.ceil(data.systemCost / 50);
  const maxUsefulBill = Math.max(productionBasedMax, costBasedMax);
  const cappedMaxBill = Math.min(Math.max(maxUsefulBill, 100), 2000);
  const isAtMaxCapacity = data.currentMonthlyBill >= cappedMaxBill - 10;

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
          onChange={(e) => onUpdate({ systemSizeKw: Number(e.target.value) })}
          className="w-full h-3 sm:h-2 bg-white/10 dark:bg-black/20 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('currentMonthlyBill')}: ${data.currentMonthlyBill}
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
            System at max capacity. Increase system size for higher bills.
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
          {t('systemCost')}: ${data.systemCost.toLocaleString()}
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
          {t('electricityRate')}: ${data.electricityRate}/kWh
        </label>
        <input
          type="range"
          min="0.08"
          max="0.40"
          step="0.01"
          value={data.electricityRate}
          onChange={(e) => onUpdate({ electricityRate: Number(e.target.value) })}
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
          onChange={(e) => onUpdate({ sunHoursPerDay: Number(e.target.value) })}
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
          {t('stateIncentive')}: ${data.stateIncentive.toLocaleString()}
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
          System has 25-year Inverter Warranty (e.g., Enphase Microinverters, SolarEdge with extended warranty)
        </label>
      </div>
    </>
  );
}
