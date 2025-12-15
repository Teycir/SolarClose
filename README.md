# SolarClose - Solar ROI Calculator

🌟 **Live App**: https://solarclose.pages.dev

Professional PWA for solar sales representatives to calculate ROI and generate branded proposals.

## ✨ Features

✅ **Offline-First** - Works without internet using IndexedDB  
✅ **Real-Time Calculations** - Instant 25-year savings projections  
✅ **Auto-Save** - Debounced saves every 500ms  
✅ **PDF Export** - Professional proposals with company branding  
✅ **Mobile Responsive** - Optimized for phones, tablets, and desktop  
✅ **Solar Theme** - Beautiful sun-inspired gradient design  
✅ **Company Personalization** - Custom branding in proposals  

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS with custom solar theme
- **Offline**: Serwist (Service Workers) + IndexedDB
- **PDF**: jsPDF for client-side generation
- **Deployment**: Cloudflare Pages

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/solarclose.git
cd solarclose
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 Mobile Optimized

- Touch-friendly interface
- Responsive design for all screen sizes
- Perfect for field sales on tablets and phones
- iOS Safari optimized inputs

## 🎨 Design

- **Gold Theme**: Professional solar industry colors
- **Sun Gradients**: Eye-pleasing background with solar inspiration
- **Glass Morphism**: Semi-transparent cards with backdrop blur
- **Dark/Light Mode**: Automatic theme switching

## 📄 PDF Features

- Company branding in header
- Professional layout with solar theme
- Client information and system details
- 25-year savings highlight
- Automatic filename generation

## 🧮 Calculation Methodology

Accurate 25-year ROI projections using industry-standard assumptions:

- **Performance Ratio**: 80% real-world efficiency (accounts for shading, temperature, soiling, inverter losses)
- **Panel Degradation**: 0.5% annually from year 1 baseline
- **Maintenance Costs**: $150/year base (inflates with utility rates)
- **Inverter Replacement**: ~$300/kW at year 13
- **Federal Tax Credit**: Configurable % (default 30%)
- **State Incentives**: Configurable $ amount
- **Utility Rate Inflation**: Configurable % (default 4%)
- **Net System Cost**: Accounts for all incentives before calculating payback

## 🔒 License

**Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)**

### You are free to:
- **Share** — copy and redistribute the material in any medium or format

### Under the following terms:
- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made
- **NonCommercial** — You may not use the material for commercial purposes
- **NoDerivatives** — If you remix, transform, or build upon the material, you may not distribute the modified material
- **No additional restrictions** — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits

**Commercial licensing available upon request.**

For commercial use, custom development, or licensing inquiries, please contact the author.

---

© 2024 SolarClose. All rights reserved.
