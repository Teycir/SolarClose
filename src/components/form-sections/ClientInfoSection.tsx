'use client';

import type { SolarLead, Language } from '@/types/solar';
import { getTranslation } from '@/lib/translations';

interface ClientInfoSectionProps {
  data: SolarLead;
  onUpdate: (updates: Partial<SolarLead>) => void;
}

export function ClientInfoSection({ data, onUpdate }: ClientInfoSectionProps) {
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);

  return (
    <>
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
          onChange={(e) => {
            const sanitized = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
            onUpdate({ clientName: sanitized });
          }}
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
          onChange={(e) => {
            const sanitized = e.target.value.replace(/[<>"]/g, '');
            onUpdate({ address: sanitized });
          }}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
          placeholder="123 Main St"
          required
          aria-required="true"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('phone')} ({t('optional')})</label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/[^0-9+\-() ]/g, '');
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
            onChange={(e) => {
              const sanitized = e.target.value.replace(/[^a-zA-Z0-9@._+-]/g, '').toLowerCase();
              onUpdate({ email: sanitized });
            }}
            className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-secondary rounded-lg border border-input text-base"
            placeholder="client@email.com"
          />
        </div>
      </div>
    </>
  );
}
