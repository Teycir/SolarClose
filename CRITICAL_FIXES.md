# Critical Fixes - Calculation Update Issues

## Problem
Calculations and charts were not updating when input fields (like current monthly bill) were changed.

## Root Causes Identified

### 1. Conditional Update Check in CalculatorForm
**Issue**: The `useEffect` in `CalculatorForm.tsx` had a condition that only called `onUpdate` if the calculated values were different from the stored values. This could cause issues when:
- The same result was calculated but inputs changed
- Race conditions between state updates
- React's reconciliation didn't detect the change

**Fix**: Removed the conditional check and always call `onUpdate` when dependencies change.

```typescript
// BEFORE (BAD)
if (results.twentyFiveYearSavings !== data.twentyFiveYearSavings || results.breakEvenYear !== data.breakEvenYear) {
  onUpdate({ ... });
}

// AFTER (GOOD)
onUpdate({
  twentyFiveYearSavings: results.twentyFiveYearSavings,
  breakEvenYear: results.breakEvenYear,
  yearlyBreakdown: results.yearlyBreakdown,
});
```

### 2. Missing onUpdate in Dependency Array
**Issue**: The `useEffect` dependency array didn't include `onUpdate`, which violates React's exhaustive-deps rule.

**Fix**: Added `onUpdate` to the dependency array.

### 3. SavingsChart Recalculating Instead of Using Cached Data
**Issue**: `SavingsChart.tsx` was calling `calculateSolarSavings()` independently, which:
- Caused duplicate calculations
- Was missing the `has25YearInverterWarranty` parameter
- Could show inconsistent data if calculations differed

**Fix**: 
- Added `yearlyBreakdown` to `SolarLead` type
- Store `yearlyBreakdown` in `CalculatorForm` updates
- Use cached `data.yearlyBreakdown` in `SavingsChart` instead of recalculating

### 4. BillSwapComparison Using Hardcoded Interest Rate
**Issue**: `BillSwapComparison.tsx` used a hardcoded `DEFAULT_LOAN_INTEREST_RATE = 0.0699` instead of `data.loanInterestRate`.

**Fix**: Use `data.loanInterestRate || 6.99` and handle zero interest rate case properly.

## Files Modified

1. **src/types/solar.ts**
   - Added `yearlyBreakdown` optional field to cache calculation results

2. **src/components/CalculatorForm.tsx**
   - Removed conditional update check
   - Added `onUpdate` to dependency array
   - Store `yearlyBreakdown` in updates

3. **src/components/SavingsChart.tsx**
   - Removed `calculateSolarSavings` import
   - Use cached `data.yearlyBreakdown` instead of recalculating

4. **src/components/BillSwapComparison.tsx**
   - Use `data.loanInterestRate` instead of hardcoded value
   - Handle zero interest rate case

5. **src/hooks/useSolarLead.ts**
   - Include `yearlyBreakdown` in default lead creation

## Verification Checklist

✅ All range inputs call `onUpdate` with `Number(e.target.value)`
✅ All select inputs call `onUpdate` with proper values
✅ All text inputs call `onUpdate` with sanitized values
✅ All checkbox inputs call `onUpdate` with boolean values
✅ CalculatorForm useEffect has all input dependencies
✅ CalculatorForm always calls onUpdate (no conditional)
✅ SavingsChart uses cached data (no recalculation)
✅ BillSwapComparison uses data.loanInterestRate
✅ yearlyBreakdown is stored and cached properly

## Input Fields Verified

### SystemDetailsSection
- ✅ currentMonthlyBill (range)
- ✅ yearlyInflationRate (range)
- ✅ systemSizeKw (range)
- ✅ systemCost (range)
- ✅ electricityRate (range)
- ✅ sunHoursPerDay (range)
- ✅ federalTaxCredit (range)
- ✅ stateIncentive (range)
- ✅ has25YearInverterWarranty (checkbox)

### PropertyFinancialSection
- ✅ leadStatus (select)
- ✅ propertyType (select)
- ✅ financingOption (select)
- ✅ downPayment (range, conditional)
- ✅ loanTerm (range, conditional)
- ✅ loanInterestRate (range, conditional)
- ✅ roofType (select)
- ✅ roofCondition (select)
- ✅ utilityProvider (text)
- ✅ avgKwhPerMonth (number)
- ✅ notes (textarea)

### ClientInfoSection
- ✅ date (date)
- ✅ clientName (text)
- ✅ address (text)
- ✅ phone (tel)
- ✅ email (email)

### CompanyInfoSection
- ✅ companyName (text)
- ✅ companyPhone (tel)
- ✅ companyEmail (email)
- ✅ companyLogo (file)
- ✅ productDescription (textarea)
- ✅ salesRep (text)
- ✅ proposalConditions (textarea)

## Testing Instructions

1. Open the app and create a new lead
2. Change the "Current Monthly Bill" slider
3. Verify that:
   - The 25-year savings updates immediately
   - The chart redraws with new data
   - The break-even year updates
   - The ROI percentage updates
   - The bill comparison updates (if using loan)
4. Test all other input fields to ensure calculations update
5. Switch between Cash and Loan financing options
6. Verify loan payment calculations use the correct interest rate

## Prevention Measures

1. **Never use conditional updates in useEffect** - Always call onUpdate when dependencies change
2. **Always include callback functions in dependency arrays** - Follow React's exhaustive-deps rule
3. **Cache expensive calculations** - Store results in state, don't recalculate in multiple components
4. **Use data props, not recalculate** - Components should use cached data from props
5. **Verify all inputs call onUpdate** - Every input must trigger state updates
6. **Test all input fields** - Ensure every field triggers recalculation when changed

## Deployment

- Committed: `a8e19d7`
- Deployed: https://solarclose.pages.dev
- Status: ✅ Live and verified
