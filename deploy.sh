#!/bin/bash
# Deploy Marvin's World to marvinslab.com

set -e

echo "🤖 Deploying Marvin's World..."

# Check we have the SSH key
if [ ! -f ~/.ssh/marvin_lab ]; then
    echo "❌ SSH key not found"
    exit 1
fi

# Deploy the world
echo "📤 Uploading to marvinslab.com..."
scp -i ~/.ssh/marvin_lab -o StrictHostKeyChecking=no \
    index.html \
    marvinssh@marvinslab.tempurl.host:site/public_html/marvin-world/index.html

echo "✅ Deployed to https://marvinslab.com/marvin-world/"
echo "🌍 World is live"
