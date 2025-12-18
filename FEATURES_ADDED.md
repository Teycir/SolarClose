# New Features Added

## 1. QR Code Handoff 📱

**What**: Generate QR codes for clients to scan and view proposals on their device

**Implementation**:
- Library: `qrcode.react` (3KB)
- Code: ~140 lines
- Bundle impact: +2KB (after compression)

**Files**:
- `src/components/QRCodeHandoff.tsx`
- `QR_CODE_HANDOFF.md` (docs)

**Usage**: Click "📱 QR Code" button → Show to client → Client scans → Proposal opens on their phone

---

## 2. Digital Signature Capture ✍️

**What**: Capture client signatures using native HTML5 Canvas

**Implementation**:
- Library: None (native Canvas API)
- Code: ~200 lines
- Bundle impact: 0KB

**Files**:
- `src/components/SignatureCapture.tsx`
- `src/components/SignatureButton.tsx`
- `SIGNATURE_CAPTURE.md` (docs)

**Usage**: Click "✍️ Signature" button → Client signs → Save → Appears in PDF

---

## Total Impact

- **Bundle Size**: +2KB (197KB total, was 195KB)
- **Dependencies**: +1 (`qrcode.react`)
- **Code Added**: ~340 lines (excluding docs)
- **Zero Backend**: Both features work offline
- **Privacy-First**: All data stays local

---

## Documentation

- [QR Code Handoff](QR_CODE_HANDOFF.md)
- [Signature Capture](SIGNATURE_CAPTURE.md)
- [Main README](README.md)
