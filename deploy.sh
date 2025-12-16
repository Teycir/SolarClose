#!/bin/bash
set -e

echo "🧹 Cleaning previous builds..."
rm -rf .next out

echo "🔨 Building Next.js app..."
npm run build

echo "📦 Deploying to Cloudflare Pages..."
npx wrangler pages deploy out \
  --project-name=solarclose \
  --commit-dirty=true

echo "✅ Deployment complete!"
echo "🌐 Main URL: https://solarclose.pages.dev"
