'use client';

import { useState } from 'react';
import type { SolarLead, Language } from '@/types/solar';
import { getTranslation, type TranslationKey } from '@/lib/translations';
import { generateClientPDF, generateSellerPDF, getFilename } from '@/lib/pdf-generator';

interface ExportButtonProps {
  data: SolarLead;
}

export function ExportButton({ data }: ExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as TranslationKey);

  useState(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  });

  const canExport = data.clientName.trim() && data.address.trim() && data.companyPhone.trim() && data.companyName.trim() && data.productDescription.trim() && data.salesRep?.trim() && data.proposalConditions?.trim();

  const handleExport = async () => {
    if (!canExport) return;
    
    try {
      setIsGenerating(true);
      const clientBlob = await generateClientPDF(data);
      const sellerBlob = await generateSellerPDF(data);
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(clientBlob);
      link.download = getFilename(data, 'client');
      link.click();
      URL.revokeObjectURL(link.href);
      
      link.href = URL.createObjectURL(sellerBlob);
      link.download = getFilename(data, 'seller');
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to generate PDF:', errorMessage.replace(/[\r\n]/g, ' '));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!canExport || !canShare) return;
    
    try {
      setIsGenerating(true);
      const clientBlob = await generateClientPDF(data);
      const clientFile = new File([clientBlob], getFilename(data, 'client'), { type: 'application/pdf' });
      
      const savingsText = formatCurrency(data.twentyFiveYearSavings, data.currency);
      await navigator.share({
        title: `Solar Proposal - ${data.clientName}`,
        text: `Solar proposal for ${data.clientName} - ${savingsText} in 25-year savings`,
        files: [clientFile]
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to share PDF:', error.message.replace(/[\r\n]/g, ' '));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number, currency?: string) => {
    const symbol = currency === 'EUR' ? '€' : '$';
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  };

  const getButtonText = () => {
    if (isGenerating) return t('generating');
    return t('exportPDFs');
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={handleExport}
        disabled={isGenerating || !canExport}
        className="bg-gradient-to-r from-primary via-yellow-500 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-primary-foreground font-semibold py-2 px-6 rounded-lg transition-all duration-500 disabled:opacity-50 text-sm shadow-lg whitespace-nowrap flex items-center gap-2"
        aria-label={t('exportPDFs')}
        title={!canExport ? t('enterClientInfo') : ''}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {getButtonText()}
      </button>
      
      {canShare && (
        <button
          onClick={handleShare}
          disabled={isGenerating || !canExport}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 text-sm shadow-lg whitespace-nowrap flex items-center gap-2"
          aria-label="Share proposal"
          title={!canExport ? t('enterClientInfo') : 'Share proposal via WhatsApp, Email, etc.'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share
        </button>
      )}
    </div>
  );
}
