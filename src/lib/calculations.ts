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
}

/**
 * Results from solar savings calculation
 */
export interface SolarCalculationResults {
  twentyFiveYearSavings: number;
  breakEvenYear: number;
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
    const { currentMonthlyBill, yearlyInflationRate, systemCost, systemSizeKw, electricityRate, sunHoursPerDay, federalTaxCreditPercent, stateIncentiveDollars } = inputs;
    
    // Validate inputs
    if (systemSizeKw <= 0 || electricityRate < 0 || sunHoursPerDay <= 0 || currentMonthlyBill < 0 || systemCost < 0) {
      return { twentyFiveYearSavings: 0, breakEvenYear: 0, yearlyBreakdown: [] };
    }
  
  const inflationMultiplier = 1 + (yearlyInflationRate / 100);
  
  // Calculate net system cost after incentives
  const federalCredit = systemCost * (federalTaxCreditPercent / 100);
  const netSystemCost = Math.max(0, systemCost - federalCredit - stateIncentiveDollars);
  
  // Production calculations with performance ratio
  const performanceRatio = 0.80; // 80% real-world efficiency
  const theoreticalProduction = systemSizeKw * sunHoursPerDay * 365;
  const year1Production = theoreticalProduction * performanceRatio;
  const degradationRate = 0.005; // 0.5% per year
  
  // Realistic maintenance costs
  const baseMaintenance = 150; // $150/year base
  const inverterReplacement = systemSizeKw * 300; // ~$300/kW around year 12-15
  
  // Calculate current annual usage
  const currentAnnualUsage = electricityRate > 0 ? (currentMonthlyBill / electricityRate) * 12 : 0;
  const offsetPercentage = currentAnnualUsage > 0 ? Math.min(year1Production / currentAnnualUsage, 1.0) : 0;
  
  let cumulativeSavings = -netSystemCost;
  let breakEvenYear = 0;
  const yearlyBreakdown = [];
  
  let inflationFactor = 1;
  let degradationFactor = 1;
  
  for (let year = 1; year <= PROJECTION_YEARS; year++) {
    // Utility cost with inflation
    const utilityWithoutSolar = currentMonthlyBill * 12 * inflationFactor;
    
    // Solar production degrades from year 1 baseline
    const productionMultiplier = degradationFactor;
    const yearProduction = year1Production * productionMultiplier;
    const actualOffset = currentAnnualUsage > 0 ? Math.min(yearProduction / currentAnnualUsage, offsetPercentage) : 0;
    const yearlySolarSavings = utilityWithoutSolar * actualOffset;
    
    // Maintenance with inflation + inverter replacement
    const maintenanceCost = baseMaintenance * inflationFactor;
    const inverterCost = year === 13 ? inverterReplacement : 0;
    const totalYearlyCost = maintenanceCost + inverterCost;
    
    const netYearlySavings = yearlySolarSavings - totalYearlyCost;
    cumulativeSavings += netYearlySavings;
    
    if (breakEvenYear === 0 && cumulativeSavings > 0) {
      breakEvenYear = year;
    }
    
    const solarCost = year === 1 ? systemCost : totalYearlyCost;
    yearlyBreakdown.push({
      year,
      utilityCost: utilityWithoutSolar,
      solarCost,
      cumulativeSavings
    });
    
    inflationFactor *= inflationMultiplier;
    degradationFactor *= (1 - degradationRate);
  }
  
    if (breakEvenYear === 0) {
      breakEvenYear = PROJECTION_YEARS;
    }

    return {
      twentyFiveYearSavings: Math.round(cumulativeSavings),
      breakEvenYear,
      yearlyBreakdown
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to calculate solar savings:', errorMessage.replace(/[\r\n]/g, ' '));
    return { twentyFiveYearSavings: 0, breakEvenYear: 0, yearlyBreakdown: [] };
  }
}