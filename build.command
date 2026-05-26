#!/bin/bash
set -e
cd "$(dirname "$0")/pmos-oversight"
echo "📦 Installing dependencies..."
npm install --no-audit --no-fund
echo "🔨 Building PMOS Oversight..."
npm run build
echo "✅ Build complete — apps/web/dist/ is ready for deployment"
