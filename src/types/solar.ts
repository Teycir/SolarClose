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
  /** Current monthly electricity bill in dollars (e.g. 250) */
  currentMonthlyBill: number;
  /** Annual utility rate increase percentage (e.g. 4 for 4%) */
  yearlyInflationRate: number;
  /** Solar system size in kilowatts (e.g. 8.5) */
  systemSizeKw: number;
  /** Total system cost before incentives in dollars (e.g. 25000) */
  systemCost: number;
  /** Current electricity rate in dollars per kWh (e.g. 0.15) */
  electricityRate: number;
  /** Average daily sun hours for the location (e.g. 5) */
  sunHoursPerDay: number;
  /** Federal tax credit percentage (e.g. 30 for 30%) */
  federalTaxCredit: number;
  /** State incentive amount in dollars (e.g. 1000) */
  stateIncentive: number;
  /** If true, no inverter replacement costs are included in calculations */
  has25YearInverterWarranty?: boolean;
  
  // Calculated Results (Cached)
  /** Total savings over 25 years after all costs */
  twentyFiveYearSavings: number;
  /** Year when cumulative savings become positive, or null if never breaks even */
  breakEvenYear: number | null;
  yearlyBreakdown?: Array<{
    year: number;
    utilityCost: number;
    solarCost: number;
    cumulativeSavings: number;
  }>;
  
  // Meta
  /** Indicates if the lead has been synced to cloud storage */
  isSynced: boolean;
  /** Client signature as base64 PNG data URL */
  clientSignature?: string;
  /** Sales rep signature as base64 PNG data URL */
  salesRepSignature?: string;
}