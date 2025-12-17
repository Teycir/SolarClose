# PWA Setup Guide for SolarClose

## ✅ What's Been Configured

### 1. Service Worker Setup
- **Serwist** integration in `next.config.mjs`
- Service worker source: `src/app/sw.ts`
- Automatic precaching of all static assets
- Runtime caching strategies for dynamic content
- Navigation preload enabled for faster page loads

### 2. Web App Manifest
- Location: `public/manifest.json`
- App name: "SolarClose - Solar ROI Calculator"
- Display mode: `standalone` (full-screen app experience)
- Theme color: `#FFC107` (solar yellow)
- Background color: `#0A0A0A` (dark)
- Icons: 192x192 and 512x512 (regular + maskable)

### 3. PWA Icons Generated
- ✅ `icon-192.png` - Standard app icon
- ✅ `icon-512.png` - High-res app icon
- ✅ `icon-192-maskable.png` - Adaptive icon for Android
- ✅ `icon-512-maskable.png` - High-res adaptive icon

### 4. Offline Support
- All pages cached after first visit
- Works completely offline (airplane mode)
- Offline fallback page: `public/offline.html`

## 🚀 How to Build & Deploy

```bash
# Install dependencies
npm install

# Build the app (generates service worker)
npm run build

# Test locally
npm start
# or serve the out/ directory
npx serve out

# Deploy to Cloudflare Pages
npm run deploy
```

## 📱 How to Install on Devices

### iOS (Safari)
1. Open https://solarclose.pages.dev in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right

### Android (Chrome)
1. Open https://solarclose.pages.dev in Chrome
2. Tap the three-dot menu
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install"

### Desktop (Chrome/Edge)
1. Open https://solarclose.pages.dev
2. Look for the install icon in the address bar (⊕)
3. Click "Install"

## 🧪 Testing PWA Functionality

### Test Offline Mode
1. Open the app in your browser
2. Open DevTools (F12)
3. Go to Application > Service Workers
4. Check "Offline" checkbox
5. Refresh the page - it should still work!

### Test Installation
1. Open DevTools (F12)
2. Go to Application > Manifest
3. Verify all fields are correct
4. Check "Installability" section for any issues

### Lighthouse PWA Audit
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Should score 90+ for PWA

## 🔧 Troubleshooting

### Service Worker Not Updating
```bash
# Clear all caches and rebuild
rm -rf .next out public/sw.js
npm run build
```

### Icons Not Showing
- Ensure all icon files exist in `public/` directory
- Check `manifest.json` paths are correct
- Clear browser cache and reinstall

### App Not Installable
- Must be served over HTTPS (or localhost)
- Check manifest.json is valid JSON
- Ensure service worker is registered
- Icons must be at least 192x192

## 📊 What Gets Cached

### Precached (Available Immediately Offline)
- All HTML pages
- All JavaScript bundles
- All CSS files
- Static assets (images, fonts)
- Manifest and icons

### Runtime Cached (After First Visit)
- API responses (86400s = 24 hours)
- Next.js data files
- Dynamic images
- External fonts (Google Fonts)

## 🎯 Cache Strategies

- **Static Assets**: Cache First (instant load)
- **Pages**: Network First with cache fallback
- **API Calls**: Network First with 10s timeout
- **Images**: Cache First with 30-day expiration
- **Fonts**: Cache First with 7-day expiration

## 🔄 Updates

The service worker automatically:
- Checks for updates on page load
- Downloads new assets in background
- Prompts user to refresh when update is ready
- Uses `skipWaiting` for immediate activation

## 📝 Notes

- The app works 100% offline after first load
- All user data is stored in localStorage (never lost)
- Service worker updates automatically
- No internet required for calculations or PDF generation
- Perfect for door-to-door sales in areas with poor connectivity

## 🌐 Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Desktop & Mobile)
- ✅ Samsung Internet
- ✅ Opera

## 🔒 Security

- Service workers only work over HTTPS
- Cloudflare Pages provides automatic HTTPS
- All cached data is scoped to the origin
- No sensitive data is cached (only UI assets)
