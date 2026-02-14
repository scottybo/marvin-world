#!/bin/bash
# Deploy Marvin's World to marvinslab.com/world/

set -e

echo "🤖 Deploying Marvin's World..."

# Check we have the SSH key
if [ ! -f ~/.ssh/marvin_lab ]; then
    echo "❌ SSH key not found"
    exit 1
fi

# Deploy to /world/ subfolder
echo "📤 Uploading to marvinslab.com/world/..."
scp -i ~/.ssh/marvin_lab -o StrictHostKeyChecking=no \
    index.html \
    marvinssh@marvinslab.tempurl.host:site/public_html/world/index.html

echo "✅ Deployed to https://marvinslab.com/world/"
echo "🌍 World is live"
