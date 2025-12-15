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

  const canExport = data.clientName.trim() && data.address.trim() && data.companyPhone.trim() && data.companyName.trim() && data.productDescription.trim() && data.salesRep?.trim() && data.proposalConditions?.trim();

  const sanitizeFilename = (name: string) => {
    const sanitized = name.replace(/[^a-zA-Z0-9-_\s]/g, '').trim().replace(/\s+/g, '-').substring(0, 100);
    return sanitized || 'proposal';
  };

  const formatDate = (dateStr: string, lang: Language) => {
    const date = new Date(dateStr + 'T00:00:00');
    if (lang === 'en') return date.toLocaleDateString('en-US');
    return date.toLocaleDateString('fr-FR');
  };

  const formatDateForFilename = (dateStr: string, lang: Language) => {
    const date = new Date(dateStr + 'T00:00:00');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    if (lang === 'en') return `${month}-${day}-${year}`;
    return `${day}-${month}-${year}`;
  };

  const formatNumber = (num: number) => Math.round(num).toLocaleString('en-US').replace(/,/g, ' ');

  const getCurrencySymbol = () => data.currency === 'USD' ? '$' : '€';

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
    doc.text(`${t('proposal')} - ${formatDate(data.date, lang)}`, 20, 45);
    
    const startY = 55;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(t('clientName'), 20, startY);
    
    doc.setFontSize(11);
    let y = startY + 10;
    doc.text(data.clientName, 20, y);
    y += 7;
    doc.text(data.address, 20, y);
    if (data.phone) { y += 7; doc.text(data.phone, 20, y); }
    if (data.email) { y += 7; doc.text(data.email, 20, y); }
    
    y += 15;
    doc.setFillColor(255, 248, 220);
    doc.rect(20, y, 170, 20, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 193, 7);
    doc.text(`${getCurrencySymbol()}${formatNumber(data.twentyFiveYearSavings)}`, 105, y + 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(t('twentyFiveYearSavings'), 105, y + 16, { align: 'center' });
    
    y += 30;
    
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
    doc.text(`Total System Cost: ${getCurrencySymbol()}${formatNumber(data.systemCost)}`, 20, y);
    y += 7;
    
    const federalCredit = data.systemCost * (data.federalTaxCredit / 100);
    const netCost = data.systemCost - federalCredit - data.stateIncentive;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`  - Federal Tax Credit (${data.federalTaxCredit}%): -${getCurrencySymbol()}${formatNumber(federalCredit)}`, 20, y);
    y += 6;
    if (data.stateIncentive > 0) {
      doc.text(`  - State Incentive: -${getCurrencySymbol()}${formatNumber(data.stateIncentive)}`, 20, y);
      y += 6;
    }
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Net Investment: ${getCurrencySymbol()}${formatNumber(netCost)}`, 20, y);
    y += 10;
    
    const avgAnnualSavings = Math.round(data.twentyFiveYearSavings / 25);
    const avgMonthlySavings = Math.round(avgAnnualSavings / 12);
    
    doc.text(`Break-Even Period: ${t('year')} ${data.breakEvenYear}`, 20, y);
    y += 8;
    doc.text(`Average Monthly Savings: ${getCurrencySymbol()}${formatNumber(avgMonthlySavings)}`, 20, y);
    y += 8;
    doc.text(`Average Annual Savings: ${getCurrencySymbol()}${formatNumber(avgAnnualSavings)}`, 20, y);
    y += 8;
    doc.setTextColor(255, 193, 7);
    doc.text(`Total 25-Year Savings: ${getCurrencySymbol()}${formatNumber(data.twentyFiveYearSavings)}`, 20, y);
    doc.setTextColor(0, 0, 0);
    y += 10;
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`* Savings calculated with ${data.yearlyInflationRate}% annual utility rate increase`, 20, y);
    doc.setTextColor(0, 0, 0);
    y += 8;
    
    if (data.proposalConditions && y < 245) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const conditionLines = doc.splitTextToSize(data.proposalConditions, 170);
      const maxLines = Math.floor((245 - y) / 4.5);
      doc.text(conditionLines.slice(0, maxLines), 20, y);
    }
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, 270, 190, 270);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(data.companyName, 105, 276, { align: 'center' });
    doc.text(`Generated on ${formatDate(new Date().toISOString().split('T')[0], lang)} | SolarClose`, 105, 281, { align: 'center' });
    
      doc.save(`${sanitizeFilename(data.clientName)}-${formatDateForFilename(data.date, lang)}-CLIENT-Proposal.pdf`);
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
    doc.text(data.companyName, 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`INTERNAL SALES SHEET - ${formatDate(data.date, lang)}`, 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Lead ID: ${data.id.slice(0, 8)}`, 20, 38);
    
    let y = 50;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(t('clientName'), 20, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.text(data.clientName, 20, y);
    y += 6;
    doc.text(data.address, 20, y);
    if (data.phone) { y += 6; doc.text(data.phone, 20, y); }
    if (data.email) { y += 6; doc.text(data.email, 20, y); }
    
    y += 10;
    doc.setFontSize(14);
    doc.text('Sales Information', 20, y);
    y += 10;
    doc.setFontSize(10);
    if (data.salesRep) { doc.text(`Sales Rep: ${data.salesRep}`, 20, y); y += 6; }
    if (data.leadStatus) { doc.text(`Lead Status: ${t(data.leadStatus.toLowerCase().replace(/\s+/g, '') as any) || data.leadStatus}`, 20, y); y += 6; }
    
    y += 5;
    doc.setFontSize(14);
    doc.text('Property Details', 20, y);
    y += 10;
    doc.setFontSize(10);
    if (data.propertyType) { doc.text(`Property Type: ${t(data.propertyType.toLowerCase() as any) || data.propertyType}`, 20, y); y += 6; }
    if (data.roofType) { doc.text(`Roof Type: ${t(data.roofType.toLowerCase().replace(/\s+/g, '') as any) || data.roofType}`, 20, y); y += 6; }
    if (data.roofCondition) { doc.text(`Roof Condition: ${t(data.roofCondition.toLowerCase().replace(/\s+/g, '') as any) || data.roofCondition}`, 20, y); y += 6; }
    
    y += 5;
    doc.setFontSize(14);
    doc.text('System Details', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`System Size: ${data.systemSizeKw} kW`, 20, y); y += 6;
    doc.text(`System Cost: ${getCurrencySymbol()}${formatNumber(data.systemCost)}`, 20, y); y += 6;
    doc.text(`Current Monthly Bill: ${getCurrencySymbol()}${data.currentMonthlyBill}`, 20, y); y += 6;
    doc.text(`25-Year Savings: ${getCurrencySymbol()}${formatNumber(data.twentyFiveYearSavings)}`, 20, y); y += 6;
    doc.text(`Break-Even Year: Year ${data.breakEvenYear}`, 20, y); y += 6;
    if (data.financingOption) { doc.text(`Financing: ${t(data.financingOption.toLowerCase() as any) || data.financingOption}`, 20, y); y += 6; }
    if (data.utilityProvider) { doc.text(`Utility Provider: ${data.utilityProvider}`, 20, y); y += 6; }
    if (data.avgKwhPerMonth) { doc.text(`Avg kWh/Month: ${data.avgKwhPerMonth}`, 20, y); y += 6; }
    
    if (data.productDescription && y < 210) {
      y += 5;
      doc.setFontSize(14);
      doc.text('Product Description', 20, y);
      y += 8;
      doc.setFontSize(9);
      const descLines = doc.splitTextToSize(data.productDescription, 170);
      const maxDescLines = Math.floor((235 - y) / 4.5);
      doc.text(descLines.slice(0, maxDescLines), 20, y);
      y += (Math.min(descLines.length, maxDescLines) * 4.5) + 5;
    }
    
    if (data.notes && y < 235) {
      y += 5;
      doc.setFontSize(14);
      doc.text('Notes', 20, y);
      y += 8;
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(data.notes, 170);
      const maxLines = Math.floor((260 - y) / 4.5);
      doc.text(lines.slice(0, maxLines), 20, y);
    }
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, 270, 190, 270);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('CONFIDENTIAL - Internal Use Only', 105, 276, { align: 'center' });
    doc.text(data.companyName, 105, 281, { align: 'center' });
    
      doc.save(`${sanitizeFilename(data.clientName)}-${formatDateForFilename(data.date, lang)}-SELLER-Internal.pdf`);
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
      const sanitizedError = error instanceof Error ? error.message : String(error);
      console.error('Failed to generate PDF:', sanitizedError);
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
