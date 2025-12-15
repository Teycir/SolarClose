export interface SolarLead {
  id: string;
  createdAt: number;
  date: string;
  clientName: string;
  address: string;
  companyName: string;
  
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
  
  // Sales Process (Optional)
  salesRep?: string;
  leadStatus?: string;
  notes?: string;
  
  // Utility Info (Optional)
  utilityProvider?: string;
  avgKwhPerMonth?: number;
  
  // Inputs
  currentMonthlyBill: number; // e.g. 250
  yearlyInflationRate: number; // e.g. 4 (percent)
  systemSizeKw: number; // e.g. 8.5
  systemCost: number; // e.g. 25000
  electricityRate: number; // e.g. 0.15 ($/kWh)
  sunHoursPerDay: number; // e.g. 5
  federalTaxCredit: number; // e.g. 30 (percent)
  stateIncentive: number; // e.g. 1000 ($)
  
  // Calculated Results (Cached)
  twentyFiveYearSavings: number;
  breakEvenYear: number;
  
  // Meta
  isSynced: boolean; // True if pushed to Cloudflare
}