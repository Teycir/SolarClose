# SolarClose - The Offline-First Solar Calculator

![SolarClose Screenshot](/Assets/screencapture.png)

![Solar](https://img.shields.io/badge/Solar-Energy-facc15?style=flat-square)
![Privacy](https://img.shields.io/badge/Privacy-100%25_Local-green?style=flat-square)
![Offline](https://img.shields.io/badge/Offline-Ready-blue?style=flat-square)
![License](https://img.shields.io/badge/License-BSL_1.1-red?style=flat-square)

🌟 **Start Using Now**: <https://solarclose.pages.dev>

**The Solar Sales Tool That Respects Your Data.**

Most solar software runs in the cloud, meaning they own your leads. **SolarClose is different.** It runs entirely on your iPad/Laptop.

We use a **Business Source License (BSL)**, which means:

1. **100% Transparency:** All source code is public. Your IT team can audit it to prove **zero data leaves the device.**
2. **Free for Individuals:** Independent reps can use it forever.
3. **Auditable Security:** You don't have to trust us—you can verify us.

📚 **Documentation**: [Features](FEATURES.md) | [Calculation Details](CALCULATIONS.md) | [PWA Setup](PWA_SETUP.md)

---

## 💰 Why Top Closers Use SolarClose

✅ **Works Offline** - Close deals in basements or rural areas without signal  
✅ **Instant ROI** - Show 25-year savings while you're still talking. No loading screens  
✅ **Privacy Guaranteed** - Your leads live on your device. We never see them  
✅ **Professional PDF Proposals** - Generate branded PDFs your customers can share  
✅ **"Kitchen Table" Ready** - Beautiful glass-morphism design that looks expensive  
✅ **Fully Multi-Language** - Complete UI, PDFs, and calculations in English, Spanish, Italian, French, and German  
✅ **Visual 25-Year Chart** - Show cumulative savings over time with break-even point highlighted  
✅ **Quick Copy Summary** - One-click to copy talking points for texting prospects  
✅ **Smart Lead Tracking** - "Last Contacted" timestamps prevent duplicate visits  
✅ **Psychological Sales Tools** - Visual progress bars, animated counters, and "Confetti" celebrations for big savings

---

## 📱 How It Works

### **1. Enter Customer Info**

Type in the name and address. Everything auto-saves to your device's local storage.

### **2. Build the System**

Input system size (kW), total cost, and current electric bill.

### **3. Show the Savings**

Instantly display:

- Monthly payment swap (Old Bill vs. Solar + Loan)
- 25-Year Total Savings with visual chart
- Break-even point (ROI) highlighted on timeline
- Environmental impact (CO₂ offset, trees planted equivalent)
- One-click "Copy Summary" to text prospects

### **4. Close the Deal**

Click **"Export PDF"** to generate:

- **Client Proposal:** A clean, branded PDF for the homeowner (in their language)
- **Sales Sheet:** A detailed technical breakdown for your records

### **5. Track & Follow Up**

- **Last Contacted** timestamps on every lead
- Never knock the same door twice by mistake
- Prioritize follow-ups at a glance

---

## 🎯 Perfect For

- **Door-to-Door Reps:** No signal? No problem. Works 100% offline
- **Multi-Language Markets:** Serve Spanish, Italian, French, and German customers with native-language proposals
- **Privacy-Conscious Teams:** Stop feeding your lead data to SaaS aggregators
- **Speed Closers:** When you don't have 15 minutes to wait for a complex CAD design
- **Text-First Closers:** Copy formatted savings to text prospects instantly

---

## 💡 Calculation Methodology (Auditable)

We don't hide our math. We use realistic, conservative numbers to build trust:

- **Real Efficiency**: 80% derating (accounts for weather/shade/inverter loss)
- **Degradation**: 0.5% annual panel output decline
- **Maintenance Buffer**: Optional $150/yr maintenance factor
- **Inverter Replacement**: Factored at Year 12 & 24 (customizable)
- **Inflation**: 4% annual utility rate increase (customizable)

_Want to check the math? [Read the Code.](https://github.com/Teycir/SolarClose/blob/main/src/lib/calculations.ts)_

---

## 🌍 Multi-Language Support

**Fully localized in 5 languages** - Not just the UI, but everything:

- 🇺🇸 **English** - Complete interface, PDFs, and calculations
- 🇪🇸 **Spanish (Español)** - Perfect for US Hispanic markets and Latin America
- 🇮🇹 **Italian (Italiano)** - Serve Italian-speaking customers
- 🇫🇷 **French (Français)** - For French-speaking markets
- 🇩🇪 **German (Deutsch)** - Complete German localization

**What's translated:**
- ✅ Entire user interface
- ✅ PDF proposals (client-facing)
- ✅ PDF sales sheets (internal)
- ✅ All form labels and buttons
- ✅ Error messages and tooltips
- ✅ Currency formatting ($/€)
- ✅ Date formatting (US/EU styles)

**Switch languages instantly** - One click in the top-left corner. Your leads remember their language preference.

---

## 🔒 Security & Backup

**Your Data, Your Device.**

- **Local Storage:** All data persists in your browser. Clearing cookies clears data
- **JSON Backup:** Click "Backup" to download a universal JSON file of your leads
- **Cloud Freedom:** Save that backup to _your_ Google Drive, not ours

---

## 📜 License & Pricing

**SolarClose is Source-Available under the Business Source License (BSL) 1.1.**

### 🟢 Free for Individuals

Are you an individual sales rep or a homeowner?

- **Cost:** $0
- **Usage:** Unlimited personal use
- **Requirement:** None. Enjoy the tool

### 🏢 Commercial / White Label

Are you a Solar Company, Dealer, or Team Lead?

- **Usage:** If you want to deploy this to a team, white-label it with your branding, or integrate it into your CRM
- **Cost:** Requires a Commercial License
- **Benefits:**
  - Your Company Logo & Colors
  - Custom Incentives/Loan Products pre-loaded
  - Centralized Team Deployment

**[Contact us for a Commercial License](https://teycirbensoltane.tn)**

---

## 📲 Developers (Run it Locally)

```bash
# Clone the repository
git clone https://github.com/Teycir/SolarClose.git

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**PWA Features**: SolarClose is a Progressive Web App. See [PWA_SETUP.md](PWA_SETUP.md) for installation and offline capabilities.

---

© 2025 SolarClose.
Code becomes Open Source (Apache 2.0) on **Jan 1, 2029**.
[View Full License](LICENSE)

Made by Teycir - <https://teycirbensoltane.tn>
