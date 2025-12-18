import type { SolarLead, Language } from '@/types/solar';
import { getTranslation, type TranslationKey } from '@/lib/translations';
import { getCurrencySymbol } from '@/lib/currency';

const formatDate = (dateStr: string, lang: Language) => {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    return lang === 'en' ? date.toLocaleDateString('en-US') : date.toLocaleDateString('fr-FR');
  } catch (error) {
    console.error('Error formatting date:', error instanceof Error ? error.message : 'Unknown error');
    return dateStr;
  }
};

const formatDateForFilename = (dateStr: string, lang: Language) => {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) {
      return dateStr.replace(/[^0-9-]/g, '');
    }
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return lang === 'en' ? `${month}-${day}-${year}` : `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date for filename:', error instanceof Error ? error.message : 'Unknown error');
    return dateStr.replace(/[^0-9-]/g, '');
  }
};

const formatNumber = (num: number) => Math.round(num).toLocaleString('en-US').replace(/,/g, ' ');

import jsPDF from 'jspdf';

const addCompanyHeader = async (doc: jsPDF, data: SolarLead, lang: Language, t: (key: string) => string) => {
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`${t('pdfCompany')} ${data.companyName}`, 20, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  let headerY = 21;
  if (data.salesRep) { doc.text(`${t('pdfSalesRepresentative')} ${data.salesRep}`, 20, headerY); headerY += 5; }
  if (data.companyEmail) { doc.text(`${t('email')}: ${data.companyEmail}`, 20, headerY); headerY += 5; }
  doc.text(`${t('pdfPhone')} ${data.companyPhone}`, 20, headerY);

  if (data.companyLogo) {
    try {
      const img = new Image();
      img.src = data.companyLogo;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(reject, 5000);
      });
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
    } catch (error) {
      console.error('Failed to load company logo:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
};

export async function generateClientPDF(data: SolarLead): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);

  await addCompanyHeader(doc, data, lang, t);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  const formattedDate = formatDate(data.date, lang);
  const proposalTitle = `${t('proposal')} - ${formattedDate}`;
  const titleLines = doc.splitTextToSize(proposalTitle, 170);
  doc.text(titleLines, 20, 50);

  let y = 55;

  doc.setFontSize(14);
  doc.text(t('productDescription'), 20, y);
  y += 10;
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(data.productDescription, 170);
  doc.text(descLines, 20, y);
  y += (descLines.length * 5) + 10;

  doc.setFontSize(14);
  doc.text(t('pdfSystemDetails'), 20, y);
  y += 10;
  doc.setFontSize(11);
  doc.text(`${t('systemSize')}: ${data.systemSizeKw} kW`, 20, y);
  y += 8;
  const DAYS_PER_YEAR = 365;
  const PERFORMANCE_RATIO = 0.8;
  const estimatedProduction = Math.round(data.systemSizeKw * data.sunHoursPerDay * DAYS_PER_YEAR * PERFORMANCE_RATIO);
  doc.text(`${t('pdfEstimatedProduction')}: ${estimatedProduction.toLocaleString('en-US').replace(/,/g, ' ')} kWh`, 20, y);
  y += 15;

  doc.setFontSize(14);
  doc.text(t('pdfInvestmentReturns'), 20, y);
  y += 10;
  doc.setFontSize(11);
  doc.text(`${t('pdfTotalSystemCost')}: ${getCurrencySymbol(data.currency)}${formatNumber(data.systemCost)}`, 20, y);
  y += 7;

  const federalCredit = data.systemCost * (data.federalTaxCredit / 100);
  const netCost = data.systemCost - federalCredit - data.stateIncentive;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`  - ${t('pdfFederalTaxCredit')} (${data.federalTaxCredit}%): -${getCurrencySymbol(data.currency)}${formatNumber(federalCredit)}`, 20, y);
  y += 6;
  if (data.stateIncentive > 0) {
    doc.text(`  - ${t('pdfStateIncentive')}: -${getCurrencySymbol(data.currency)}${formatNumber(data.stateIncentive)}`, 20, y);
    y += 6;
  }
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`${t('pdfNetInvestment')}: ${getCurrencySymbol(data.currency)}${formatNumber(netCost)}`, 20, y);
  y += 10;

  if (data.financingOption === 'Loan' && data.loanTerm) {
    const loanAmount = Math.max(0, netCost - (data.downPayment || 0));
    const interestRate = (data.loanInterestRate || 6.99) / 100;
    const monthlyRate = interestRate / 12;
    const numPayments = data.loanTerm * 12;
    let monthlyPayment = 0;
    if (loanAmount > 0) {
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / numPayments;
      } else {
        monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      }
    }

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    if (data.downPayment && data.downPayment > 0) {
      doc.text(`  ${t('pdfDownPayment')}: ${getCurrencySymbol(data.currency)}${formatNumber(data.downPayment)}`, 20, y);
      y += 6;
    }
    doc.text(`  ${t('pdfFinancedAmount')}: ${getCurrencySymbol(data.currency)}${formatNumber(loanAmount)}`, 20, y);
    y += 6;
    doc.text(`  ${t('pdfLoanTerm')}: ${data.loanTerm} ${t('pdfYears')} @ ${data.loanInterestRate || 6.99}% APR`, 20, y);
    y += 6;
    doc.text(`  ${t('pdfMonthlyPayment')}: ${getCurrencySymbol(data.currency)}${formatNumber(monthlyPayment)}`, 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
  }

  const avgAnnualSavings = Math.round(data.twentyFiveYearSavings / 25);
  const avgMonthlySavings = Math.round(avgAnnualSavings / 12);

  doc.text(`${t('pdfBreakEvenPeriod')}: ${data.breakEvenYear ? `${t('year')} ${data.breakEvenYear}` : t('never')}`, 20, y);
  y += 8;
  doc.text(`${t('pdfAvgMonthlySavings')}: ${getCurrencySymbol(data.currency)}${formatNumber(avgMonthlySavings)}`, 20, y);
  y += 8;
  doc.text(`${t('pdfAvgAnnualSavings')}: ${getCurrencySymbol(data.currency)}${formatNumber(avgAnnualSavings)}`, 20, y);
  y += 8;
  doc.setTextColor(255, 193, 7);
  doc.text(`${t('pdfTotal25YearSavings')}: ${getCurrencySymbol(data.currency)}${formatNumber(data.twentyFiveYearSavings)}`, 20, y);
  doc.setTextColor(0, 0, 0);
  y += 15;

  const YEARS = 25;
  const CO2_PER_KWH = 0.85;
  const annualProduction = data.systemSizeKw * data.sunHoursPerDay * DAYS_PER_YEAR * PERFORMANCE_RATIO;
  const co2SavedLbs = Math.round(annualProduction * CO2_PER_KWH * YEARS);
  const isMetric = lang !== 'en';
  const co2Saved = isMetric ? Math.round(co2SavedLbs * 0.453592) : co2SavedLbs;
  const co2Unit = isMetric ? 'kg' : 'lbs';
  const treesEquivalent = Math.round(co2SavedLbs / 48);

  doc.setFontSize(12);
  doc.setTextColor(34, 139, 34);
  doc.text(t('envImpactTitle'), 20, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`${t('envCo2Offset')}: ${co2Saved.toLocaleString('en-US').replace(/,/g, ' ')} ${co2Unit}`, 20, y);
  y += 6;
  doc.text(`${t('envTreesPlanted')} ${t('envEquivalent')}: ${treesEquivalent.toLocaleString('en-US').replace(/,/g, ' ')} ${t('pdfTrees')}`, 20, y);
  y += 10;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const savingsNote = `* ${t('pdfSavingsCalculated')} ${data.yearlyInflationRate}% ${lang === 'en' ? 'annual utility rate increase' : lang === 'es' ? 'aumento anual de tarifas' : lang === 'it' ? 'aumento annuale delle tariffe' : lang === 'fr' ? 'augmentation annuelle des tarifs' : 'jährliche Tariferhöhung'}`;
  doc.text(savingsNote, 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;

  const FOOTER_START = 270;
  const MIN_SPACE_FOR_SIGNATURE = 30;
  const MIN_SPACE_FOR_CONDITIONS = 10;

  if (data.proposalConditions && y < (FOOTER_START - MIN_SPACE_FOR_CONDITIONS)) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const conditionLines = doc.splitTextToSize(data.proposalConditions, 170);
    const availableSpace = FOOTER_START - MIN_SPACE_FOR_SIGNATURE - y;
    const maxLines = Math.floor(availableSpace / 4.5);
    if (maxLines > 0) {
      doc.text(conditionLines.slice(0, maxLines), 20, y);
      y += (Math.min(conditionLines.length, maxLines) * 4.5) + 5;
    }
  }

  if (data.clientSignature && y < (FOOTER_START - MIN_SPACE_FOR_SIGNATURE)) {
    try {
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      const clientNameText = `${t('clientName')}: ${data.clientName}`;
      const nameLines = doc.splitTextToSize(clientNameText, 170);
      doc.text(nameLines, 20, y);
      y += 6;
      doc.addImage(data.clientSignature, 'PNG', 20, y, 50, 15);
      y += 17;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`${t('date')}: ${formatDate(data.date, lang)}`, 20, y);
    } catch (error) {
      console.error('Failed to add signature:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, 270, 190, 270);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(data.companyName, 105, 276, { align: 'center' });
  doc.text(`${t('pdfGeneratedOn')} ${formatDate(new Date().toISOString().split('T')[0], lang)}`, 105, 281, { align: 'center' });
  doc.setTextColor(100, 100, 255);
  doc.textWithLink(t('pdfFooterCreatedWith'), 105, 286, { align: 'center', url: 'https://solarclose.pages.dev' });

  return doc.output('blob');
}

export async function generateSellerPDF(data: SolarLead): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);

  await addCompanyHeader(doc, data, lang, t);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`${t('pdfInternalSalesSheet')} - ${formatDate(data.date, lang)}`, 20, 50);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`${t('pdfLeadId')}: ${data.id.slice(0, 8)}`, 20, 57);

  const startY = 65;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdfClientInfo'), 20, startY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let y = startY + 8;
  doc.text(`${t('clientName')}: ${data.clientName}`, 20, y);
  y += 6;
  doc.text(`${t('address')}: ${data.address}`, 20, y);
  if (data.phone) { y += 6; doc.text(`${t('phone')}: ${data.phone}`, 20, y); }
  if (data.email) { y += 6; doc.text(`${t('email')}: ${data.email}`, 20, y); }

  y += 10;
  doc.setFontSize(14);
  doc.text(t('pdfSalesInfo'), 20, y);
  y += 10;
  doc.setFontSize(10);
  if (data.salesRep) { doc.text(`${t('salesRep')}: ${data.salesRep}`, 20, y); y += 6; }
  if (data.leadStatus) { doc.text(`${t('leadStatus')}: ${t(data.leadStatus.toLowerCase().replace(/\s+/g, '') as any) || data.leadStatus}`, 20, y); y += 6; }
  if (data.updatedAt) {
    const daysDiff = Math.floor((Date.now() - data.updatedAt) / (1000 * 60 * 60 * 24));
    let lastContactedText = '';
    if (daysDiff === 0) lastContactedText = t('today');
    else if (daysDiff === 1) lastContactedText = t('yesterday');
    else lastContactedText = `${daysDiff} ${t('daysAgo')}`;
    doc.text(`${t('lastContacted')}: ${lastContactedText}`, 20, y);
    y += 6;
  }

  y += 5;
  doc.setFontSize(14);
  doc.text(t('pdfPropertyDetails'), 20, y);
  y += 10;
  doc.setFontSize(10);
  if (data.propertyType) { doc.text(`${t('propertyType')}: ${t(data.propertyType.toLowerCase() as any) || data.propertyType}`, 20, y); y += 6; }
  if (data.roofType) { doc.text(`${t('roofType')}: ${t(data.roofType.toLowerCase().replace(/\s+/g, '') as any) || data.roofType}`, 20, y); y += 6; }
  if (data.roofCondition) { doc.text(`${t('roofCondition')}: ${t(data.roofCondition.toLowerCase().replace(/\s+/g, '') as any) || data.roofCondition}`, 20, y); y += 6; }

  y += 5;
  doc.setFontSize(14);
  doc.text(t('pdfSystemDetails'), 20, y);
  y += 10;
  doc.setFontSize(10);
  doc.text(`${t('systemSize')}: ${data.systemSizeKw} kW`, 20, y); y += 6;
  doc.text(`${t('systemCost')}: ${getCurrencySymbol(data.currency)}${formatNumber(data.systemCost)}`, 20, y); y += 6;
  doc.text(`${t('currentMonthlyBill')}: ${getCurrencySymbol(data.currency)}${data.currentMonthlyBill}`, 20, y); y += 6;
  doc.text(`${t('twentyFiveYearSavings')}: ${getCurrencySymbol(data.currency)}${formatNumber(data.twentyFiveYearSavings)}`, 20, y); y += 6;
  doc.text(`${t('breakEvenYear')}: ${data.breakEvenYear ? `${t('year')} ${data.breakEvenYear}` : t('never')}`, 20, y); y += 6;
  if (data.financingOption) {
    const financingText = t(data.financingOption.toLowerCase() as any) || data.financingOption;
    doc.text(`${t('pdfFinancing')}: ${financingText}`, 20, y);
    y += 6;
    if (data.financingOption === 'Loan' && data.loanTerm) {
      if (data.downPayment && data.downPayment > 0) {
        doc.text(`  ${t('pdfDownPayment')}: ${getCurrencySymbol(data.currency)}${formatNumber(data.downPayment)}`, 20, y);
        y += 6;
      }
      doc.text(`  ${t('pdfLoanTerm')}: ${data.loanTerm} ${t('pdfYears')}`, 20, y);
      y += 6;
    }
  }
  if (data.utilityProvider) { doc.text(`${t('utilityProvider')}: ${data.utilityProvider}`, 20, y); y += 6; }
  if (data.avgKwhPerMonth) { doc.text(`${t('avgKwhPerMonth')}: ${data.avgKwhPerMonth}`, 20, y); y += 6; }

  const FOOTER_START = 270;
  const TEXT_WIDTH = 170;
  const LINE_HEIGHT = 4.5;
  const MIN_FOOTER_SPACE = 10;

  if (data.productDescription && y < (FOOTER_START - 30)) {
    y += 5;
    doc.setFontSize(14);
    doc.text(t('productDescription'), 20, y);
    y += 8;
    doc.setFontSize(9);
    const descLines = doc.splitTextToSize(data.productDescription, TEXT_WIDTH);
    const availableSpace = FOOTER_START - MIN_FOOTER_SPACE - y;
    const maxDescLines = Math.floor(availableSpace / LINE_HEIGHT);
    if (maxDescLines > 0) {
      doc.text(descLines.slice(0, maxDescLines), 20, y);
      y += (Math.min(descLines.length, maxDescLines) * LINE_HEIGHT) + 5;
    }
  }

  if (data.notes && y < (FOOTER_START - 20)) {
    y += 5;
    doc.setFontSize(14);
    doc.text(t('notes'), 20, y);
    y += 8;
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(data.notes, TEXT_WIDTH);
    const availableSpace = FOOTER_START - MIN_FOOTER_SPACE - y;
    const maxLines = Math.floor(availableSpace / LINE_HEIGHT);
    if (maxLines > 0) {
      doc.text(lines.slice(0, maxLines), 20, y);
    }
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, 270, 190, 270);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(t('pdfConfidential'), 105, 276, { align: 'center' });
  doc.text(data.companyName, 105, 281, { align: 'center' });
  doc.setTextColor(100, 100, 255);
  doc.textWithLink(t('pdfFooterCreatedWith'), 105, 286, { align: 'center', url: 'https://solarclose.pages.dev' });

  return doc.output('blob');
}

export function sanitizeFilename(name: string): string {
  let sanitized = name.replace(/[^a-zA-Z0-9-_\s]/g, '');
  sanitized = sanitized.replace(/\.\./g, '');
  sanitized = sanitized.trim();
  sanitized = sanitized.replace(/\s+/g, '-');
  sanitized = sanitized.substring(0, 100);
  return sanitized || 'proposal';
}

export function getFilename(data: SolarLead, type: 'client' | 'seller'): string {
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);
  const sanitized = sanitizeFilename(data.clientName);
  const dateStr = formatDateForFilename(data.date, lang);
  const suffix = type === 'client' ? t('pdfFilenameClient') : t('pdfFilenameSeller');
  return `${sanitized}-${dateStr}-${suffix}.pdf`;
}
