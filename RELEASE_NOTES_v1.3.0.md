# Release Notes - v1.3.0

## 🎉 New Features

### 📱 QR Code Handoff
Share proposals instantly with clients via QR code scanning.

**How to use**:
1. Fill in client details
2. Click "📱 QR Code" button
3. Show QR on screen
4. Client scans with phone
5. Proposal opens on their device

**Technical**: 
- Library: `qrcode.react` (3KB)
- No backend required
- Data encoded in URL
- Privacy-first (URL cleared after load)

### ✍️ Digital Signature Capture
Capture client signatures using native HTML5 Canvas.

**How to use**:
1. Click "✍️ Signature" button
2. Hand device to client
3. Client signs with finger/stylus
4. Save signature
5. Appears automatically in PDF exports

**Technical**:
- Zero dependencies (native Canvas API)
- Touch + mouse support
- Stored as base64 PNG
- ~8KB per signature

## 📊 Impact

- **Bundle Size**: +2KB (197KB total)
- **Dependencies**: +1 (`qrcode.react`)
- **Build**: ✅ Successful
- **Philosophy**: ✅ No-bloat maintained

## 📚 Documentation

- [QR_CODE_HANDOFF.md](QR_CODE_HANDOFF.md) - QR feature guide
- [SIGNATURE_CAPTURE.md](SIGNATURE_CAPTURE.md) - Signature guide
- [QUICK_START.md](QUICK_START.md) - Quick reference
- [FEATURES_ADDED.md](FEATURES_ADDED.md) - Summary

## 🔄 Upgrade Notes

No breaking changes. Simply:
```bash
npm install
npm run build
```

## 🌟 Highlights

- ✅ Both features work 100% offline
- ✅ Zero backend/server requirements
- ✅ Privacy-first (all data stays local)
- ✅ Multi-language support (5 languages)
- ✅ Mobile-optimized (touch support)

---

**Version**: 1.3.0  
**Release Date**: December 2024  
**Live Demo**: https://solarclose.pages.dev
