# Digital Signature Capture

## Overview

Capture client signatures directly in the browser using a lightweight HTML5 Canvas implementation. No external signature libraries, no bloat - just native browser APIs.

## Features

✅ **Zero Dependencies** - Pure HTML5 Canvas, no signature-pad or react-signature-canvas  
✅ **Touch & Mouse** - Works on tablets, phones, and desktops  
✅ **Lightweight** - ~150 lines of code total  
✅ **Offline-First** - Signatures stored as base64 PNG in local storage  
✅ **PDF Integration** - Automatically included in client proposals  
✅ **Multi-Language** - UI translated in 5 languages  

## How It Works

### For Sales Reps

1. **Fill Lead Details**: Enter client information
2. **Click "✍️ Signature"**: Opens signature capture modal
3. **Hand to Client**: Client signs with finger/stylus on screen
4. **Save**: Signature stored with lead data
5. **Export PDF**: Signature appears on client proposal

### Technical Implementation

**Canvas Drawing**
- Native HTML5 Canvas API
- Mouse events: `onMouseDown`, `onMouseMove`, `onMouseUp`
- Touch events: `onTouchStart`, `onTouchMove`, `onTouchEnd`
- Smooth lines with `lineCap: 'round'` and `lineJoin: 'round'`

**Data Storage**
- Signature converted to base64 PNG: `canvas.toDataURL('image/png')`
- Stored in `SolarLead.clientSignature` field
- Persisted to IndexedDB with lead data
- ~5-15KB per signature (typical)

**PDF Integration**
- Signature added to client PDF via jsPDF `addImage()`
- Positioned above footer with client name and date
- 50x15mm size (proportional scaling)

## Code Size

- `SignatureCapture.tsx`: ~150 lines
- `SignatureButton.tsx`: ~50 lines
- Type additions: 1 line
- Translations: 6 keys × 5 languages = 30 lines
- **Total: ~230 lines** (vs 2,000+ with signature-pad library)

## Browser Compatibility

- ✅ Chrome/Edge (desktop & mobile)
- ✅ Safari (iOS & macOS)
- ✅ Firefox (desktop & mobile)
- ✅ All modern browsers with Canvas support

## Use Cases

### 1. Door-to-Door Sales
Client signs on your tablet before you leave. Signature included in PDF proposal.

### 2. Trade Shows
Quick signature capture for interested prospects. No paper contracts needed.

### 3. Virtual Sales
Screen share, client signs on their device, you see it in real-time (if using shared lead).

### 4. Legal Documentation
Timestamped signature with date for compliance and record-keeping.

## Data Format

**Stored Format**
```typescript
clientSignature?: string; // "data:image/png;base64,iVBORw0KGgoAAAANS..."
```

**Size**
- Empty canvas: 0 bytes
- Simple signature: 5-10 KB
- Complex signature: 10-20 KB
- Average: ~8 KB

## Privacy & Security

- **Local Storage Only**: Signatures never leave device
- **No Cloud Upload**: Stored in IndexedDB with lead data
- **Client Control**: Client can clear and re-sign
- **Timestamped**: Date recorded with signature

## Limitations

- **Canvas Size**: Fixed at 256px height (responsive width)
- **No Pressure Sensitivity**: Basic line drawing only
- **PNG Only**: No vector format (keeps it simple)
- **Single Signature**: One signature per lead (can be replaced)

## Future Enhancements

Potential improvements (if needed):
- [ ] Variable line width based on speed
- [ ] Undo/redo functionality
- [ ] Signature verification/comparison
- [ ] Multiple signatures (client + co-signer)
- [ ] SVG export for scalability

## Comparison: Native vs Libraries

### Our Implementation (Native Canvas)
- **Size**: ~230 lines of code
- **Bundle**: 0 KB (native APIs)
- **Features**: Draw, clear, save, touch/mouse
- **Complexity**: Simple, easy to maintain

### signature-pad Library
- **Size**: 2,000+ lines
- **Bundle**: ~15 KB minified
- **Features**: Pressure sensitivity, velocity, bezier curves
- **Complexity**: Advanced, harder to customize

### Verdict
For SolarClose's use case (simple signature capture), native Canvas is perfect. No need for advanced features like pressure sensitivity or velocity-based line width.

## Troubleshooting

**Signature Won't Draw**
- Ensure touch events are enabled
- Check if canvas is properly sized
- Verify `touch-none` class is applied

**Signature Looks Pixelated in PDF**
- Canvas resolution is 2x device pixel ratio
- PNG compression is lossless
- Should look crisp at normal viewing size

**Signature Not Saving**
- Check if canvas is empty (isEmpty state)
- Verify base64 data is generated
- Ensure lead is saved after signature capture

## API Reference

### SignatureCapture Component

```typescript
interface SignatureCaptureProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
  language?: Language;
  existingSignature?: string;
}
```

**Props**
- `onSave`: Callback with base64 PNG data URL
- `onCancel`: Callback when user cancels
- `language`: UI language (default: 'en')
- `existingSignature`: Pre-load existing signature

**Methods**
- `startDrawing()`: Begin drawing path
- `draw()`: Continue drawing path
- `stopDrawing()`: End drawing path
- `clear()`: Clear canvas
- `save()`: Export as base64 PNG

### SignatureButton Component

```typescript
interface SignatureButtonProps {
  data: SolarLead;
  onUpdate: (updates: Partial<SolarLead>) => void;
}
```

**Visual States**
- No signature: Yellow gradient button "✍️ Signature"
- Has signature: Green button "✓ Signed"

## Support

For issues or questions:
- Contact: https://teycirbensoltane.tn
- See: [README.md](README.md) for general info
