export type Currency = 'USD' | 'EUR' | 'GBP';
export type Language = 'en' | 'es' | 'it' | 'fr' | 'de';

export interface SolarLead {
  id: string;
  createdAt: number;
  updatedAt?: number;
  date: string;
  
  // Client Info
  clientName: string;
  address: string;
  
  // Solar Company Info
  companyName: string;
  companyEmail?: string;
  companyPhone: string;
  companyLogo?: string;
  productDescription: string;
  
  // Contact Info (Optional)
  phone?: string;
  email?: string;
  
  // Property Details (Optional)
  roofType?: string;
  roofCondition?: string;
  propertyType?: string;
  
  // Financial (Optional)
  financingOption?: string;
  downPayment?: number;
  loanTerm?: number;
  loanInterestRate?: number;
  
  // Sales Process (Optional)
  salesRep?: string;
  leadStatus?: string;
  notes?: string;
  proposalConditions?: string;
  
  // Utility Info (Optional)
  utilityProvider?: string;
  avgKwhPerMonth?: number;
  
  // Localization
  currency?: Currency;
  language?: Language;
  
  // Inputs
  currentMonthlyBill: number; // e.g. 250
  yearlyInflationRate: number; // e.g. 4 (percent)
  systemSizeKw: number; // e.g. 8.5
  systemCost: number; // e.g. 25000
  electricityRate: number; // e.g. 0.15 ($/kWh)
  sunHoursPerDay: number; // e.g. 5
  federalTaxCredit: number; // e.g. 30 (percent)
  stateIncentive: number; // e.g. 1000 ($)
  has25YearInverterWarranty?: boolean; // If true, no inverter replacement costs
  
  // Calculated Results (Cached)
  twentyFiveYearSavings: number;
  breakEvenYear: number | null;
  yearlyBreakdown?: Array<{
    year: number;
    utilityCost: number;
    solarCost: number;
    cumulativeSavings: number;
  }>;
  
  // Meta
  isSynced: boolean; // True if pushed to Cloudflare
}