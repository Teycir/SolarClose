#!/bin/bash
set -e

export NEXT_PUBLIC_BUILD_ID=$(date +%s)
echo "Building fresh with ID: $NEXT_PUBLIC_BUILD_ID"
npm run build

echo "Deploying to stable (main branch)..."
npx wrangler pages deploy out --project-name=solarclose --branch=main --commit-dirty=true

echo "Purging Cloudflare cache..."
sleep 2
curl -X POST "https://solarclose.pages.dev/cdn-cgi/purge" 2>/dev/null || true

echo "✅ Stable deployment complete! Clear your browser cache (Ctrl+Shift+R) to see changes."
