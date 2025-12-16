/**
 * Input parameters for solar savings calculation
 */
export interface SolarCalculationInputs {
  currentMonthlyBill: number;
  yearlyInflationRate: number;
  systemCost: number;
  systemSizeKw: number;
  electricityRate: number;
  sunHoursPerDay: number;
  federalTaxCreditPercent: number;
  stateIncentiveDollars: number;
  financingOption?: 'Cash' | 'Loan';
  loanTerm?: number; // years
  loanInterestRate?: number; // percent
  downPayment?: number; // dollars
}

/**
 * Results from solar savings calculation
 */
export interface SolarCalculationResults {
  twentyFiveYearSavings: number;
  breakEvenYear: number | null;
  breaksEvenWithin25Years: boolean;
  yearlyBreakdown: Array<{
    year: number;
    utilityCost: number;
    solarCost: number;
    cumulativeSavings: number;
  }>;
}

const PROJECTION_YEARS = 25;

/**
 * Calculates 25-year solar savings with realistic assumptions
 * @param inputs - Solar system parameters and costs
 * @returns Savings projection and break-even analysis
 */
export function calculateSolarSavings(inputs: SolarCalculationInputs): SolarCalculationResults {
  try {
    const { currentMonthlyBill, yearlyInflationRate, systemCost, systemSizeKw, electricityRate, sunHoursPerDay, federalTaxCreditPercent, stateIncentiveDollars, financingOption = 'Cash', loanTerm = 20, loanInterestRate = 6.99, downPayment = 0 } = inputs;
    
    // Validate inputs
    if (systemSizeKw <= 0 || electricityRate < 0 || sunHoursPerDay <= 0 || currentMonthlyBill < 0 || systemCost < 0) {
      return { twentyFiveYearSavings: 0, breakEvenYear: null, breaksEvenWithin25Years: false, yearlyBreakdown: [] };
    }
    
    if (yearlyInflationRate < -50 || yearlyInflationRate > 50) {
      return { twentyFiveYearSavings: 0, breakEvenYear: null, breaksEvenWithin25Years: false, yearlyBreakdown: [] };
    }
    
    if (financingOption === 'Loan' && loanTerm <= 0) {
      return { twentyFiveYearSavings: 0, breakEvenYear: null, breaksEvenWithin25Years: false, yearlyBreakdown: [] };
    }
    
    const inflationMultiplier = 1 + (yearlyInflationRate / 100);
  
  // Calculate net system cost after incentives
  const federalCredit = systemCost * (federalTaxCreditPercent / 100);
  const netSystemCost = Math.max(0, systemCost - federalCredit - stateIncentiveDollars);
  
  // Calculate loan payment if financing
  const loanAmount = Math.max(0, netSystemCost - downPayment);
  const monthlyRate = (loanInterestRate / 100) / 12;
  const numPayments = loanTerm * 12;
  let monthlyLoanPayment = 0;
  
  if (loanAmount > 0 && financingOption === 'Loan') {
    if (monthlyRate === 0) {
      // Zero interest rate: simple division
      monthlyLoanPayment = loanAmount / numPayments;
    } else {
      // Standard amortization formula
      monthlyLoanPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
  }
  
  // Production calculations with performance ratio
  const performanceRatio = 0.80; // 80% real-world efficiency
  const theoreticalProduction = systemSizeKw * sunHoursPerDay * 365;
  const year1Production = theoreticalProduction * performanceRatio;
  const degradationRate = 0.005; // 0.5% per year
  
  // Realistic maintenance costs
  const baseMaintenance = 150; // $150/year base
  const inverterReplacement = systemSizeKw * 300; // ~$300/kW every 12 years
  
  // Calculate current annual usage
  const currentAnnualUsage = electricityRate > 0 ? (currentMonthlyBill / electricityRate) * 12 : 0;
  
  let cumulativeSavings = financingOption === 'Loan' ? -downPayment : -netSystemCost;
  let breakEvenYear: number | null = null;
  const yearlyBreakdown = [];
  
  for (let year = 1; year <= PROJECTION_YEARS; year++) {
    // Apply inflation and degradation for this year
    const inflationFactor = Math.pow(inflationMultiplier, year - 1);
    const degradationFactor = Math.pow(1 - degradationRate, year - 1);
    
    // Utility cost with inflation
    const utilityWithoutSolar = currentMonthlyBill * 12 * inflationFactor;
    
    // Solar production degrades each year
    const yearProduction = year1Production * degradationFactor;
    
    // Calculate savings: production covers a percentage of usage, capped at 100% of bill
    const offsetPercentage = currentAnnualUsage > 0 ? Math.min(yearProduction / currentAnnualUsage, 1.0) : 0;
    const yearlySolarSavings = utilityWithoutSolar * offsetPercentage;
    
    // Maintenance with inflation + inverter replacement every 12 years
    const maintenanceCost = baseMaintenance * inflationFactor;
    const inverterCost = (year === 12 || year === 24) ? inverterReplacement * inflationFactor : 0;
    
    // Add loan payments if within loan term
    const yearlyLoanPayment = financingOption === 'Loan' && year <= loanTerm ? monthlyLoanPayment * 12 : 0;
    const totalYearlyCost = maintenanceCost + inverterCost + yearlyLoanPayment;
    
    const netYearlySavings = yearlySolarSavings - totalYearlyCost;
    cumulativeSavings += netYearlySavings;
    
    if (breakEvenYear === null && cumulativeSavings > 0) {
      breakEvenYear = year;
    }
    
    const solarCost = year === 1 ? netSystemCost : totalYearlyCost;
    yearlyBreakdown.push({
      year,
      utilityCost: utilityWithoutSolar,
      solarCost,
      cumulativeSavings
    });
    

  }

    return {
      twentyFiveYearSavings: Math.round(cumulativeSavings),
      breakEvenYear,
      breaksEvenWithin25Years: breakEvenYear !== null,
      yearlyBreakdown
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to calculate solar savings:', errorMessage.replace(/[\r\n]/g, ' '));
    return { twentyFiveYearSavings: 0, breakEvenYear: null, breaksEvenWithin25Years: false, yearlyBreakdown: [] };
  }
}