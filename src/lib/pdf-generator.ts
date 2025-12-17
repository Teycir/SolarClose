import type { SolarLead, Language } from '@/types/solar';
import { getTranslation, type TranslationKey } from '@/lib/translations';

const formatDate = (dateStr: string, lang: Language) => {
  const date = new Date(dateStr + 'T00:00:00');
  return lang === 'en' ? date.toLocaleDateString('en-US') : date.toLocaleDateString('fr-FR');
};

const formatDateForFilename = (dateStr: string, lang: Language) => {
  const date = new Date(dateStr + 'T00:00:00');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return lang === 'en' ? `${month}-${day}-${year}` : `${day}-${month}-${year}`;
};

const formatNumber = (num: number) => Math.round(num).toLocaleString('en-US').replace(/,/g, ' ');

const getCurrencySymbol = (currency?: string) => currency === 'USD' ? '$' : '€';

const addCompanyHeader = async (doc: any, data: SolarLead) => {
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
  if (data.companyEmail) { doc.text(`Email: ${data.companyEmail}`, 20, headerY); }
  
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
      // Logo failed to load
    }
  }
};

export async function generateClientPDF(data: SolarLead): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);
  
  await addCompanyHeader(doc, data);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`${t('proposal')} - ${formatDate(data.date, lang)} by ${data.companyName}`, 20, 45);
  
  let y = 55;
  
  doc.setFontSize(14);
  doc.text('Product Description', 20, y);
  y += 10;
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(data.productDescription, 170);
  doc.text(descLines, 20, y);
  y += (descLines.length * 5) + 10;
  
  doc.setFontSize(14);
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
  doc.text(`Total System Cost: ${getCurrencySymbol(data.currency)}${formatNumber(data.systemCost)}`, 20, y);
  y += 7;
  
  const federalCredit = data.systemCost * (data.federalTaxCredit / 100);
  const netCost = data.systemCost - federalCredit - data.stateIncentive;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`  - Federal Tax Credit (${data.federalTaxCredit}%): -${getCurrencySymbol(data.currency)}${formatNumber(federalCredit)}`, 20, y);
  y += 6;
  if (data.stateIncentive > 0) {
    doc.text(`  - State Incentive: -${getCurrencySymbol(data.currency)}${formatNumber(data.stateIncentive)}`, 20, y);
    y += 6;
  }
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Net Investment: ${getCurrencySymbol(data.currency)}${formatNumber(netCost)}`, 20, y);
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
      doc.text(`  Down Payment: ${getCurrencySymbol(data.currency)}${formatNumber(data.downPayment)}`, 20, y);
      y += 6;
    }
    doc.text(`  Financed Amount: ${getCurrencySymbol(data.currency)}${formatNumber(loanAmount)}`, 20, y);
    y += 6;
    doc.text(`  Loan Term: ${data.loanTerm} years @ ${data.loanInterestRate || 6.99}% APR`, 20, y);
    y += 6;
    doc.text(`  Monthly Payment: ${getCurrencySymbol(data.currency)}${formatNumber(monthlyPayment)}`, 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
  }
  
  const avgAnnualSavings = Math.round(data.twentyFiveYearSavings / 25);
  const avgMonthlySavings = Math.round(avgAnnualSavings / 12);
  
  doc.text(`Break-Even Period: ${data.breakEvenYear ? `${t('year')} ${data.breakEvenYear}` : 'Never'}`, 20, y);
  y += 8;
  doc.text(`Average Monthly Savings: ${getCurrencySymbol(data.currency)}${formatNumber(avgMonthlySavings)}`, 20, y);
  y += 8;
  doc.text(`Average Annual Savings: ${getCurrencySymbol(data.currency)}${formatNumber(avgAnnualSavings)}`, 20, y);
  y += 8;
  doc.setTextColor(255, 193, 7);
  doc.text(`Total 25-Year Savings: ${getCurrencySymbol(data.currency)}${formatNumber(data.twentyFiveYearSavings)}`, 20, y);
  doc.setTextColor(0, 0, 0);
  y += 15;
  
  const annualProduction = data.systemSizeKw * data.sunHoursPerDay * 365 * 0.8;
  const co2SavedLbs = Math.round(annualProduction * 0.85 * 25);
  const isMetric = lang !== 'en';
  const co2Saved = isMetric ? Math.round(co2SavedLbs * 0.453592) : co2SavedLbs;
  const co2Unit = isMetric ? 'kg' : 'lbs';
  const treesEquivalent = Math.round(co2SavedLbs / 48);
  
  doc.setFontSize(12);
  doc.setTextColor(34, 139, 34);
  doc.text('Environmental Impact (25 Years)', 20, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`CO2 Offset: ${co2Saved.toLocaleString('en-US').replace(/,/g, ' ')} ${co2Unit}`, 20, y);
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
  
  return doc.output('blob');
}

export async function generateSellerPDF(data: SolarLead): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as any);
  
  await addCompanyHeader(doc, data);
  
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
  doc.text(`System Cost: ${getCurrencySymbol(data.currency)}${formatNumber(data.systemCost)}`, 20, y); y += 6;
  doc.text(`Current Monthly Bill: ${getCurrencySymbol(data.currency)}${data.currentMonthlyBill}`, 20, y); y += 6;
  doc.text(`25-Year Savings: ${getCurrencySymbol(data.currency)}${formatNumber(data.twentyFiveYearSavings)}`, 20, y); y += 6;
  doc.text(`Break-Even Year: ${data.breakEvenYear ? `Year ${data.breakEvenYear}` : 'Never'}`, 20, y); y += 6;
  if (data.financingOption) { 
    doc.text(`Financing: ${t(data.financingOption.toLowerCase() as any) || data.financingOption}`, 20, y); y += 6;
    if (data.financingOption === 'Loan' && data.loanTerm) {
      if (data.downPayment && data.downPayment > 0) {
        doc.text(`  Down Payment: ${getCurrencySymbol(data.currency)}${formatNumber(data.downPayment)}`, 20, y); y += 6;
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
  
  return doc.output('blob');
}

export function sanitizeFilename(name: string): string {
  const sanitized = name
    .replace(/[^a-zA-Z0-9-_\s]/g, '')
    .replace(/\.\./g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 100);
  return sanitized || 'proposal';
}

export function getFilename(data: SolarLead, type: 'client' | 'seller'): string {
  const lang = (data.language || 'en') as Language;
  const sanitized = sanitizeFilename(data.clientName);
  const dateStr = formatDateForFilename(data.date, lang);
  const suffix = type === 'client' ? 'CLIENT-Proposal' : 'SELLER-Internal';
  return `${sanitized}-${dateStr}-${suffix}.pdf`;
}
