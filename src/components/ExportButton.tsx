'use client';

import { useState } from 'react';
import type { SolarLead, Language } from '@/types/solar';
import { getTranslation } from '@/lib/translations';

interface ExportButtonProps {
  data: SolarLead;
}

export function ExportButton({ data }: ExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);

  useState(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  });

  const canExport = data.clientName.trim() && data.address.trim() && data.companyPhone.trim() && data.companyName.trim() && data.productDescription.trim() && data.salesRep?.trim() && data.proposalConditions?.trim();

  const sanitizeFilename = (name: string) => {
    const sanitized = name
      .replace(/[^a-zA-Z0-9-_\s]/g, '')
      .replace(/\.\./g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 100);
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

  const generateClientPDF = async (returnBlob = false) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
    
    // Company header at top left
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Company: ${data.companyName}`, 20, 15);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    let headerY = 21;
    if (data.salesRep) { doc.text(`Sales Representative: ${data.salesRep}`, 20, headerY); headerY += 5; }
    doc.text(`Phone: ${data.companyPhone}`, 20, headerY); headerY += 5;
    if (data.companyEmail) { doc.text(`Email: ${data.companyEmail}`, 20, headerY); headerY += 5; }
    
    // Add logo if available (top right)
    if (data.companyLogo) {
      try {
        const img = new Image();
        img.src = data.companyLogo;
        const aspectRatio = img.width / img.height;
        const maxHeight = 20;
        const maxWidth = 40;
        let logoHeight = maxHeight;
        let logoWidth = logoHeight * aspectRatio;
        if (logoWidth > maxWidth) {
          logoWidth = maxWidth;
          logoHeight = logoWidth / aspectRatio;
        }
        doc.addImage(data.companyLogo, 'PNG', 190 - logoWidth, 10, logoWidth, logoHeight, undefined, 'NONE', 0);
      } catch {
        // Logo failed to load, continue without it
      }
    }
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${t('proposal')} - ${formatDate(data.date, lang)} by ${data.companyName}`, 20, 45);
    
    let y = 55;
    
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
    
    if (data.financingOption === 'Loan' && data.loanTerm) {
      const loanAmount = Math.max(0, netCost - (data.downPayment || 0));
      const monthlyRate = 0.0699 / 12;
      const numPayments = data.loanTerm * 12;
      const monthlyPayment = loanAmount > 0 ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1) : 0;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      if (data.downPayment && data.downPayment > 0) {
        doc.text(`  Down Payment: ${getCurrencySymbol()}${formatNumber(data.downPayment)}`, 20, y);
        y += 6;
      }
      doc.text(`  Financed Amount: ${getCurrencySymbol()}${formatNumber(loanAmount)}`, 20, y);
      y += 6;
      doc.text(`  Loan Term: ${data.loanTerm} years @ 6.99% APR`, 20, y);
      y += 6;
      doc.text(`  Monthly Payment: ${getCurrencySymbol()}${formatNumber(monthlyPayment)}`, 20, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
    }
    
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
    y += 15;
    
    const annualProduction = data.systemSizeKw * data.sunHoursPerDay * 365 * 0.8;
    const co2SavedLbs = Math.round(annualProduction * 0.85 * 25);
    const treesEquivalent = Math.round(co2SavedLbs / 48);
    
    doc.setFontSize(12);
    doc.setTextColor(34, 139, 34);
    doc.text('Environmental Impact (25 Years)', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`CO2 Offset: ${co2SavedLbs.toLocaleString('en-US').replace(/,/g, ' ')} lbs`, 20, y);
    y += 6;
    doc.text(`Trees Planted Equivalent: ${treesEquivalent.toLocaleString('en-US').replace(/,/g, ' ')} trees`, 20, y);
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
    
      if (returnBlob) {
        return doc.output('blob');
      }
      doc.save(`${sanitizeFilename(data.clientName)}-${formatDateForFilename(data.date, lang)}-CLIENT-Proposal.pdf`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to generate client PDF:', errorMessage.replace(/[\r\n]/g, ' '));
      throw error;
    }
  };

  const generateSellerPDF = async (returnBlob = false) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
    
    // Company header at top left
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Company: ${data.companyName}`, 20, 15);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    let headerY = 21;
    if (data.salesRep) { doc.text(`Sales Representative: ${data.salesRep}`, 20, headerY); headerY += 5; }
    doc.text(`Phone: ${data.companyPhone}`, 20, headerY); headerY += 5;
    if (data.companyEmail) { doc.text(`Email: ${data.companyEmail}`, 20, headerY); headerY += 5; }
    
    // Add logo if available (top right)
    if (data.companyLogo) {
      try {
        const img = new Image();
        img.src = data.companyLogo;
        const aspectRatio = img.width / img.height;
        const maxHeight = 20;
        const maxWidth = 40;
        let logoHeight = maxHeight;
        let logoWidth = logoHeight * aspectRatio;
        if (logoWidth > maxWidth) {
          logoWidth = maxWidth;
          logoHeight = logoWidth / aspectRatio;
        }
        doc.addImage(data.companyLogo, 'PNG', 190 - logoWidth, 10, logoWidth, logoHeight, undefined, 'NONE', 0);
      } catch {
        // Logo failed to load, continue without it
      }
    }
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`INTERNAL SALES SHEET - ${formatDate(data.date, lang)}`, 20, 45);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Lead ID: ${data.id.slice(0, 8)}`, 20, 51);
    
    const startY = 60;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT INFORMATION', 20, startY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let y = startY + 8;
    doc.text(`Client Name: ${data.clientName}`, 20, y);
    y += 6;
    doc.text(`Address: ${data.address}`, 20, y);
    if (data.phone) { y += 6; doc.text(`Phone: ${data.phone}`, 20, y); }
    if (data.email) { y += 6; doc.text(`Email: ${data.email}`, 20, y); }
    
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
    if (data.financingOption) { 
      doc.text(`Financing: ${t(data.financingOption.toLowerCase() as any) || data.financingOption}`, 20, y); y += 6;
      if (data.financingOption === 'Loan' && data.loanTerm) {
        if (data.downPayment && data.downPayment > 0) {
          doc.text(`  Down Payment: ${getCurrencySymbol()}${formatNumber(data.downPayment)}`, 20, y); y += 6;
        }
        doc.text(`  Loan Term: ${data.loanTerm} years`, 20, y); y += 6;
      }
    }
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
    
      if (returnBlob) {
        return doc.output('blob');
      }
      doc.save(`${sanitizeFilename(data.clientName)}-${formatDateForFilename(data.date, lang)}-SELLER-Internal.pdf`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to generate seller PDF:', errorMessage.replace(/[\r\n]/g, ' '));
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
      const clientBlob = await generateClientPDF(true) as Blob;
      const clientFile = new File(
        [clientBlob],
        `${sanitizeFilename(data.clientName)}-Proposal.pdf`,
        { type: 'application/pdf' }
      );
      
      await navigator.share({
        title: `Solar Proposal - ${data.clientName}`,
        text: `Solar proposal for ${data.clientName} - ${formatCurrency(data.twentyFiveYearSavings, data.currency)} in 25-year savings`,
        files: [clientFile]
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to share PDF:', errorMessage.replace(/[\r\n]/g, ' '));
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
