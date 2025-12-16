# Changelog

All notable changes to SolarClose will be documented in this file.

## [1.1.0] - 2025-01-XX

### Improved
- 🔧 **Calculation Accuracy**: Inverter replacement now occurs every 12 years (years 12 and 24) instead of only year 13
- 💰 **Inflation Applied to Future Costs**: Inverter replacement costs now properly inflated to replacement year
- 📊 **Break-Even Logic**: Returns `null` when system never breaks even instead of misleading "Year 25"
- ✅ **Input Validation**: Added validation for inflation rate (-50% to 50%) and loan term (must be > 0)
- 🔢 **Zero Interest Rate**: Proper handling of 0% interest loans with simple division
- 🎯 **Offset Calculation**: Simplified and corrected solar production offset logic
- 📈 **Savings Chart**: Properly displays "bumps" at inverter replacement years

### Fixed
- 🐛 Removed unused `totalLoanCost` variable
- 🐛 Fixed double-counting of inflation in savings calculations
- 🐛 Corrected year 1 solar cost display (now shows net cost after incentives)
- 🐛 UI components now handle `null` break-even year gracefully (displays "Never")

### Removed
- ❌ Removed unimplemented financing options (Lease/PPA) from interface

### Documentation
- 📚 Added comprehensive `CALCULATION_LOGIC_DOCUMENTATION.md` with:
  - Complete mathematical formulas and examples
  - Expert review responses for all 10 industry questions
  - Edge case handling documentation
  - Validation checklist
- ✅ All numerical examples verified for accuracy
- ✅ Expert review applied with corrections

### Technical
- Updated `SolarCalculationResults` interface with `breaksEvenWithin25Years` boolean flag
- Changed `breakEvenYear` type from `number` to `number | null`
- Enhanced error handling for edge cases

---

## [1.0.0] - 2024-12-15

### Added
- 🎉 Initial release of SolarClose Solar ROI Calculator
- ⚡ Offline-first PWA with IndexedDB storage
- 📊 Real-time 25-year solar savings calculations
- 💾 Auto-save functionality with 500ms debounce
- 📄 PDF export with company branding using jsPDF
- 📱 Mobile-responsive design optimized for all devices
- 🌅 Beautiful sun-themed gradient backgrounds
- 🎨 Gold color scheme with solar industry branding
- ☀️ Custom sun favicon
- 🏢 Company personalization in PDF headers
- ✅ Client name and address validation for exports
- 🔄 Service worker for offline functionality
- 📐 Touch-friendly interface for tablets and phones
- 🌙 Dark/light mode support
- 💎 Glass morphism design with backdrop blur effects

### Technical Features
- Next.js 14 with App Router and TypeScript
- Tailwind CSS with custom solar theme
- Serwist service workers for offline support
- IndexedDB for client-side data persistence
- jsPDF for client-side PDF generation
- Cloudflare Pages deployment ready
- Mobile-first responsive design
- PWA manifest and service worker

### Calculations
- 25-year total savings projections
- Break-even year calculations
- Inflation rate adjustments
- System cost vs utility cost comparisons
- Real-time updates as inputs change

### Export Features
- Professional PDF proposals
- Company branding in headers
- Client information sections
- System details and specifications
- Highlighted savings amounts
- Automatic filename generation

### License
- CC BY-NC-ND 4.0 (Creative Commons Attribution-NonCommercial-NoDerivatives)
- Non-commercial use only
- Commercial licensing available upon request

---

**Live App**: https://solarclose.pages.dev
**Repository**: https://github.com/Teycir/SolarClose