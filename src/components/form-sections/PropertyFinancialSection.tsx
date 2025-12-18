'use client';

import type { SolarLead, Language } from '@/types/solar';
import { getTranslation, type TranslationKey } from '@/lib/translations';
import { getCurrencySymbol } from '@/lib/currency';

interface PropertyFinancialSectionProps {
  data: SolarLead;
  onUpdate: (updates: Partial<SolarLead>) => void;
}

export function PropertyFinancialSection({ data, onUpdate }: PropertyFinancialSectionProps) {
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);
  const currencySymbol = getCurrencySymbol(data.currency || 'USD');
  
  const DEFAULT_LOAN_TERM = 20;
  const DEFAULT_INTEREST_RATE = 6.99;

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">{t('leadStatus')} ({t('optional')})</label>
        <select
          value={data.leadStatus || ''}
          onChange={(e) => onUpdate({ leadStatus: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
        >
          <option value="">{t('selectStatus')}</option>
          <option value="New">{t('new')}</option>
          <option value="Contacted">{t('contacted')}</option>
          <option value="Site Visit Scheduled">{t('siteVisitScheduled')}</option>
          <option value="Proposal Sent">{t('proposalSent')}</option>
          <option value="Closed Won">{t('closedWon')}</option>
          <option value="Closed Lost">{t('closedLost')}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('propertyType')} ({t('optional')})</label>
          <select
            value={data.propertyType || ''}
            onChange={(e) => onUpdate({ propertyType: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
          >
            <option value="">{t('selectType')}</option>
            <option value="Residential">{t('residential')}</option>
            <option value="Commercial">{t('commercial')}</option>
            <option value="Industrial">{t('industrial')}</option>
            <option value="Agricultural">{t('agricultural')}</option>
            <option value="Multi-Family">{t('multiFamily')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('financingOption')} ({t('optional')})</label>
          <select
            value={data.financingOption || 'Cash'}
            onChange={(e) => onUpdate({ financingOption: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
          >
            <option value="Cash">{t('cash')}</option>
            <option value="Loan">{t('loan')}</option>
            <option value="Lease">{t('lease')}</option>
            <option value="PPA">{t('ppa')}</option>
          </select>
        </div>
      </div>

      {data.financingOption === 'Loan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20">
          <div>
            <label className="block text-sm font-medium mb-2">{t('downPayment')}: {currencySymbol}{(data.downPayment || 0).toLocaleString()}</label>
            <input
              type="range"
              min="0"
              max={data.systemCost}
              step="500"
              value={data.downPayment || 0}
              onChange={(e) => onUpdate({ downPayment: Number(e.target.value) })}
              className="w-full h-3 sm:h-2 bg-white/10 dark:bg-black/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('loanTerm')}: {data.loanTerm || DEFAULT_LOAN_TERM} {t('years')}</label>
            <input
              type="range"
              min="5"
              max="25"
              step="5"
              value={data.loanTerm || DEFAULT_LOAN_TERM}
              onChange={(e) => onUpdate({ loanTerm: Number(e.target.value) })}
              className="w-full h-3 sm:h-2 bg-white/10 dark:bg-black/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('interestRate')}: {data.loanInterestRate || DEFAULT_INTEREST_RATE}%</label>
            <input
              type="range"
              min="3"
              max="15"
              step="0.25"
              value={data.loanInterestRate || DEFAULT_INTEREST_RATE}
              onChange={(e) => onUpdate({ loanInterestRate: Number(e.target.value) })}
              className="w-full h-3 sm:h-2 bg-white/10 dark:bg-black/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('roofType')} ({t('optional')})</label>
          <select
            value={data.roofType || ''}
            onChange={(e) => onUpdate({ roofType: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
          >
            <option value="">{t('selectType')}</option>
            <option value="Asphalt Shingle">{t('asphaltShingle')}</option>
            <option value="Metal">{t('metal')}</option>
            <option value="Tile">{t('tile')}</option>
            <option value="Flat">{t('flat')}</option>
            <option value="Concrete">{t('concrete')}</option>
            <option value="Wood Shake">{t('woodShake')}</option>
            <option value="Slate">{t('slate')}</option>
            <option value="TPO">TPO</option>
            <option value="EPDM">EPDM</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('roofCondition')} ({t('optional')})</label>
          <select
            value={data.roofCondition || ''}
            onChange={(e) => onUpdate({ roofCondition: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
          >
            <option value="">{t('selectCondition')}</option>
            <option value="Excellent">{t('excellent')}</option>
            <option value="Good">{t('good')}</option>
            <option value="Fair">{t('fair')}</option>
            <option value="Needs Repair">{t('needsRepair')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('utilityProvider')} ({t('optional')})</label>
          <input
            type="text"
            value={data.utilityProvider || ''}
            onChange={(e) => {
              const value = e.target.value;
              const sanitized = value.replace(/[^a-zA-Z0-9\s&.-]/g, '').slice(0, 100);
              onUpdate({ utilityProvider: sanitized });
            }}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
            placeholder={`${t('eg')} PG and E`}
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('avgKwhPerMonth')} ({t('optional')})</label>
          <input
            type="number"
            value={data.avgKwhPerMonth || ''}
            onChange={(e) => {
              const parsedValue = parseFloat(e.target.value);
              const isValid = !isNaN(parsedValue) && parsedValue >= 0;
              onUpdate({ avgKwhPerMonth: isValid ? parsedValue : undefined });
            }}
            min="0"
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
            placeholder={`${t('eg')} 850`}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('notes')} ({t('optional')})</label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => {
            const value = e.target.value.slice(0, 500);
            onUpdate({ notes: value });
          }}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
          placeholder={t('placeholderNotes')}
          rows={3}
          maxLength={500}
        />
        <div className="text-xs text-muted-foreground mt-1">{(data.notes || '').length}/500</div>
      </div>
    </>
  );
}
