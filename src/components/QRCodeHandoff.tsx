'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { SolarLead, Language } from '@/types/solar';
import { getTranslation, type TranslationKey } from '@/lib/translations';
import { Tooltip } from './Tooltip';

interface QRCodeHandoffProps {
  data: SolarLead;
}

export function QRCodeHandoff({ data }: QRCodeHandoffProps) {
  const [showQR, setShowQR] = useState(false);
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as TranslationKey);

  const canGenerate = data.clientName.trim() && data.address.trim();

  const generateShareableData = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://solarclose.pages.dev';
    const shareData = {
      clientName: data.clientName,
      address: data.address,
      systemSizeKw: data.systemSizeKw,
      systemCost: data.systemCost,
      currentMonthlyBill: data.currentMonthlyBill,
      electricityRate: data.electricityRate,
      sunHoursPerDay: data.sunHoursPerDay,
      yearlyInflationRate: data.yearlyInflationRate,
      federalTaxCredit: data.federalTaxCredit,
      stateIncentive: data.stateIncentive,
      twentyFiveYearSavings: data.twentyFiveYearSavings,
      breakEvenYear: data.breakEvenYear,
      companyName: data.companyName,
      companyPhone: data.companyPhone,
      salesRep: data.salesRep,
      productDescription: (data.productDescription || '').substring(0, 200),
      proposalConditions: (data.proposalConditions || '').substring(0, 200),
      language: data.language,
      currency: data.currency,
      date: data.date,
    };
    
    const encoded = btoa(JSON.stringify(shareData));
    const url = `${baseUrl}?data=${encoded}`;
    
    // Warn if URL is too long (most browsers support 2000+ chars)
    if (url.length > 1800) {
      console.warn('QR code URL is long:', url.length, 'characters');
    }
    
    return url;
  };

  return (
    <>
      <Tooltip text={t('tooltipQRCode')}>
        <button
          onClick={() => setShowQR(!showQR)}
          disabled={!canGenerate}
          className="min-w-[80px] max-w-[100px] bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black font-semibold py-2 px-2 rounded-lg transition-all text-[9px] sm:text-[10px] shadow-md shimmer-button disabled:opacity-50"
          aria-label={t('qrCode')}
        >
          <span className="block truncate">📱 {t('qrCode')}</span>
        </button>
      </Tooltip>

      {showQR && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowQR(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('qrCodeTitle')}</h3>
              <button
                onClick={() => setShowQR(false)}
                className="text-2xl hover:opacity-70 transition-opacity"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg mb-4 flex justify-center">
              <QRCodeSVG 
                value={generateShareableData()} 
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <p className="text-sm text-center text-muted-foreground mb-4">
              {t('qrCodeInstructions')}
            </p>
            
            <div className="text-xs text-center text-muted-foreground">
              <p className="font-semibold mb-1">{t('qrCodeIncluded')}:</p>
              <ul className="list-disc list-inside text-left">
                <li>{t('clientName')}: {data.clientName}</li>
                <li>{t('systemSize')}: {data.systemSizeKw} kW</li>
                <li>{t('twentyFiveYearSavings')}</li>
                <li>{t('companyName')}: {data.companyName}</li>
              </ul>
              <button
                onClick={() => {
                  const url = generateShareableData();
                  navigator.clipboard.writeText(url);
                  alert('URL copied! You can paste it in a browser to test.');
                }}
                className="mt-2 text-xs underline hover:opacity-70"
              >
                Copy test URL
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
