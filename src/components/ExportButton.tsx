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

  const canExport = data.clientName.trim() && data.address.trim() && data.companyPhone.trim() && (data.salesRep?.trim() || data.companyName.trim()) && data.productDescription.trim();

  const sanitizeFilename = (name: string) => {
    const sanitized = name.replace(/[^a-zA-Z0-9-_\s]/g, '').trim().replace(/\s+/g, '-').substring(0, 100);
    return sanitized || 'proposal';
  };

  const formatDate = (dateStr: string, lang: Language) => {
    const date = new Date(dateStr + 'T00:00:00');
    if (lang === 'en') return date.toLocaleDateString('en-US');
    return date.toLocaleDateString('fr-FR');
  };

  const formatNumber = (num: number) => Math.round(num).toLocaleString('en-US').replace(/,/g, ' ');

  const generateClientPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(255, 193, 7);
    doc.text(data.companyName, 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let headerY = 28;
    if (data.salesRep) { doc.text(data.salesRep, 20, headerY); headerY += 5; }
    doc.text(data.companyPhone, 20, headerY); headerY += 5;
    if (data.companyEmail) { doc.text(data.companyEmail, 20, headerY); headerY += 5; }
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(t('proposal'), 20, 45);
    
    doc.setFontSize(10);
    doc.text(`${t('date')}: ${formatDate(data.date, lang)}`, 20, headerY + 3);
    
    const startY = headerY + 11;
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
    doc.text(`$${formatNumber(data.twentyFiveYearSavings)}`, 105, y + 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(t('twentyFiveYearSavings'), 105, y + 22, { align: 'center' });
    
    y += 45;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Product Description', 20, y);
    y += 10;
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(data.productDescription, 170);
    doc.text(descLines, 20, y);
    y += (descLines.length * 5) + 10;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('System Details', 20, y);
    y += 10;
    
    doc.setFontSize(11);
    doc.text(`System Size: ${data.systemSizeKw} kW`, 20, y);
    y += 8;
    doc.text(`Estimated Annual Production: ${Math.round(data.systemSizeKw * data.sunHoursPerDay * 365 * 0.8).toLocaleString('en-US').replace(/,/g, ' ')} kWh`, 20, y);
    y += 15;
    
    doc.setFontSize(14);
    doc.text('Investment & Returns', 20, y);
    y += 10;
    
    doc.setFontSize(11);
    doc.text(`Total Investment: $${formatNumber(data.systemCost)}`, 20, y);
    y += 8;
    doc.text(`Break-Even Period: ${t('year')} ${data.breakEvenYear}`, 20, y);
    y += 8;
    doc.text(`25-Year Savings: $${formatNumber(data.twentyFiveYearSavings)}`, 20, y);
    
    y += 15;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const terms = [
      'This proposal is valid for 30 days.',
      'Final pricing subject to site inspection.',
      'Installation timeline: 4-8 weeks after approval.'
    ];
    doc.text(terms, 20, y);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(data.companyName, 105, 275, { align: 'center' });
    doc.text(`Generated on ${formatDate(new Date().toISOString().split('T')[0], lang)} | SolarClose`, 105, 280, { align: 'center' });
    
      doc.save(`${sanitizeFilename(data.clientName)}-CLIENT-Proposal.pdf`);
    } catch (error) {
      console.error('Failed to generate client PDF:', error);
      throw error;
    }
  };

  const generateSellerPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(255, 193, 7);
    doc.text('INTERNAL SALES SHEET', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${t('date')}: ${formatDate(data.date, lang)} | Lead ID: ${data.id.slice(0, 8)}`, 20, 30);
    
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
    doc.text(`${t('systemCost')}: $${formatNumber(data.systemCost)}`, 20, y); y += 7;
    doc.text(`${t('currentMonthlyBill')}: $${data.currentMonthlyBill}`, 20, y); y += 7;
    doc.text(`${t('twentyFiveYearSavings')}: $${formatNumber(data.twentyFiveYearSavings)}`, 20, y); y += 7;
    doc.text(`${t('breakEvenYear')}: ${t('year')} ${data.breakEvenYear}`, 20, y); y += 7;
    if (data.financingOption) { doc.text(`${t('financingOption')}: ${t(data.financingOption.toLowerCase() as any) || data.financingOption}`, 20, y); y += 7; }
    if (data.utilityProvider) { doc.text(`${t('utilityProvider')}: ${data.utilityProvider}`, 20, y); y += 7; }
    if (data.avgKwhPerMonth) { doc.text(`${t('avgKwhPerMonth')}: ${data.avgKwhPerMonth}`, 20, y); y += 7; }
    
    if (data.productDescription && y < 220) {
      y += 5;
      doc.setFontSize(14);
      doc.text('Product Description', 20, y);
      y += 10;
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(data.productDescription, 170);
      const maxDescLines = Math.floor((250 - y) / 5);
      doc.text(descLines.slice(0, maxDescLines), 20, y);
      y += (Math.min(descLines.length, maxDescLines) * 5) + 5;
    }
    
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
    } catch (error) {
      console.error('Failed to generate seller PDF:', error);
      throw error;
    }
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
