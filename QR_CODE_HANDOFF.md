# QR Code Handoff

## Overview

Simple QR code that directs clients to the SolarClose website. The modal displays the website URL and shows clients exactly what values to enter.

## How It Works

### For Sales Representatives

1. Fill in client details and system information
2. Click "📱 QR Code" button
3. Show the modal to client
4. Client scans QR code

### For Clients

1. Scan QR code with phone camera
2. Website opens automatically
3. Enter the values shown in the modal:
   - Name
   - System Size (kW)
   - System Cost
   - Monthly Bill
   - Company Name
4. View savings calculations

## What's in the Modal

- **QR Code**: Scans to https://solarclose.pages.dev
- **Instructions**: "Client will enter:"
- **Key Values**:
  - Client Name
  - System Size (kW)
  - System Cost ($)
  - Monthly Bill ($)
  - Company Name
- **Flow**: "Client scans QR → Opens website → Enters values above"

## Benefits

✅ **Always Works** - Simple URL, no encoding issues  
✅ **Clear Instructions** - Client sees exactly what to enter  
✅ **No Complexity** - Just a website URL  
✅ **Smaller QR** - Easier to scan  
✅ **Privacy** - No data in URL  

## Technical Details

**QR Code Contains**: Only the website URL (https://solarclose.pages.dev)  
**Format**: SVG  
**Error Correction**: Medium (Level M)  
**Size**: 256x256 pixels  
**Library**: qrcode.react  

## Use Cases

1. **Door-to-Door**: Show QR, client scans and enters values
2. **Trade Shows**: Quick website access for prospects
3. **Follow-Ups**: Share updated proposal values
4. **Website Sharing**: Fastest way to get clients to the site

## Why This Approach?

**Old Way** (Removed):
- Encoded 20+ fields in URL
- Complex base64 encoding
- URL length issues
- Unreliable

**New Way** (Simple):
- Just website URL
- Manual entry
- Always works
- Clear and transparent

## Troubleshooting

**QR Won't Scan**:
- Ensure good lighting
- Hold phone 6-12 inches from screen
- Increase screen brightness

**Website Doesn't Open**:
- Check internet connection
- Type URL manually: https://solarclose.pages.dev
