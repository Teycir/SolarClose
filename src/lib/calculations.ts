export interface SolarCalculationInputs {
  currentMonthlyBill: number;
  yearlyInflationRate: number;
  systemCost: number;
  systemSizeKw: number;
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
  const { currentMonthlyBill, yearlyInflationRate, systemCost, systemSizeKw } = inputs;
  const inflationMultiplier = 1 + (yearlyInflationRate / 100);
  
  // Realistic assumptions
  const avgSunHoursPerDay = 5; // Average sun hours
  const annualProduction = systemSizeKw * avgSunHoursPerDay * 365; // kWh per year
  const avgElectricityRate = 0.15; // $0.15 per kWh (average US rate)
  const solarDegradation = 0.005; // 0.5% per year
  const annualMaintenanceCost = systemCost * 0.01; // 1% of system cost per year
  
  // Calculate offset percentage
  const currentAnnualUsage = (currentMonthlyBill / avgElectricityRate) * 12;
  const offsetPercentage = Math.min(annualProduction / currentAnnualUsage, 1.0);
  
  let cumulativeSavings = -systemCost; // Start with upfront cost
  let breakEvenYear = 0;
  const yearlyBreakdown = [];
  
  for (let year = 1; year <= 25; year++) {
    // Utility cost without solar (with inflation)
    const utilityWithoutSolar = currentMonthlyBill * 12 * Math.pow(inflationMultiplier, year - 1);
    
    // Solar production degrades over time
    const productionMultiplier = Math.pow(1 - solarDegradation, year - 1);
    const yearlySolarSavings = utilityWithoutSolar * offsetPercentage * productionMultiplier;
    
    // Net savings after maintenance
    const netYearlySavings = yearlySolarSavings - annualMaintenanceCost;
    
    cumulativeSavings += netYearlySavings;
    
    if (breakEvenYear === 0 && cumulativeSavings > 0) {
      breakEvenYear = year;
    }
    
    yearlyBreakdown.push({
      year,
      utilityCost: utilityWithoutSolar,
      solarCost: year === 1 ? systemCost : annualMaintenanceCost,
      cumulativeSavings
    });
  }
  
  return {
    twentyFiveYearSavings: Math.round(cumulativeSavings),
    breakEvenYear: breakEvenYear || 25,
    yearlyBreakdown
  };
}