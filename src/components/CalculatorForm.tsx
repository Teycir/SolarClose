'use client';

import { useEffect } from 'react';
import type { SolarLead, Currency, Language } from '@/types/solar';
import { calculateSolarSavings } from '@/lib/calculations';
import { getTranslation } from '@/lib/translations';

interface CalculatorFormProps {
  data: SolarLead;
  onUpdate: (updates: Partial<SolarLead>) => void;
}

export function CalculatorForm({ data, onUpdate }: CalculatorFormProps) {
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);

  useEffect(() => {
    const results = calculateSolarSavings({
      currentMonthlyBill: data.currentMonthlyBill,
      yearlyInflationRate: data.yearlyInflationRate,
      systemCost: data.systemCost,
      systemSizeKw: data.systemSizeKw,
      electricityRate: data.electricityRate,
      sunHoursPerDay: data.sunHoursPerDay,
      federalTaxCreditPercent: data.federalTaxCredit,
      stateIncentiveDollars: data.stateIncentive,
    });

    onUpdate({
      twentyFiveYearSavings: results.twentyFiveYearSavings,
      breakEvenYear: results.breakEvenYear,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.currentMonthlyBill, data.yearlyInflationRate, data.systemCost, data.systemSizeKw, data.electricityRate, data.sunHoursPerDay, data.federalTaxCredit, data.stateIncentive]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">{t('date')}</label>
        <input
          type="date"
          value={data.date}
          onChange={(e) => onUpdate({ date: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('clientName')} *</label>
        <input
          type="text"
          value={data.clientName}
          onChange={(e) => onUpdate({ clientName: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          placeholder="John Doe"
          required
          aria-required="true"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('address')} *</label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => onUpdate({ address: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          placeholder="123 Main St"
          required
          aria-required="true"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('companyName')}</label>
        <input
          type="text"
          value={data.companyName}
          onChange={(e) => {
            const value = e.target.value;
            try {
              localStorage.setItem('solarclose-company', value);
            } catch (error) {
              console.warn('localStorage unavailable');
            }
            onUpdate({ companyName: value });
          }}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          placeholder="Your Solar Company"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('companyEmail')} ({t('optional')})</label>
          <input
            type="email"
            value={data.companyEmail || ''}
            onChange={(e) => onUpdate({ companyEmail: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
            placeholder="info@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('companyPhone')} ({t('optional')})</label>
          <input
            type="tel"
            value={data.companyPhone || ''}
            onChange={(e) => onUpdate({ companyPhone: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
            placeholder="(555) 000-0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('companyWebsite')} ({t('optional')})</label>
          <input
            type="url"
            value={data.companyWebsite || ''}
            onChange={(e) => onUpdate({ companyWebsite: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
            placeholder="www.company.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('currency')}</label>
          <select
            value={data.currency || 'USD'}
            onChange={(e) => onUpdate({ currency: e.target.value as Currency })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('language')}</label>
          <select
            value={data.language || 'en'}
            onChange={(e) => onUpdate({ language: e.target.value as Language })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="it">Italiano</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('phone')} ({t('optional')})</label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/[^0-9+\-()\s]/g, '');
              onUpdate({ phone: sanitized });
            }}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('email')} ({t('optional')})</label>
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => onUpdate({ email: e.target.value })}
            onBlur={(e) => onUpdate({ email: e.target.value.toLowerCase().trim() })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
            placeholder="client@email.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('salesRep')} ({t('optional')})</label>
          <input
            type="text"
            value={data.salesRep || ''}
            onChange={(e) => {
              const value = e.target.value;
              try {
                localStorage.setItem('solarclose-salesrep', value);
              } catch (error) {
                console.warn('localStorage unavailable');
              }
              onUpdate({ salesRep: value });
            }}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
            placeholder="Your Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('leadStatus')} ({t('optional')})</label>
          <select
            value={data.leadStatus || ''}
            onChange={(e) => onUpdate({ leadStatus: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          >
            <option value="">Select Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Site Visit Scheduled">Site Visit Scheduled</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('propertyType')} ({t('optional')})</label>
          <select
            value={data.propertyType || ''}
            onChange={(e) => onUpdate({ propertyType: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          >
            <option value="">Select Type</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('financingOption')} ({t('optional')})</label>
          <select
            value={data.financingOption || ''}
            onChange={(e) => onUpdate({ financingOption: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          >
            <option value="">Select Option</option>
            <option value="Cash">Cash</option>
            <option value="Loan">Loan</option>
            <option value="Lease">Lease</option>
            <option value="PPA">PPA</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('roofType')} ({t('optional')})</label>
          <select
            value={data.roofType || ''}
            onChange={(e) => onUpdate({ roofType: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          >
            <option value="">Select Type</option>
            <option value="Asphalt Shingle">Asphalt Shingle</option>
            <option value="Metal">Metal</option>
            <option value="Tile">Tile</option>
            <option value="Flat">Flat</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('roofCondition')} ({t('optional')})</label>
          <select
            value={data.roofCondition || ''}
            onChange={(e) => onUpdate({ roofCondition: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          >
            <option value="">Select Condition</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Needs Repair">Needs Repair</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('utilityProvider')} ({t('optional')})</label>
          <input
            type="text"
            value={data.utilityProvider || ''}
            onChange={(e) => onUpdate({ utilityProvider: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
            placeholder="e.g., PG&E"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('avgKwhPerMonth')} ({t('optional')})</label>
          <input
            type="number"
            value={data.avgKwhPerMonth || ''}
            onChange={(e) => {
              const parsedValue = parseFloat(e.target.value);
              onUpdate({ avgKwhPerMonth: !isNaN(parsedValue) && parsedValue >= 0 ? parsedValue : undefined });
            }}
            min="0"
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
            placeholder="e.g., 850"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('notes')} ({t('optional')})</label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          placeholder="Additional notes or comments..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('currentMonthlyBill')}: ${data.currentMonthlyBill}
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
          {t('yearlyInflationRate')}: {data.yearlyInflationRate}%
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
          {t('systemSize')}: {data.systemSizeKw} kW
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
          {t('systemCost')}: ${data.systemCost.toLocaleString()}
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
          className="w-full h-3 sm:h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
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
          className="w-full h-3 sm:h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
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
          className="w-full h-3 sm:h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
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
          className="w-full h-3 sm:h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}