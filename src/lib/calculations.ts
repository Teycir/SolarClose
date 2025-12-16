/**
 * Input parameters for solar savings calculation
 */
export interface SolarCalculationInputs {
  /** Current monthly electricity bill in dollars */
  currentMonthlyBill: number;
  /** Annual utility rate increase percentage (e.g., 4 for 4%) */
  yearlyInflationRate: number;
  /** Total system cost before incentives in dollars */
  systemCost: number;
  /** Solar system size in kilowatts (kW) */
  systemSizeKw: number;
  /** Current electricity rate in dollars per kWh */
  electricityRate: number;
  /** Average daily sun hours for the location */
  sunHoursPerDay: number;
  /** Federal tax credit percentage (e.g., 30 for 30%) */
  federalTaxCreditPercent: number;
  /** State incentive amount in dollars */
  stateIncentiveDollars: number;
  /** Payment method: 'Cash' or 'Loan' */
  financingOption?: 'Cash' | 'Loan';
  /** Loan term in years (default: 20) */
  loanTerm?: number;
  /** Annual loan interest rate percentage (default: 6.99) */
  loanInterestRate?: number;
  /** Down payment amount in dollars (default: 0) */
  downPayment?: number;
  /** If true, no inverter replacement costs are included */
  has25YearInverterWarranty?: boolean;
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
const EMPTY_RESULT: SolarCalculationResults = {
  twentyFiveYearSavings: 0,
  breakEvenYear: null,
  breaksEvenWithin25Years: false,
  yearlyBreakdown: []
};

/**
 * Calculates 25-year solar savings with realistic assumptions
 * @param inputs - Solar system parameters and costs
 * @returns Savings projection and break-even analysis
 */
export function calculateSolarSavings(inputs: SolarCalculationInputs): SolarCalculationResults {
  try {
    console.log('[CALC] Received inputs:', inputs);
    const {
      currentMonthlyBill = 0,
      yearlyInflationRate = 0,
      systemCost = 0,
      systemSizeKw = 0,
      electricityRate = 0,
      sunHoursPerDay = 0,
      federalTaxCreditPercent = 0,
      stateIncentiveDollars = 0,
      financingOption = 'Cash',
      loanTerm = 20,
      loanInterestRate = 6.99,
      downPayment = 0,
      has25YearInverterWarranty = false
    } = inputs ?? {};
    console.log('[CALC] Destructured currentMonthlyBill:', currentMonthlyBill);
    
    // Validate inputs
    const hasInvalidInputs =
      systemSizeKw <= 0 ||
      electricityRate < 0 ||
      sunHoursPerDay <= 0 ||
      currentMonthlyBill < 0 ||
      systemCost < 0;
    if (hasInvalidInputs) {
      return EMPTY_RESULT;
    }

    if (yearlyInflationRate < -50 || yearlyInflationRate > 50) {
      return EMPTY_RESULT;
    }

    if (financingOption === 'Loan' && loanTerm <= 0) {
      return EMPTY_RESULT;
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
      // Standard amortization formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
      const rateCompounded = Math.pow(1 + monthlyRate, numPayments);
      const numerator = loanAmount * monthlyRate * rateCompounded;
      const denominator = rateCompounded - 1;
      monthlyLoanPayment = numerator / denominator;
    }
  }
  
  // Production calculations with performance ratio
  const performanceRatio = 0.80; // 80% real-world efficiency
  const theoreticalProduction = systemSizeKw * sunHoursPerDay * 365;
  const year1Production = theoreticalProduction * performanceRatio;
  const degradationRate = 0.005; // 0.5% per year
  
  // Realistic maintenance costs
  const baseMaintenance = 150; // $150/year base
  const inverterReplacement = has25YearInverterWarranty ? 0 : systemSizeKw * 300; // ~$300/kW every 12 years
  
  // Calculate current annual usage
  const currentAnnualUsage = electricityRate > 0 ? (currentMonthlyBill / electricityRate) * 12 : 0;
  console.log('[CALC] currentAnnualUsage (kWh):', currentAnnualUsage, '= (', currentMonthlyBill, '/', electricityRate, ') * 12');
  
  let cumulativeSavings = financingOption === 'Loan' ? -downPayment : -netSystemCost;
  let breakEvenYear: number | null = null;
  const yearlyBreakdown = [];
  
  for (let year = 1; year <= PROJECTION_YEARS; year++) {
    // Apply inflation and degradation for this year
    const inflationFactor = Math.pow(inflationMultiplier, year - 1);
    const degradationFactor = Math.pow(1 - degradationRate, year - 1);
    
    // Utility cost with inflation
    const utilityWithoutSolar = currentMonthlyBill * 12 * inflationFactor;
    if (year === 1) {
      console.log('[CALC] Year 1 utilityWithoutSolar:', utilityWithoutSolar, '= ', currentMonthlyBill, '* 12 *', inflationFactor);
    }
    
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to calculate solar savings:', errorMessage.replace(/[\r\n]/g, ' '));
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack.replace(/[\r\n]/g, ' | '));
    }
    return EMPTY_RESULT;
  }
}