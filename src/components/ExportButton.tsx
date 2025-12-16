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
    <>
      <button
        onClick={handleExport}
        disabled={isGenerating || !canExport}
        className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black font-semibold py-2 px-4 rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm whitespace-nowrap shadow-md disabled:opacity-50"
        aria-label={t('exportPDFs')}
        title={!canExport ? t('enterClientInfo') : ''}
      >
        📄 {getButtonText()}
      </button>
      
      {canShare && (
        <button
          onClick={handleShare}
          disabled={isGenerating || !canExport}
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black font-semibold py-2 px-4 rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm whitespace-nowrap shadow-md disabled:opacity-50"
          aria-label="Share proposal"
          title={!canExport ? t('enterClientInfo') : 'Share proposal via WhatsApp, Email, etc.'}
        >
          📤 {t('share')}
        </button>
      )}
    </>
  );
}
