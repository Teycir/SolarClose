# Quick Start Guide

## New Features

### 📱 QR Code Handoff
**Button**: "📱 QR Code" (top action bar)  
**Purpose**: Share proposal with client via QR scan  
**Result**: Client views proposal on their phone  
**Docs**: [QR_CODE_HANDOFF.md](QR_CODE_HANDOFF.md)

### ✍️ Digital Signature
**Button**: "✍️ Signature" (top action bar)  
**Purpose**: Capture client signature  
**Result**: Signature appears in PDF exports  
**Docs**: [SIGNATURE_CAPTURE.md](SIGNATURE_CAPTURE.md)

## Workflow

1. **Create Lead**: Click "➕ New"
2. **Fill Details**: Enter client info and system details
3. **Get Signature**: Click "✍️ Signature" → Client signs
4. **Share**: Click "📱 QR Code" → Client scans
5. **Export**: Click "📄 Export" → Generate PDFs

## Build & Deploy

```bash
npm install          # Install dependencies (includes qrcode.react)
npm run build        # Build for production
npm run dev          # Run development server
```

## Documentation

- [README.md](README.md) - Main documentation
- [QR_CODE_HANDOFF.md](QR_CODE_HANDOFF.md) - QR code feature
- [SIGNATURE_CAPTURE.md](SIGNATURE_CAPTURE.md) - Signature feature
- [FEATURES_ADDED.md](FEATURES_ADDED.md) - Summary of new features
