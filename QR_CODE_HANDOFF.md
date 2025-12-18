# QR Code Handoff

## Overview

Generate QR codes that clients can scan to view their solar proposal on their own device. Zero backend, pure client-side data encoding.

## Features

✅ **One Library** - Only `qrcode.react` (~3KB)  
✅ **No Backend** - Data encoded in URL  
✅ **Offline-Ready** - Works after initial load  
✅ **Multi-Language** - Preserves language preference  
✅ **Privacy-First** - No tracking, no server storage  

## How It Works

### For Sales Reps

1. **Fill Lead Details**: Enter client information
2. **Click "📱 QR Code"**: Opens QR modal
3. **Show to Client**: Display QR on screen
4. **Client Scans**: Opens proposal on their phone

### Technical Implementation

**Data Encoding**
```typescript
const shareData = {
  clientName, address, systemSizeKw, systemCost,
  currentMonthlyBill, twentyFiveYearSavings,
  breakEvenYear, companyName, companyPhone,
  salesRep, language, currency
};
const encoded = btoa(JSON.stringify(shareData));
const url = `${baseUrl}?data=${encoded}`;
```

**QR Generation**
- Library: `qrcode.react`
- Format: SVG (scalable)
- Size: 256x256px
- Error correction: Level H (30% recovery)

**Data Loading**
- URL params parsed on page load
- Data auto-populated into form
- URL cleared after load for privacy

## Code Size

- `QRCodeHandoff.tsx`: ~100 lines
- URL handler in `page.tsx`: ~15 lines
- Translations: 5 keys × 5 languages = 25 lines
- **Total: ~140 lines + 3KB library**

## URL Length

**Typical Lead**: 500-1,000 characters  
**Browser Limit**: 2,000-8,000 characters  
**Mitigation**: Only essential fields encoded  
**Future**: Add lz-string compression if needed (3KB, saves 50-70%)

## Use Cases

### 1. Door-to-Door Sales
Show QR on tablet, client scans and reviews at home with family.

### 2. Trade Shows
Quick handoff without paper or email collection.

### 3. Follow-Ups
Resend updated proposals instantly via new QR code.

### 4. Multi-Language Markets
QR preserves language, Spanish clients see Spanish interface.

## Privacy & Security

- **No Server Storage**: Data in URL only
- **No Tracking**: No analytics on scans
- **Client-Side Only**: All processing in browser
- **Temporary**: URL params cleared after load

## Browser Compatibility

- ✅ iOS Safari (native QR scanning)
- ✅ Android Chrome (native QR scanning)
- ✅ All modern browsers

## Troubleshooting

**QR Won't Scan**
- Increase screen brightness
- Hold phone 6-12 inches away
- Ensure good lighting

**Data Not Loading**
- Check internet connection
- Verify all required fields filled

**URL Too Long Error**
- Reduce notes/description length
- Contact support for compression option

## Support

For issues or questions:
- Contact: https://teycirbensoltane.tn
- See: [README.md](README.md) for general info
