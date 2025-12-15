# Cloudflare Pages Deployment Guide

## Step 1: Build for Cloudflare

```bash
npm run build
npx @opennextjs/cloudflare
```

## Step 2: Deploy to Cloudflare Pages

### Option A: Using Wrangler CLI

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy .open-next/assets --project-name=solar-close
```

### Option B: Using Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Click "Workers & Pages" > "Create application" > "Pages"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build && npx @opennextjs/cloudflare`
   - Build output directory: `.open-next/assets`
   - Environment variables: Add `NODE_VERSION=18` or higher
5. Click "Save and Deploy"

## Step 3: Configure Compatibility

In Cloudflare Pages settings:
- Go to Settings > Functions
- Add compatibility flag: `nodejs_compat`
- Save changes

## Done!

Your app will be live at: `https://solar-close.pages.dev`
