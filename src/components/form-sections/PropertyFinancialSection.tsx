'use client';

import type { SolarLead, Language } from '@/types/solar';
import { getTranslation } from '@/lib/translations';

interface PropertyFinancialSectionProps {
  data: SolarLead;
  onUpdate: (updates: Partial<SolarLead>) => void;
}

export function PropertyFinancialSection({ data, onUpdate }: PropertyFinancialSectionProps) {
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">{t('leadStatus')} ({t('optional')})</label>
        <select
          value={data.leadStatus || ''}
          onChange={(e) => onUpdate({ leadStatus: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
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
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          >
            <option value="">{t('selectType')}</option>
            <option value="Residential">{t('residential')}</option>
            <option value="Commercial">{t('commercial')}</option>
            <option value="Industrial">Industrial</option>
            <option value="Agricultural">Agricultural</option>
            <option value="Multi-Family">Multi-Family</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('financingOption')} ({t('optional')})</label>
          <select
            value={data.financingOption || 'Cash'}
            onChange={(e) => onUpdate({ financingOption: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          >
            <option value="Cash">{t('cash')}</option>
            <option value="Loan">{t('loan')}</option>
            <option value="Lease">{t('lease')}</option>
            <option value="PPA">{t('ppa')}</option>
          </select>
        </div>
      </div>

      {data.financingOption === 'Loan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg border border-input">
          <div>
            <label className="block text-sm font-medium mb-2">Down Payment: ${(data.downPayment || 0).toLocaleString()}</label>
            <input
              type="range"
              min="0"
              max={data.systemCost}
              step="500"
              value={data.downPayment || 0}
              onChange={(e) => onUpdate({ downPayment: Number(e.target.value) })}
              className="w-full h-3 sm:h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Loan Term: {data.loanTerm || 20} years</label>
            <input
              type="range"
              min="5"
              max="25"
              step="5"
              value={data.loanTerm || 20}
              onChange={(e) => onUpdate({ loanTerm: Number(e.target.value) })}
              className="w-full h-3 sm:h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Interest Rate: {data.loanInterestRate || 6.99}%</label>
            <input
              type="range"
              min="3"
              max="15"
              step="0.25"
              value={data.loanInterestRate || 6.99}
              onChange={(e) => onUpdate({ loanInterestRate: Number(e.target.value) })}
              className="w-full h-3 sm:h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
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
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          >
            <option value="">{t('selectType')}</option>
            <option value="Asphalt Shingle">{t('asphaltShingle')}</option>
            <option value="Metal">{t('metal')}</option>
            <option value="Tile">{t('tile')}</option>
            <option value="Flat">{t('flat')}</option>
            <option value="Concrete">Concrete</option>
            <option value="Wood Shake">Wood Shake</option>
            <option value="Slate">Slate</option>
            <option value="TPO">TPO</option>
            <option value="EPDM">EPDM</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('roofCondition')} ({t('optional')})</label>
          <select
            value={data.roofCondition || ''}
            onChange={(e) => onUpdate({ roofCondition: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
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
              const sanitized = e.target.value.replace(/[^a-zA-Z0-9\s&.-]/g, '');
              onUpdate({ utilityProvider: sanitized });
            }}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
            placeholder={`${t('eg')} PG and E`}
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
            placeholder={`${t('eg')} 850`}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('notes')} ({t('optional')})</label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => {
            const sanitized = e.target.value.replace(/[<>"]/g, '');
            onUpdate({ notes: sanitized });
          }}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          placeholder={t('placeholderNotes')}
          rows={3}
        />
      </div>
    </>
  );
}
