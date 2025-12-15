'use client';

import { useState } from 'react';
import type { SolarLead } from '@/types/solar';

interface ExportButtonProps {
  data: SolarLead;
}

export function ExportButton({ data }: ExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const canExport = data.clientName.trim() && data.address.trim();

  const generateClientPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(24);
    doc.setTextColor(255, 193, 7);
    doc.text(data.companyName || 'SOLAR PROPOSAL', 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${data.date}`, 20, 40);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Client Information', 20, 60);
    
    doc.setFontSize(12);
    let y = 75;
    doc.text(`Name: ${data.clientName}`, 20, y);
    y += 10;
    doc.text(`Address: ${data.address}`, 20, y);
    if (data.phone) { y += 10; doc.text(`Phone: ${data.phone}`, 20, y); }
    if (data.email) { y += 10; doc.text(`Email: ${data.email}`, 20, y); }
    
    y += 20;
    doc.setFillColor(255, 248, 220);
    doc.rect(20, y, 170, 30, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255, 193, 7);
    doc.text(`$${data.twentyFiveYearSavings.toLocaleString()}`, 105, y + 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Total 25-Year Savings', 105, y + 22, { align: 'center' });
    
    y += 45;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('System Details', 20, y);
    
    y += 15;
    doc.setFontSize(12);
    doc.text(`System Size: ${data.systemSizeKw} kW`, 20, y);
    y += 10;
    doc.text(`System Cost: $${data.systemCost.toLocaleString()}`, 20, y);
    y += 10;
    doc.text(`Current Monthly Bill: $${data.currentMonthlyBill}`, 20, y);
    y += 10;
    doc.text(`Break-Even Year: Year ${data.breakEvenYear}`, 20, y);
    if (data.financingOption) { y += 10; doc.text(`Financing: ${data.financingOption}`, 20, y); }
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleDateString()} | SolarClose`, 105, 280, { align: 'center' });
    
    doc.save(`${data.clientName}-CLIENT-Proposal.pdf`);
  };

  const generateSellerPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(255, 193, 7);
    doc.text('INTERNAL SALES SHEET', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${data.date} | Lead ID: ${data.id.slice(0, 8)}`, 20, 30);
    
    let y = 45;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Client Information', 20, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.text(`Name: ${data.clientName}`, 20, y);
    y += 7;
    doc.text(`Address: ${data.address}`, 20, y);
    if (data.phone) { y += 7; doc.text(`Phone: ${data.phone}`, 20, y); }
    if (data.email) { y += 7; doc.text(`Email: ${data.email}`, 20, y); }
    
    y += 12;
    doc.setFontSize(14);
    doc.text('Sales Information', 20, y);
    y += 10;
    doc.setFontSize(10);
    if (data.salesRep) { doc.text(`Sales Rep: ${data.salesRep}`, 20, y); y += 7; }
    if (data.leadStatus) { doc.text(`Status: ${data.leadStatus}`, 20, y); y += 7; }
    
    y += 5;
    doc.setFontSize(14);
    doc.text('Property Details', 20, y);
    y += 10;
    doc.setFontSize(10);
    if (data.propertyType) { doc.text(`Type: ${data.propertyType}`, 20, y); y += 7; }
    if (data.roofType) { doc.text(`Roof Type: ${data.roofType}`, 20, y); y += 7; }
    if (data.roofCondition) { doc.text(`Roof Condition: ${data.roofCondition}`, 20, y); y += 7; }
    
    y += 5;
    doc.setFontSize(14);
    doc.text('System & Financial', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`System Size: ${data.systemSizeKw} kW`, 20, y); y += 7;
    doc.text(`System Cost: $${data.systemCost.toLocaleString()}`, 20, y); y += 7;
    doc.text(`Monthly Bill: $${data.currentMonthlyBill}`, 20, y); y += 7;
    doc.text(`25-Year Savings: $${data.twentyFiveYearSavings.toLocaleString()}`, 20, y); y += 7;
    doc.text(`Break-Even: Year ${data.breakEvenYear}`, 20, y); y += 7;
    if (data.financingOption) { doc.text(`Financing: ${data.financingOption}`, 20, y); y += 7; }
    if (data.utilityProvider) { doc.text(`Utility: ${data.utilityProvider}`, 20, y); y += 7; }
    if (data.avgKwhPerMonth) { doc.text(`Avg kWh/Month: ${data.avgKwhPerMonth}`, 20, y); y += 7; }
    
    if (data.notes) {
      y += 5;
      doc.setFontSize(14);
      doc.text('Notes', 20, y);
      y += 10;
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(data.notes, 170);
      doc.text(lines, 20, y);
    }
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('CONFIDENTIAL - Internal Use Only', 105, 280, { align: 'center' });
    
    doc.save(`${data.clientName}-SELLER-Internal.pdf`);
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

  return (
    <button
      onClick={handleExport}
      disabled={isGenerating || !canExport}
      className="w-full bg-primary text-primary-foreground font-semibold py-4 sm:py-3 px-4 sm:px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-base sm:text-sm"
      title={!canExport ? 'Please enter client name and address first' : ''}
    >
      {isGenerating ? 'Generating PDFs...' : !canExport ? '📄 Export PDFs (Enter client info)' : '📄 Export PDFs (Client + Seller)'}
    </button>
  );
}