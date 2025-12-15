export interface SolarLead {
  id: string;
  createdAt: number;
  clientName: string;
  address: string;
  companyName: string;
  
  // Inputs
  currentMonthlyBill: number; // e.g. 250
  yearlyInflationRate: number; // e.g. 4 (percent)
  systemSizeKw: number; // e.g. 8.5
  systemCost: number; // e.g. 25000
  
  // Calculated Results (Cached)
  twentyFiveYearSavings: number;
  breakEvenYear: number;
  
  // Meta
  isSynced: boolean; // True if pushed to Cloudflare
}