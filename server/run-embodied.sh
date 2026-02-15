#!/bin/bash
# Run embodied simulation with virtual display
# Uses Xvfb to provide X11 display for WebGL rendering

exec xvfb-run --auto-servernum --server-args="-screen 0 1280x720x24" node embodied-simulation.js
