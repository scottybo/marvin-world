#!/bin/bash
# Deploy Marvin's World to marvinslab.com (as the homepage)

set -e

echo "🤖 Deploying Marvin's World..."

# Check we have the SSH key
if [ ! -f ~/.ssh/marvin_lab ]; then
    echo "❌ SSH key not found"
    exit 1
fi

# Deploy the world as homepage
echo "📤 Uploading to marvinslab.com..."
scp -i ~/.ssh/marvin_lab -o StrictHostKeyChecking=no \
    index.html \
    marvinssh@marvinslab.tempurl.host:site/public_html/index.html

echo "✅ Deployed to https://marvinslab.com/"
echo "🌍 World is live (homepage)"
