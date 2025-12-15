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
  const { currentMonthlyBill, yearlyInflationRate, systemCost } = inputs;
  const inflationMultiplier = 1 + (yearlyInflationRate / 100);
  
  let cumulativeSavings = 0;
  let breakEvenYear = 0;
  const yearlyBreakdown = [];
  
  for (let year = 1; year <= 25; year++) {
    const utilityCost = currentMonthlyBill * 12 * Math.pow(inflationMultiplier, year - 1);
    const solarCost = year === 1 ? systemCost : 0; // System paid upfront
    const yearlySavings = utilityCost - solarCost;
    
    cumulativeSavings += yearlySavings;
    
    if (breakEvenYear === 0 && cumulativeSavings > 0) {
      breakEvenYear = year;
    }
    
    yearlyBreakdown.push({
      year,
      utilityCost,
      solarCost,
      cumulativeSavings
    });
  }
  
  return {
    twentyFiveYearSavings: cumulativeSavings,
    breakEvenYear,
    yearlyBreakdown
  };
}