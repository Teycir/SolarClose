'use client';

import type { SolarLead, Language } from '@/types/solar';
import { getTranslation, type TranslationKey } from '@/lib/translations';
import { ProductDescriptionManager } from '../ProductDescriptionManager';
import { CompanyManager } from '../CompanyManager';
import { GenericDataManager } from '../GenericDataManager';

interface CompanyInfoSectionProps {
  data: SolarLead;
  onUpdate: (updates: Partial<SolarLead>) => void;
}

const saveToLocalStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable
  }
};

export function CompanyInfoSection({ data, onUpdate }: CompanyInfoSectionProps) {
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Product Description *</label>
        <textarea
          value={data.productDescription}
          onChange={(e) => {
            const sanitized = e.target.value.replace(/[<>"]/g, '').substring(0, 500);
            onUpdate({ productDescription: sanitized });
          }}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
          placeholder="e.g., Premium solar panels (400W), 10-year warranty, professional installation included..."
          rows={3}
          maxLength={500}
          required
          aria-required="true"
        />
        <div className="text-xs text-muted-foreground mt-1">{data.productDescription.length}/500</div>
        <ProductDescriptionManager
          currentDescription={data.productDescription}
          onSelect={(desc) => onUpdate({ productDescription: desc })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Proposal Conditions *</label>
        <textarea
          value={data.proposalConditions || ''}
          onChange={(e) => {
            const sanitized = e.target.value.replace(/[<>"]/g, '');
            onUpdate({ proposalConditions: sanitized });
          }}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
          placeholder="This proposal is valid for 30 days.\nFinal pricing subject to site inspection.\nInstallation timeline: 4-8 weeks after approval."
          rows={3}
          required
          aria-required="true"
        />
        <GenericDataManager
          storeName="proposal-conditions"
          currentValue={data.proposalConditions || ''}
          onSelect={(conditions) => onUpdate({ proposalConditions: conditions })}
          label="proposal condition"
          multiline={true}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('companyName')} *</label>
        <input
          type="text"
          value={data.companyName}
          onChange={(e) => {
            const sanitized = e.target.value.replace(/[^a-zA-Z0-9\s&.,-]/g, '');
            saveToLocalStorage('solarclose-company', sanitized);
            onUpdate({ companyName: sanitized });
          }}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
          placeholder={t('placeholderCompany')}
          required
          aria-required="true"
        />
        <CompanyManager
          currentName={data.companyName}
          currentLogo={data.companyLogo}
          onSelect={(name) => {
            saveToLocalStorage('solarclose-company', name);
            onUpdate({ companyName: name });
          }}
          onLogoChange={(logo) => onUpdate({ companyLogo: logo })}
          showOnlyNameButtons={true}
        />
      </div>
      
      <CompanyManager
        currentName={data.companyName}
        currentLogo={data.companyLogo}
        onSelect={(name) => {
          saveToLocalStorage('solarclose-company', name);
          onUpdate({ companyName: name });
        }}
        onLogoChange={(logo) => onUpdate({ companyLogo: logo })}
        showOnlyLogo={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('companyPhone')} *</label>
          <input
            type="tel"
            value={data.companyPhone}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/[^0-9+\-() ]/g, '');
              saveToLocalStorage('solarclose-phone', sanitized);
              onUpdate({ companyPhone: sanitized });
            }}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
            placeholder="(555) 000-0000"
            required
            aria-required="true"
          />
          <GenericDataManager
            storeName="phones"
            currentValue={data.companyPhone}
            onSelect={(phone) => {
              saveToLocalStorage('solarclose-phone', phone);
              onUpdate({ companyPhone: phone });
            }}
            label="phone"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('salesRep')} *</label>
          <input
            type="text"
            value={data.salesRep || ''}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
              saveToLocalStorage('solarclose-salesrep', sanitized);
              onUpdate({ salesRep: sanitized });
            }}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
            placeholder={t('placeholderSalesRep')}
            required
            aria-required="true"
          />
          <GenericDataManager
            storeName="sales-reps"
            currentValue={data.salesRep || ''}
            onSelect={(name) => {
              saveToLocalStorage('solarclose-salesrep', name);
              onUpdate({ salesRep: name });
            }}
            label="sales rep"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('companyEmail')} ({t('optional')})</label>
        <input
          type="email"
          value={data.companyEmail || ''}
          onChange={(e) => {
            const sanitized = e.target.value.replace(/[^a-zA-Z0-9@._+-]/g, '').toLowerCase();
            onUpdate({ companyEmail: sanitized });
          }}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 text-base"
          placeholder="info@company.com"
        />
      </div>
    </>
  );
}
