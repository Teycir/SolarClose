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
    
    let headerY = 30;
    if (data.companyLogo) {
      doc.addImage(data.companyLogo, 'PNG', 20, 15, 40, 20);
      headerY = 40;
    }
    
    doc.setFontSize(24);
    doc.setTextColor(255, 193, 7);
    doc.text(data.companyName || 'SOLAR PROPOSAL', data.companyLogo ? 70 : 20, headerY);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    headerY += 10;
    if (data.companyEmail) { doc.text(data.companyEmail, data.companyLogo ? 70 : 20, headerY); headerY += 5; }
    if (data.companyPhone) { doc.text(data.companyPhone, data.companyLogo ? 70 : 20, headerY); headerY += 5; }
    
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
    doc.text(`${t('breakEvenYear')}: ${t('year')} ${data.breakEvenYear}`, 20, y);
    if (data.financingOption) { y += 10; doc.text(`${t('financingOption')}: ${t(data.financingOption.toLowerCase() as any) || data.financingOption}`, 20, y); }
    
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
    if (data.leadStatus) { doc.text(`${t('leadStatus')}: ${t(data.leadStatus.toLowerCase().replace(/\s+/g, '') as any) || data.leadStatus}`, 20, y); y += 7; }
    
    y += 5;
    doc.setFontSize(14);
    doc.text(t('propertyType'), 20, y);
    y += 10;
    doc.setFontSize(10);
    if (data.propertyType) { doc.text(`${t('propertyType')}: ${t(data.propertyType.toLowerCase() as any) || data.propertyType}`, 20, y); y += 7; }
    if (data.roofType) { doc.text(`${t('roofType')}: ${t(data.roofType.toLowerCase().replace(/\s+/g, '') as any) || data.roofType}`, 20, y); y += 7; }
    if (data.roofCondition) { doc.text(`${t('roofCondition')}: ${t(data.roofCondition.toLowerCase().replace(/\s+/g, '') as any) || data.roofCondition}`, 20, y); y += 7; }
    
    y += 5;
    doc.setFontSize(14);
    doc.text(t('systemSize'), 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`${t('systemSize')}: ${data.systemSizeKw} kW`, 20, y); y += 7;
    doc.text(`${t('systemCost')}: $${data.systemCost.toLocaleString()}`, 20, y); y += 7;
    doc.text(`${t('currentMonthlyBill')}: $${data.currentMonthlyBill}`, 20, y); y += 7;
    doc.text(`${t('twentyFiveYearSavings')}: $${data.twentyFiveYearSavings.toLocaleString()}`, 20, y); y += 7;
    doc.text(`${t('breakEvenYear')}: ${t('year')} ${data.breakEvenYear}`, 20, y); y += 7;
    if (data.financingOption) { doc.text(`${t('financingOption')}: ${t(data.financingOption.toLowerCase() as any) || data.financingOption}`, 20, y); y += 7; }
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
    return t('exportPDFs');
  };

  return (
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
  );
}
