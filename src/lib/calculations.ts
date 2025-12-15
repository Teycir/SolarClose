export interface SolarCalculationInputs {
  currentMonthlyBill: number;
  yearlyInflationRate: number;
  systemCost: number;
  systemSizeKw: number;
  electricityRate: number;
  sunHoursPerDay: number;
  federalTaxCredit: number;
  stateIncentive: number;
}

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

export function calculateSolarSavings(inputs: SolarCalculationInputs): SolarCalculationResults {
  const { currentMonthlyBill, yearlyInflationRate, systemCost, systemSizeKw, electricityRate, sunHoursPerDay, federalTaxCredit, stateIncentive } = inputs;
  const inflationMultiplier = 1 + (yearlyInflationRate / 100);
  
  // Calculate net system cost after incentives
  const federalCredit = systemCost * (federalTaxCredit / 100);
  const netSystemCost = systemCost - federalCredit - stateIncentive;
  
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
  
  for (let year = 1; year <= 25; year++) {
    // Utility cost with inflation
    const utilityWithoutSolar = currentMonthlyBill * 12 * Math.pow(inflationMultiplier, year - 1);
    
    // Solar production degrades from year 1 baseline
    const productionMultiplier = Math.pow(1 - degradationRate, year - 1);
    const yearProduction = year1Production * productionMultiplier;
    const actualOffset = Math.min(yearProduction / currentAnnualUsage, offsetPercentage);
    const yearlySolarSavings = utilityWithoutSolar * actualOffset;
    
    // Maintenance with inflation + inverter replacement
    const maintenanceCost = baseMaintenance * Math.pow(inflationMultiplier, year - 1);
    const inverterCost = (year === 13) ? inverterReplacement : 0;
    const totalYearlyCost = maintenanceCost + inverterCost;
    
    const netYearlySavings = yearlySolarSavings - totalYearlyCost;
    cumulativeSavings += netYearlySavings;
    
    if (breakEvenYear === 0 && cumulativeSavings > 0) {
      breakEvenYear = year;
    }
    
    yearlyBreakdown.push({
      year,
      utilityCost: utilityWithoutSolar,
      solarCost: year === 1 ? systemCost : totalYearlyCost,
      cumulativeSavings
    });
  }
  
  return {
    twentyFiveYearSavings: Math.round(cumulativeSavings),
    breakEvenYear: breakEvenYear || 25,
    yearlyBreakdown
  };
}