#!/bin/bash
# Test embodied simulation - run for 2 minutes and check output

echo "🤖 Testing embodied simulation..."
echo "This will run for 2 minutes and capture resources"
echo ""

cd /home/scott/marvin-world/server

# Kill any existing simulation
pkill -f embodied-simulation.js 2>/dev/null

# Start simulation in background
node embodied-simulation.js &
SIM_PID=$!

echo "Started simulation (PID: $SIM_PID)"
echo "Waiting 2 minutes..."
echo ""

# Wait 2 minutes
sleep 120

# Stop simulation
kill $SIM_PID 2>/dev/null

echo ""
echo "Test complete. Checking outputs..."
echo ""

# Check perception logs
if [ -f "../logs/perceptions/$(date +%Y-%m-%d).jsonl" ]; then
    PERCEPTION_COUNT=$(wc -l < "../logs/perceptions/$(date +%Y-%m-%d).jsonl")
    echo "✅ Perception logs: $PERCEPTION_COUNT entries"
    echo "   Last entry:"
    tail -n 1 "../logs/perceptions/$(date +%Y-%m-%d).jsonl" | jq '.'
else
    echo "❌ No perception log found"
fi

echo ""

# Check screenshots
SCREENSHOT_COUNT=$(ls -1 ../logs/screenshots/ 2>/dev/null | wc -l)
if [ $SCREENSHOT_COUNT -gt 0 ]; then
    echo "✅ Screenshots: $SCREENSHOT_COUNT captured"
    echo "   Latest:"
    ls -lt ../logs/screenshots/ | head -n 2
else
    echo "❌ No screenshots captured"
fi

echo ""

# Check resource log
if [ -f "../logs/resources.jsonl" ]; then
    echo "✅ Resource monitoring active"
    echo "   Last check:"
    tail -n 1 "../logs/resources.jsonl" | jq '.'
else
    echo "❌ No resource log found"
fi

echo ""
echo "Test complete. Review output above."
echo "If successful, install as service with:"
echo "  sudo cp marvin-world-embodied.service /etc/systemd/system/"
echo "  sudo systemctl enable marvin-world-embodied"
echo "  sudo systemctl start marvin-world-embodied"
