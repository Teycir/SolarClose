#!/bin/bash
set -e

export NEXT_PUBLIC_BUILD_ID=$(date +%s)
echo "Building with ID: $NEXT_PUBLIC_BUILD_ID"
npm run build
npx wrangler pages deploy out --project-name=solarclose --branch=production --commit-dirty=true
