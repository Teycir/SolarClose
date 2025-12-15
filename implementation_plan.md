# Project Blueprint: SolarClose (Offline-First PWA)

## 1. Executive Summary
We are building a "high-performance, offline-first ROI Calculator" for Solar Sales Representatives.
**The Problem:** Sales reps lose deals in rural areas/basements due to bad internet. CRM apps fail.
**The Solution:** A Local-First PWA that captures data, calculates financial savings, and generates a PDF contract/proposal instantly—without internet.
**The Business Model:** Free to calculate -> Paid ($99 Lifetime) to export PDF & Custom Branding.

## 2. Technical Stack (Strict Constraints)
*   **Framework:** Next.js 14+ (App Router, TypeScript).
*   **Platform:** Cloudflare Pages (Edge Runtime).
*   **PWA Engine:** `@serwist/next` (Service Workers).
*   **Local Database:** `idb` (IndexedDB wrapper) for storing leads/drafts.
*   **UI Library:** Tailwind CSS + Shadcn UI.
*   **PDF Engine:** `@react-pdf/renderer` (Client-side generation).
*   **Icons:** Lucide React.
*   **License:** Closed Source / Proprietary.

---

## 3. Data Structure (Types)

```typescript
// types/solar.ts

export interface SolarLead {
  id: string;
  createdAt: number;
  clientName: string;
  address: string;
  
  // Inputs
  currentMonthlyBill: number; // e.g. 250
  yearlyInflationRate: number; // e.g. 4 (percent)
  systemSizeKw: number; // e.g. 8.5
  systemCost: number; // e.g. 25000
  
  // Calculated Results (Cached)
  twentyFiveYearSavings: number;
  breakEvenYear: number;
  
  // Meta
  isSynced: boolean; // True if pushed to Cloudflare
}
```

---

## 4. Implementation Phase Guide

### Phase 1: Scaffold & Configuration (The Foundation)
**Goal:** A running Next.js app on Cloudflare with PWA enabled.

1.  Initialize Next.js: `npx create-next-app@latest solar-close --typescript --tailwind --eslint`
2.  Install Dependencies:
    ```bash
    npm install idb @serwist/next @serwist/precaching @serwist/sw @react-pdf/renderer clsx tailwind-merge lucide-react
    npm install -D @opennextjs/cloudflare
    ```
3.  **Action:** Configure `serwist` in `next.config.mjs` and create `app/sw.ts` to cache the app shell so it loads offline.

### Phase 2: Core Logic & "The Math"
**Goal:** Pure functions to calculate the ROI.

1.  Create `lib/calculations.ts`.
2.  Implement `calculateSolarSavings(inputs)`:
    *   *Logic:* Compare (Bill * Inflation^Years) vs (System Cost or Loan).
    *   Return a breakdown for a chart (Year 1 vs Year 25).

### Phase 3: The "Offline-First" Data Hook
**Goal:** A React hook that saves to IndexedDB on every keystroke.

1.  Create `hooks/useSolarLead.ts`.
2.  **Requirement:**
    *   On mount: Load data from `idb` using the lead ID.
    *   On change: Debounce save (500ms) to `idb`.
    *   Expose `isSaving` state to UI.

### Phase 4: The UI (Shadcn + Tailwind)
**Goal:** A dark-mode, high-contrast dashboard that looks good on an iPad.

1.  Install Shadcn components: `card`, `slider`, `input`, `button`, `tabs`.
2.  Create `components/CalculatorForm.tsx`:
    *   Big sliders for "Monthly Bill".
    *   Real-time number crunching (updates as you slide).
3.  Create `components/ResultsCard.tsx`:
    *   Big green text showing "25 Year Savings".
    *   A visual graph (simple CSS bars or Recharts) showing the gap between Utility vs Solar.

### Phase 5: The "Money" Feature (PDF Export)
**Goal:** The Paywall.

1.  Create `components/pdf/ProposalDocument.tsx` using `@react-pdf/renderer`.
    *   Layout: Cover Page (Image), Savings Breakdown, Legal Text.
2.  Create the "Export" button.
    *   *Logic:* Check `isProUser` (mock boolean for now).
    *   If `false`: Show Modal "Upgrade to Pro to download Proposal".
    *   If `true`: Generate blob and download.

---

## 5. Specific Prompts for the LLM

*Copy and paste these into your chat to guide the AI step-by-step.*

**Prompt 1 (Setup):**
> "Initialize the project structure. Configure `next.config.mjs` with Serwist for PWA support. Create the `manifest.json` with a 'standalone' display mode. Ensure the service worker caches the app shell so `/` works without internet."

**Prompt 2 (The Hook):**
> "Create a custom hook `useOfflineLead(leadId)` using the `idb` library. It should initialize an IndexedDB store called 'solar-leads'. It must load data on mount and debounce-save updates to the local DB. Return `data`, `setData`, and `saveStatus`."

**Prompt 3 (The Math):**
> "Write the business logic in `lib/calculations.ts`. I need a function that takes Current Bill, Inflation Rate (4%), and System Cost. It should project utility costs over 25 years vs solar costs. Return the total 25-year savings amount."

**Prompt 4 (The PDF):**
> "Create a PDF component using `@react-pdf/renderer`. It should accept the calculated data. The design should look professional: A header with a placeholder logo, a summary table of the savings, and a signature line at the bottom. Create a 'Download' button that renders this PDF on the client side."

---

## 6. Deployment Checklist (Cloudflare)

*   [ ] Run `npm run build` locally to check for Type errors.
*   [ ] Push to GitHub (Private Repo).
*   [ ] Connect to Cloudflare Pages.
*   [ ] **Build Command:** `npx @opennextjs/cloudflare`
*   [ ] **Output Directory:** `.open-next/assets` (verify based on adapter version).
*   [ ] **Compatibility Flag:** Set `nodejs_compat` in Cloudflare settings.