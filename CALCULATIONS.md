# Solar Savings Calculation Logic - Technical Documentation

## Overview
This document explains the mathematical logic and assumptions used in the SolarClose solar savings calculator. The calculation projects 25-year savings for residential solar installations with realistic assumptions.

---

## Input Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `currentMonthlyBill` | number | Current monthly electricity bill ($) | $200 |
| `yearlyInflationRate` | number | Annual utility rate inflation (%) | 4% |
| `systemCost` | number | Total system cost before incentives ($) | $30,000 |
| `systemSizeKw` | number | System size in kilowatts | 10 kW |
| `electricityRate` | number | Current electricity rate ($/kWh) | $0.12 |
| `sunHoursPerDay` | number | Average peak sun hours per day | 5 hours |
| `federalTaxCreditPercent` | number | Federal tax credit percentage | 30% |
| `stateIncentiveDollars` | number | State/local incentives ($) | $2,000 |
| `financingOption` | string | 'Cash' or 'Loan' | 'Cash' |
| `loanTerm` | number | Loan term in years (if financing) | 20 years |
| `loanInterestRate` | number | Annual loan interest rate (%) | 6.99% |
| `downPayment` | number | Down payment amount ($) | $5,000 |

---

## Core Assumptions

### 1. Performance Ratio: 80%
Real-world solar systems operate at ~80% of theoretical capacity due to:
- Weather conditions (clouds, rain, snow)
- Shading from trees or buildings
- Dirt and debris on panels
- Temperature effects
- Inverter efficiency losses

**Formula:**
```
year1Production = systemSizeKw × sunHoursPerDay × 365 × 0.80
```

**Example:** 10 kW × 5 hours × 365 days × 0.80 = 14,600 kWh/year

---

### 2. Panel Degradation: 0.5% per year
Solar panels lose efficiency over time. Industry standard is 0.5% annual degradation.

**Formula:**
```
degradationFactor = (1 - 0.005)^(year - 1)
yearProduction = year1Production × degradationFactor
```

**Example:**
- Year 1: 14,600 kWh × 1.000 = 14,600 kWh
- Year 10: 14,600 kWh × 0.951 = 13,885 kWh
- Year 25: 14,600 kWh × 0.887 = 12,950 kWh

---

### 3. Maintenance Costs: $150/year
Annual maintenance includes:
- Panel cleaning
- Inspection
- Minor repairs
- Monitoring system upkeep

**Formula:**
```
maintenanceCost = $150 × inflationFactor
```

**Example:**
- Year 1: $150 × 1.00 = $150
- Year 10: $150 × 1.48 = $222
- Year 25: $150 × 2.56 = $384

---

### 4. Inverter Replacement: Every 12 years
Inverters typically last 10-15 years. We replace at years 12 and 24.

**Cost:** $300 per kW (inflated to replacement year)

**Formula:**
```
inverterCost = (year === 12 || year === 24) ? systemSizeKw × 300 × inflationFactor : 0
```

**Example (10 kW system, 4% inflation):**
- Year 12: 10 kW × $300 × 1.54 = $4,618
- Year 24: 10 kW × $300 × 2.46 = $7,394

---

### 5. Utility Rate Inflation: User-defined (default 4%)
Electricity rates historically increase 3-5% annually.

**Formula:**
```
inflationFactor = (1 + yearlyInflationRate/100)^(year - 1)
utilityWithoutSolar = currentMonthlyBill × 12 × inflationFactor
```

**Example ($200/month, 4% inflation):**
- Year 1: $200 × 12 × 1.00 = $2,400
- Year 10: $200 × 12 × 1.48 = $3,552
- Year 25: $200 × 12 × 2.56 = $6,144

---

## Calculation Steps

### Step 1: Calculate Net System Cost
```typescript
federalCredit = systemCost × (federalTaxCreditPercent / 100)
netSystemCost = systemCost - federalCredit - stateIncentiveDollars
```

**Example:**
- System cost: $30,000
- Federal credit (30%): $9,000
- State incentive: $2,000
- **Net cost: $19,000**

---

### Step 2: Calculate Loan Payment (if applicable)
Standard amortization formula with monthly compounding:

```typescript
loanAmount = netSystemCost - downPayment
monthlyRate = (loanInterestRate / 100) / 12
numPayments = loanTerm × 12

// Handle zero interest rate
if (monthlyRate === 0) {
  monthlyLoanPayment = loanAmount / numPayments
} else {
  monthlyLoanPayment = (loanAmount × monthlyRate × (1 + monthlyRate)^numPayments) / 
                       ((1 + monthlyRate)^numPayments - 1)
}
```

**Example ($14,000 loan, 6.99% APR, 20 years):**
- Monthly rate: 0.005825
- Number of payments: 240
- **Monthly payment: $108.17**
- **Annual payment: $1,298**

---

### Step 3: Calculate Annual Production
```typescript
theoreticalProduction = systemSizeKw × sunHoursPerDay × 365
year1Production = theoreticalProduction × 0.80  // Performance ratio
yearProduction = year1Production × (1 - 0.005)^(year - 1)  // Degradation
```

---

### Step 4: Calculate Current Annual Usage
```typescript
currentAnnualUsage = (currentMonthlyBill / electricityRate) × 12
```

**Example:**
- Monthly bill: $200
- Electricity rate: $0.12/kWh
- **Annual usage: 20,000 kWh**

---

### Step 5: Calculate Yearly Savings (for each year 1-25)

#### 5a. Calculate utility cost without solar (with inflation)
```typescript
inflationFactor = (1 + yearlyInflationRate/100)^(year - 1)
utilityWithoutSolar = currentMonthlyBill × 12 × inflationFactor
```

#### 5b. Calculate solar production (with degradation)
```typescript
degradationFactor = (1 - 0.005)^(year - 1)
yearProduction = year1Production × degradationFactor
```

#### 5c. Calculate offset percentage (capped at 100%)
```typescript
offsetPercentage = Math.min(yearProduction / currentAnnualUsage, 1.0)
```

**Example (Year 1):**
- Production: 14,600 kWh
- Usage: 20,000 kWh
- **Offset: 73%**

**Example (Year 25):**
- Production: 12,950 kWh (degraded)
- Usage: 20,000 kWh
- **Offset: 65%**

#### 5d. Calculate yearly solar savings
```typescript
yearlySolarSavings = utilityWithoutSolar × offsetPercentage
```

**Example (Year 1):**
- Utility bill: $2,400
- Offset: 73%
- **Savings: $1,752**

#### 5e. Calculate yearly costs
```typescript
maintenanceCost = $150 × inflationFactor
inverterCost = (year === 12 || year === 24) ? systemSizeKw × 300 × inflationFactor : 0
yearlyLoanPayment = (financingOption === 'Loan' && year <= loanTerm) ? monthlyLoanPayment × 12 : 0
totalYearlyCost = maintenanceCost + inverterCost + yearlyLoanPayment
```

**Example (Year 1, Cash):**
- Maintenance: $150
- Inverter: $0
- Loan: $0
- **Total cost: $150**

**Example (Year 12, Loan):**
- Maintenance: $231
- Inverter: $4,618
- Loan: $1,298
- **Total cost: $6,147** ← Creates visible "bump" in savings chart

#### 5f. Calculate net yearly savings
```typescript
netYearlySavings = yearlySolarSavings - totalYearlyCost
```

**Example (Year 1):**
- Solar savings: $1,752
- Total costs: $150
- **Net savings: $1,602**

---

### Step 6: Calculate Cumulative Savings

#### Initial investment
```typescript
cumulativeSavings = financingOption === 'Loan' ? -downPayment : -netSystemCost
```

**Cash purchase:** Start at -$19,000 (full net cost)  
**Loan purchase:** Start at -$5,000 (down payment only)

#### Add each year's net savings
```typescript
cumulativeSavings += netYearlySavings
```

---

### Step 7: Determine Break-Even Year
```typescript
if (breakEvenYear === 0 && cumulativeSavings > 0) {
  breakEvenYear = year
}
```

Break-even occurs when cumulative savings crosses zero (investment recovered).

---

## Complete Example Calculation

**Inputs:**
- 10 kW system, $30,000 cost
- $200/month bill, $0.12/kWh rate
- 5 sun hours/day
- 30% federal credit, $2,000 state incentive
- 4% inflation
- Cash purchase

**Year 1:**
1. Net cost: $30,000 - $9,000 - $2,000 = **$19,000**
2. Production: 10 × 5 × 365 × 0.80 = **14,600 kWh**
3. Usage: ($200 / $0.12) × 12 = **20,000 kWh**
4. Offset: 14,600 / 20,000 = **73%**
5. Utility without solar: $200 × 12 = **$2,400**
6. Solar savings: $2,400 × 0.73 = **$1,752**
7. Costs: $150 maintenance = **$150**
8. Net savings: $1,752 - $150 = **$1,602**
9. Cumulative: -$19,000 + $1,602 = **-$17,398**

**Year 12:**
1. Inflation factor: 1.04^11 = **1.54**
2. Degradation factor: 0.995^11 = **0.946**
3. Production: 14,600 × 0.946 = **13,812 kWh**
4. Offset: 13,812 / 20,000 = **69%**
5. Utility without solar: $200 × 12 × 1.54 = **$3,696**
6. Solar savings: $3,696 × 0.69 = **$2,550**
7. Costs: ($150 × 1.54) + ($3,000 × 1.54) = $231 + $4,618 = **$4,849**
8. Net savings: $2,550 - $4,849 = **-$2,299** ← Negative due to inverter!
9. Cumulative: Previous + (-$2,299) = **Lower than year 11**

**Year 25:**
1. Inflation factor: 1.04^24 = **2.56**
2. Degradation factor: 0.995^24 = **0.887**
3. Production: 14,600 × 0.887 = **12,950 kWh**
4. Offset: 12,950 / 20,000 = **65%**
5. Utility without solar: $200 × 12 × 2.56 = **$6,144**
6. Solar savings: $6,144 × 0.65 = **$3,994**
7. Costs: $150 × 2.56 = **$384**
8. Net savings: $3,994 - $384 = **$3,610**
9. **25-year total savings: ~$35,000** (example)

---

## Edge Cases Handled

### 1. System produces more than usage
```typescript
offsetPercentage = Math.min(yearProduction / currentAnnualUsage, 1.0)
```
Caps savings at 100% of utility bill (assumes 1:1 net metering).

### 2. Electricity rate is zero
```typescript
currentAnnualUsage = electricityRate > 0 ? (currentMonthlyBill / electricityRate) × 12 : 0
offsetPercentage = currentAnnualUsage > 0 ? Math.min(...) : 0
```
Prevents division by zero, returns $0 savings.

### 3. Down payment exceeds net cost
```typescript
loanAmount = Math.max(0, netSystemCost - downPayment)
```
Prevents negative loan amount.

### 4. Zero interest rate
```typescript
if (monthlyRate === 0) {
  monthlyLoanPayment = loanAmount / numPayments
} else {
  // Standard amortization formula
}
```
Prevents division by zero in amortization formula.

### 5. System never breaks even
```typescript
if (breakEvenYear === 0) {
  breakEvenYear = PROJECTION_YEARS  // Returns 25
}
```

---

## Expert Review Responses

### 1. Performance Ratio by Region
**Current:** Fixed at 80%  
**Recommendation:** 75% (Pacific NW) | 80% (Average US) | 82-85% (Desert)

### 2. Degradation by Panel Type
**Current:** 0.5% per year  
**Industry:** Mono 0.3-0.5% | Poly 0.5-0.7% | Thin-film 0.5-1.0%

### 3. Inverter Interval
**Current:** 12 years  
**Industry:** String 10-12yr | Microinverters 15-25yr

### 4. Maintenance Scaling
**Current:** Fixed $150/year  
**Recommendation:** $100 base + $10/kW

### 5. Net Metering Rate
**Current:** 1:1 (100% retail credit)  
**Reality:** Many utilities now 50-75% for excess

### 6. Loan Interest Deductibility
**Current:** Not included  
**Analysis:** Correct - solar loans rarely tax-deductible

### 7. Separate Inflation Rates
**Current:** Single rate  
**Recommendation:** Split utility (3-5%) vs general (2-3%)

### 8. Seasonality
**Current:** Annual average  
**Analysis:** Appropriate for 25-year projections

### 9. Shading Factor
**Current:** Included in 80% performance  
**Recommendation:** Separate 0-100% parameter

### 10. Battery Storage
**Current:** Not included  
**Recommendation:** Phase 2 feature

---

## Validation Checklist

- [x] Performance ratio (80%) realistic for average US
- [x] Degradation (0.5%) matches modern warranties
- [x] Maintenance ($150/year) reasonable for 5-10kW
- [x] Inverter schedule (12yr) conservative for string
- [x] Inflation user-configurable
- [x] Federal credit (30%) current as of 2024
- [x] Loan formula includes zero-rate handling
- [x] Break-even accounts for all costs
- [x] Edge cases handled
- [x] All numerical examples verified

---

## Code Reference

Full implementation: `/src/lib/calculations.ts`

Function: `calculateSolarSavings(inputs: SolarCalculationInputs): SolarCalculationResults`

---

**Document Version:** 1.1 (Expert Review Applied)  
**Last Updated:** 2025  
**Reviewed By:** Solar Industry Expert  
**Author:** SolarClose Development Team  
**Contact:** https://teycirbensoltane.tn = max(0, netSystemCost - downPayment)
```
Prevents negative loan amount.

### 4. Zero interest rate
```typescript
monthlyLoanPayment = loanAmount > 0 && financingOption === 'Loan' && monthlyRate > 0 ? ... : 0
```
Prevents division by zero in amortization formula.

### 5. System never breaks even
```typescript
if (breakEvenYear === 0) {
  breakEvenYear = PROJECTION_YEARS  // Returns 25
}
```

---

## Output

### twentyFiveYearSavings
Total cumulative savings after 25 years (rounded to nearest dollar).

### breakEvenYear
Year when cumulative savings crosses zero (1-25).

### yearlyBreakdown
Array of 25 objects containing:
- `year`: Year number (1-25)
- `utilityCost`: What utility bill would be without solar
- `solarCost`: Year 1 shows net system cost, other years show yearly costs
- `cumulativeSavings`: Running total of savings

---

## Key Design Decisions

### 1. Cash Flow vs. Total Cost
For loans, we track cash flow (down payment + monthly payments) rather than total debt. This reflects actual out-of-pocket expenses.

### 2. Inflation Applied to Future Costs
Inverter replacement costs are inflated to the year they occur, making projections more realistic.

### 3. Conservative Assumptions
- 80% performance ratio (not 100%)
- 0.5% degradation (industry standard)
- Inverter replacement every 12 years (conservative)
- Maintenance costs included

### 4. 1:1 Net Metering Assumption
Assumes excess production is credited at retail rate. In reality, some utilities pay less for excess generation.

---

## Validation Checklist

- [ ] Performance ratio (80%) is realistic for location
- [ ] Degradation rate (0.5%) matches panel warranty
- [ ] Maintenance costs ($150/year) are reasonable
- [ ] Inverter replacement schedule (12 years) is conservative
- [ ] Inflation rate matches historical utility trends
- [ ] Federal tax credit percentage is current (30% as of 2024)
- [ ] Loan amortization formula is standard
- [ ] Break-even calculation accounts for all costs
- [ ] Edge cases (zero values, oversized systems) are handled

---

## Questions for Expert Review

1. **Performance Ratio:** Is 80% appropriate for all regions, or should it vary by location/climate?

2. **Degradation Rate:** Should we use 0.5% for all panel types, or differentiate by technology (monocrystalline vs. polycrystalline)?

3. **Inverter Replacement:** Is 12-year interval appropriate, or should it be configurable (10-15 years)?

4. **Maintenance Costs:** Is $150/year realistic, or should it scale with system size?

5. **Net Metering:** Should we add a parameter for net metering rate (e.g., 0.5x retail for excess)?

6. **Loan Calculation:** Should we account for tax deductibility of loan interest?

7. **Inflation:** Should utility inflation and general inflation be separate parameters?

8. **Production Seasonality:** Should we account for seasonal variation, or is annual average sufficient?

9. **Shading Analysis:** Should we add a shading factor separate from performance ratio?

10. **Battery Storage:** Should we add optional battery costs and benefits?

---

## Code Reference

Full implementation: `/src/lib/calculations.ts`

Function: `calculateSolarSavings(inputs: SolarCalculationInputs): SolarCalculationResults`

---

**Document Version:** 1.0  
**Last Updated:** 2025  
**Author:** SolarClose Development Team  
**Contact:** https://teycirbensoltane.tn
