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

  const getWebsiteUrl = () => {
    return typeof window !== 'undefined' ? window.location.origin : 'https://solarclose.pages.dev';
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
                value={getWebsiteUrl()} 
                size={256}
                level="M"
                includeMargin={true}
              />
            </div>
            
            <p className="text-sm text-center font-semibold mb-3">
              Scan to visit SolarClose
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-xs font-semibold mb-2">Client will enter:</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{data.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">System Size:</span>
                  <span className="font-medium">{data.systemSizeKw} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">System Cost:</span>
                  <span className="font-medium">${data.systemCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Bill:</span>
                  <span className="font-medium">${data.currentMonthlyBill}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="font-medium">{data.companyName}</span>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              Client scans QR → Opens website → Enters values above
            </p>
          </div>
        </div>
      )}
    </>
  );
}
