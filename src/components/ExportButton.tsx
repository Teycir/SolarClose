'use client';

import { useState, useEffect } from 'react';
import type { SolarLead, Language } from '@/types/solar';
import { getTranslation, type TranslationKey } from '@/lib/translations';
import { generateClientPDF, generateSellerPDF, getFilename } from '@/lib/pdf-generator';
import { formatCurrency } from '@/lib/currency';
import { Tooltip } from './Tooltip';

interface ExportButtonProps {
  data: SolarLead;
}

export function ExportButton({ data }: ExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as TranslationKey);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  const canExport = data.clientName.trim() && data.address.trim() && data.companyPhone.trim() && data.companyName.trim() && data.productDescription.trim() && data.salesRep?.trim() && data.proposalConditions?.trim();

  const handleExport = async () => {
    if (!canExport) return;
    
    try {
      setIsGenerating(true);
      const clientBlob = await generateClientPDF(data);
      const sellerBlob = await generateSellerPDF(data);
      
      const clientUrl = URL.createObjectURL(clientBlob);
      const clientLink = document.createElement('a');
      clientLink.href = clientUrl;
      clientLink.download = getFilename(data, 'client');
      clientLink.click();
      URL.revokeObjectURL(clientUrl);
      
      const sellerUrl = URL.createObjectURL(sellerBlob);
      const sellerLink = document.createElement('a');
      sellerLink.href = sellerUrl;
      sellerLink.download = getFilename(data, 'seller');
      sellerLink.click();
      URL.revokeObjectURL(sellerUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to generate PDF:', errorMessage.replace(/[\r\n]/g, ' '));
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack.replace(/[\r\n]/g, ' | '));
      }
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

  const getButtonText = () => {
    if (isGenerating) return t('generating');
    return t('exportPDFs');
  };

  return (
    <>
      <Tooltip text={t('tooltipExport')}>
        <button
          onClick={handleExport}
          disabled={isGenerating || !canExport}
          className="min-w-[80px] max-w-[100px] bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black font-semibold py-2 px-2 rounded-lg transition-all text-[9px] sm:text-[10px] shadow-md shimmer-button disabled:opacity-50"
          aria-label={t('exportPDFs')}
        >
          <span className="block truncate">📄 {getButtonText()}</span>
        </button>
      </Tooltip>
      
      {canShare && (
        <button
          onClick={handleShare}
          disabled={isGenerating || !canExport}
          className="min-w-[80px] max-w-[100px] bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black font-semibold py-2 px-2 rounded-lg transition-all text-[9px] sm:text-[10px] shadow-md shimmer-button disabled:opacity-50"
          aria-label="Share proposal"
        >
          <span className="block truncate">📤 {t('share')}</span>
        </button>
      )}
    </>
  );
}
