'use client';

import { useState } from 'react';
import type { SolarLead, Language } from '@/types/solar';
import { getTranslation } from '@/lib/translations';

interface ExportButtonProps {
  data: SolarLead;
}

export function ExportButton({ data }: ExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);

  const canExport = data.clientName.trim() && data.address.trim();

  const sanitizeFilename = (name: string) => {
    const sanitized = name.replace(/[^a-zA-Z0-9-_\s]/g, '').trim().replace(/\s+/g, '-');
    return sanitized || 'proposal';
  };

  const generateClientPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(24);
    doc.setTextColor(255, 193, 7);
    doc.text(data.companyName || 'SOLAR PROPOSAL', 20, 30);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    let headerY = 40;
    if (data.companyEmail) { doc.text(data.companyEmail, 20, headerY); headerY += 5; }
    if (data.companyPhone) { doc.text(data.companyPhone, 20, headerY); headerY += 5; }
    if (data.companyWebsite) { doc.text(data.companyWebsite, 20, headerY); headerY += 5; }
    
    doc.setFontSize(10);
    doc.text(`${t('date')}: ${data.date}`, 20, headerY + 5);
    
    const startY = headerY + 15;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(t('clientName'), 20, startY);
    
    doc.setFontSize(12);
    let y = startY + 15;
    doc.text(`${t('clientName')}: ${data.clientName}`, 20, y);
    y += 10;
    doc.text(`${t('address')}: ${data.address}`, 20, y);
    if (data.phone) { y += 10; doc.text(`${t('phone')}: ${data.phone}`, 20, y); }
    if (data.email) { y += 10; doc.text(`${t('email')}: ${data.email}`, 20, y); }
    
    y += 20;
    doc.setFillColor(255, 248, 220);
    doc.rect(20, y, 170, 30, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255, 193, 7);
    doc.text(`$${data.twentyFiveYearSavings.toLocaleString()}`, 105, y + 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(t('twentyFiveYearSavings'), 105, y + 22, { align: 'center' });
    
    y += 45;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(t('systemSize'), 20, y);
    
    y += 15;
    doc.setFontSize(12);
    doc.text(`${t('systemSize')}: ${data.systemSizeKw} kW`, 20, y);
    y += 10;
    doc.text(`${t('systemCost')}: $${data.systemCost.toLocaleString()}`, 20, y);
    y += 10;
    doc.text(`${t('taxCredit')}: ${data.federalTaxCredit}%`, 20, y);
    y += 10;
    doc.text(`${t('stateIncentive')}: $${data.stateIncentive.toLocaleString()}`, 20, y);
    y += 10;
    doc.text(`${t('currentMonthlyBill')}: $${data.currentMonthlyBill}`, 20, y);
    y += 10;
    doc.text(`${t('electricityRate')}: $${data.electricityRate}/kWh`, 20, y);
    y += 10;
    doc.text(`${t('breakEvenYear')}: Year ${data.breakEvenYear}`, 20, y);
    if (data.financingOption) { y += 10; doc.text(`${t('financingOption')}: ${data.financingOption}`, 20, y); }
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleDateString()} | SolarClose`, 105, 280, { align: 'center' });
    
    doc.save(`${sanitizeFilename(data.clientName)}-CLIENT-Proposal.pdf`);
  };

  const generateSellerPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(255, 193, 7);
    doc.text('INTERNAL SALES SHEET', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${t('date')}: ${data.date} | Lead ID: ${data.id.slice(0, 8)}`, 20, 30);
    
    let y = 45;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(t('clientName'), 20, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.text(`${t('clientName')}: ${data.clientName}`, 20, y);
    y += 7;
    doc.text(`${t('address')}: ${data.address}`, 20, y);
    if (data.phone) { y += 7; doc.text(`${t('phone')}: ${data.phone}`, 20, y); }
    if (data.email) { y += 7; doc.text(`${t('email')}: ${data.email}`, 20, y); }
    
    y += 12;
    doc.setFontSize(14);
    doc.text(t('salesRep'), 20, y);
    y += 10;
    doc.setFontSize(10);
    if (data.salesRep) { doc.text(`${t('salesRep')}: ${data.salesRep}`, 20, y); y += 7; }
    if (data.leadStatus) { doc.text(`${t('leadStatus')}: ${data.leadStatus}`, 20, y); y += 7; }
    
    y += 5;
    doc.setFontSize(14);
    doc.text(t('propertyType'), 20, y);
    y += 10;
    doc.setFontSize(10);
    if (data.propertyType) { doc.text(`${t('propertyType')}: ${data.propertyType}`, 20, y); y += 7; }
    if (data.roofType) { doc.text(`${t('roofType')}: ${data.roofType}`, 20, y); y += 7; }
    if (data.roofCondition) { doc.text(`${t('roofCondition')}: ${data.roofCondition}`, 20, y); y += 7; }
    
    y += 5;
    doc.setFontSize(14);
    doc.text(t('systemSize'), 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`${t('systemSize')}: ${data.systemSizeKw} kW`, 20, y); y += 7;
    doc.text(`${t('systemCost')}: $${data.systemCost.toLocaleString()}`, 20, y); y += 7;
    doc.text(`${t('currentMonthlyBill')}: $${data.currentMonthlyBill}`, 20, y); y += 7;
    doc.text(`${t('twentyFiveYearSavings')}: $${data.twentyFiveYearSavings.toLocaleString()}`, 20, y); y += 7;
    doc.text(`${t('breakEvenYear')}: Year ${data.breakEvenYear}`, 20, y); y += 7;
    if (data.financingOption) { doc.text(`${t('financingOption')}: ${data.financingOption}`, 20, y); y += 7; }
    if (data.utilityProvider) { doc.text(`${t('utilityProvider')}: ${data.utilityProvider}`, 20, y); y += 7; }
    if (data.avgKwhPerMonth) { doc.text(`${t('avgKwhPerMonth')}: ${data.avgKwhPerMonth}`, 20, y); y += 7; }
    
    if (data.notes && y < 250) {
      y += 5;
      doc.setFontSize(14);
      doc.text(t('notes'), 20, y);
      y += 10;
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(data.notes, 170);
      const maxLines = Math.floor((260 - y) / 5);
      doc.text(lines.slice(0, maxLines), 20, y);
    }
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('CONFIDENTIAL - Internal Use Only', 105, 280, { align: 'center' });
    
    doc.save(`${sanitizeFilename(data.clientName)}-SELLER-Internal.pdf`);
  };

  const handleExport = async () => {
    if (!canExport) return;
    
    try {
      setIsGenerating(true);
      await generateClientPDF();
      await generateSellerPDF();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonText = () => {
    if (isGenerating) return t('generating');
    if (!canExport) return `📄 ${t('exportPDFs')} (${t('enterClientInfo')})`;
    return `📄 ${t('exportPDFs')}`;
  };

  return (
    <button
      onClick={handleExport}
      disabled={isGenerating || !canExport}
      className="w-full bg-primary text-primary-foreground font-semibold py-4 sm:py-3 px-4 sm:px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-base sm:text-sm"
      aria-label={isGenerating ? t('generating') : !canExport ? `${t('exportPDFs')} - ${t('enterClientInfo')}` : t('exportPDFs')}
      title={!canExport ? t('enterClientInfo') : ''}
    >
      {getButtonText()}
    </button>
  );
}
