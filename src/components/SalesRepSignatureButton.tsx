'use client';

import { useState } from 'react';
import type { SolarLead, Language } from '@/types/solar';
import { getTranslation, type TranslationKey } from '@/lib/translations';
import { SignatureCapture } from './SignatureCapture';
import { Tooltip } from './Tooltip';

interface SalesRepSignatureButtonProps {
  data: SolarLead;
  onUpdate: (updates: Partial<SolarLead>) => void;
}

export function SalesRepSignatureButton({ data, onUpdate }: SalesRepSignatureButtonProps) {
  const [showCapture, setShowCapture] = useState(false);
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as TranslationKey);

  const handleSave = (signature: string) => {
    onUpdate({ salesRepSignature: signature });
    setShowCapture(false);
  };

  return (
    <>
      <Tooltip text={data.salesRepSignature ? t('signatureCaptured') : t('tooltipSalesRepSignature')}>
        <button
          onClick={() => setShowCapture(true)}
          className={`min-w-[80px] max-w-[100px] ${
            data.salesRepSignature 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600'
          } text-black font-semibold py-2 px-2 rounded-lg transition-all text-[9px] sm:text-[10px] shadow-md shimmer-button`}
          aria-label={t('salesRepSignature')}
        >
          <span className="block truncate">
            {data.salesRepSignature ? `✓ ${t('signatureCaptured')}` : `✍️ ${t('salesRepSignature')}`}
          </span>
        </button>
      </Tooltip>

      {showCapture && (
        <SignatureCapture
          onSave={handleSave}
          onCancel={() => setShowCapture(false)}
          language={lang}
          existingSignature={data.salesRepSignature}
        />
      )}
    </>
  );
}
