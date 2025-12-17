# Changelog

All notable changes to SolarClose will be documented in this file.

## [1.2.3] - 2025-12-XX

### UI/UX Improvements

- 🔄 **Field Reordering**: Moved System Size field above Current Monthly Bill for better workflow
- 📊 **Dynamic Bill Cap**: Monthly bill cap now adapts to both system size and system cost (max increased to $2000)
- ⬇️ **Better Guidance**: Added down arrow emoji to "Increase system size below" message
- 💡 **Improved Readability**: Extracted magic numbers into named constants (DEFAULT_LOAN_TERM, DEFAULT_INTEREST_RATE)

### SEO Optimization

- 🔍 **Structured Data**: Added JSON-LD schema markup for better search engine understanding
- 🌐 **MetadataBase**: Fixed metadataBase warning by setting proper base URL
- 📄 **Complete SEO**: Verified robots.txt, sitemap.xml, Open Graph, and Twitter Cards

### Code Quality

- 🧹 **React Hooks**: Fixed exhaustive-deps warning in GenericDataManager with eslint-disable comment
- 📝 **Code Clarity**: Broke down complex expressions in PropertyFinancialSection and SystemDetailsSection
- ♻️ **Maintainability**: Extracted inline calculations into separate variables for better readability

---

## [1.2.2] - 2025-12-XX

### Code Quality Improvements

- 🔒 **Enhanced Error Handling**: Added comprehensive stack trace logging across all error handlers for better debugging
- 📝 **Improved Readability**: Broke down complex chained method calls and nested ternary operators into separate steps
- 🧹 **Code Maintainability**: Extracted magic numbers and complex expressions into named constants
- 🔐 **Security**: Added log injection prevention to all error messages using newline sanitization
- ♻️ **Refactoring**: Simplified complex logic in translations, currency formatting, PDF generation, and data backup
- 🎯 **Type Safety**: Improved type assertions and error handling patterns throughout codebase

### Technical Details

- Added stack trace logging to error handlers in: useSolarLead.ts, error.tsx, currency.ts
- Extracted CURRENCY_SYMBOLS constant map for better maintainability
- Simplified getTranslation function with explicit conditional checks
- Broke down sanitizeFilename chained operations into separate steps
- Improved DataBackup date formatting readability
- Enhanced PDF generator with clearer variable extraction

---

## [1.2.1] - 2025-12-XX

### Bug Fixes

- 🐛 **Chart Label**: Fixed inverter replacement year display from "Year 13" to "Year 12" in chart footer across all 5 languages

---

## [1.2.0] - 2025-12-XX

### UI/UX Enhancements

- 🎨 **Button Standardization**: Unified all header buttons with consistent yellow/orange gradient, equal sizing (flex-1 min-w-[120px]), and centered layout
- ✨ **Eye Candy Effects**: Added animated number counter for 25-year savings, confetti celebration for >$50k savings, hover lift on cards, diagonal shimmer on buttons (60s), smooth chart animation (2s), and glass morphism
- 🎯 **ROI Display**: Made ROI text green when positive, red when negative, increased to text-base font-bold text-green-700
- 📍 **Layout Improvements**: Moved save status above Save Lead button with fixed height (h-5) to prevent shifts, restructured header with title on own row (mb-8), moved company save button below company name input
- 🔒 **Privacy Messaging**: Added "Your data never leaves your device" tagline below SolarClose header
- 💡 **Export Tooltip**: Added custom tooltip explaining "Generates 2 PDFs: Client Proposal + Internal Sheet" with amber-orange gradient styling matching button design
- 🌐 **Translations**: Added backup, restore, share, saveLead, howItWorks keys for all 5 languages (English, Spanish, Italian, French, German)
- ☀️ **Floating Sun Icon**: Added animated sun icon in header with subtle float animation (6s, 5px movement)

### Fixes

- 🐛 **Export Button**: Fixed cropping issue by removing flex-1 from wrapper div, added it to button element instead
- 🐛 **Tooltip Styling**: Enhanced tooltip with harmonious amber-orange gradient, font-semibold, border, z-50, and shadow-xl for better visibility

### Code Quality

- 🔧 **Error Handling**: Improved error handling across all components with proper type annotations
- 📝 **Readability**: Simplified complex expressions and extracted magic numbers into named constants
- 🧹 **Code Cleanup**: Removed unused parameters and improved maintainability
- 🔒 **Security**: Added log injection prevention to all error messages
- ♻️ **Refactoring**: Extracted complex logic into reusable constants and helper functions
- 📊 **Calculations**: Improved loan amortization formula readability
- 🎯 **Validation**: Enhanced input validation with clearer error handling

### Technical Improvements

- Split long destructuring statements into multiple lines for better readability
- Extracted EMPTY_RESULT constant to reduce code duplication
- Improved error message sanitization throughout the codebase
- Added default values to prevent undefined errors
- Simplified complex ternary expressions
- Enhanced accessibility with proper ARIA attributes
- Added AnimatedNumber and Confetti components for enhanced user experience
- Implemented shimmer-button class with ::after pseudo-element and diagonal gradient (135deg)
- Added keyframe animations: gradient-shift, confetti, shimmer (60s), float (6s)

---

## [1.1.0] - 2025-12-XX

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

**Live App**: <https://solarclose.pages.dev>
**Repository**: <https://github.com/Teycir/SolarClose>
