#!/bin/bash
# Capture screenshots before 2am build session
# Starts embodied simulation, waits for 2 screenshots (10min), then stops

echo "Starting embodied simulation for screenshot capture..."
sudo systemctl start marvin-world-embodied

# Wait for 10 minutes (captures 2 screenshots at 5-min intervals)
echo "Waiting 10 minutes for screenshot capture..."
sleep 600

echo "Stopping embodied simulation..."
sudo systemctl stop marvin-world-embodied

echo "Screenshot capture complete. Check /home/scott/marvin-world/logs/screenshots/"
