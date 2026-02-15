#!/bin/bash
# Capture screenshot before 2am build session
# Starts embodied simulation, waits for 1 screenshot (5min), then stops and cleans up old ones

SCREENSHOT_DIR="/home/scott/marvin-world/logs/screenshots"
KEEP_COUNT=1

echo "Starting embodied simulation for screenshot capture..."
sudo systemctl start marvin-world-embodied

# Wait for 5 minutes (captures 1 screenshot)
echo "Waiting 5 minutes for screenshot capture..."
sleep 300

echo "Stopping embodied simulation..."
sudo systemctl stop marvin-world-embodied

# Clean up old screenshots, keep only the most recent KEEP_COUNT
echo "Cleaning up old screenshots (keeping last $KEEP_COUNT)..."
cd "$SCREENSHOT_DIR"
ls -t *.jpg 2>/dev/null | tail -n +$((KEEP_COUNT + 1)) | xargs -r rm -f

REMAINING=$(ls -1 *.jpg 2>/dev/null | wc -l)
echo "Screenshot capture complete. $REMAINING screenshots in $SCREENSHOT_DIR"
