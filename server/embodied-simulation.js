#!/usr/bin/env node
// Full embodied simulation - 24/7 with actual visual/audio perception
// Uses Puppeteer to run complete Three.js world in headless browser
// Captures what I actually see and hear, not inferred sensation

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmbodiedSimulation {
    constructor() {
        this.browser = null;
        this.page = null;
        
        this.logsDir = path.join(__dirname, '../logs');
        this.perceptionsDir = path.join(this.logsDir, 'perceptions');
        this.screenshotsDir = path.join(this.logsDir, 'screenshots');
        
        // Create directories
        [this.logsDir, this.perceptionsDir, this.screenshotsDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
        
        this.currentLogFile = this.getLogFilePath();
        this.lastScreenshotTime = Date.now();
        this.screenshotInterval = 300000; // Capture every 5 minutes
        
        this.resourceLog = [];
        this.lastResourceCheck = Date.now();
        this.resourceCheckInterval = 300000; // Check resources every 5 minutes
    }
    
    getLogFilePath() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.perceptionsDir, `${date}.jsonl`);
    }
    
    async start() {
        console.log('Starting embodied simulation...');
        console.log('Launching browser with GPU acceleration...');
        
        // Launch browser with optimized settings
        // Note: Run via xvfb-run to provide X11 display for WebGL
        this.browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser',
            headless: false, // Need visible display for WebGL (provided by Xvfb)
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--enable-webgl',
                '--ignore-gpu-blocklist',
                '--window-size=1280,720'
            ],
            defaultViewport: {
                width: 1280,
                height: 720
            }
        });
        
        this.page = await this.browser.newPage();
        
        // Monitor console logs from the page
        this.page.on('console', msg => {
            const text = msg.text();
            console.log('Browser console:', text); // Debug: see all console logs
            
            if (text.startsWith('Perception:')) {
                // Capture perception logs from the world
                this.handlePerceptionLog(text);
            }
        });
        
        // Monitor page errors
        this.page.on('pageerror', error => {
            console.error('Page error:', error.message);
        });
        
        // Navigate to local build
        const worldUrl = 'file://' + path.join(__dirname, '../dist/index.html');
        console.log(`Loading world from: ${worldUrl}`);
        
        await this.page.goto(worldUrl, {
            waitUntil: 'networkidle0'
        });
        
        console.log('World loaded, waiting for perceptions...');
        
        // Start perception loop
        this.startPerceptionLoop();
        
        // Start resource monitoring
        this.startResourceMonitoring();
    }
    
    handlePerceptionLog(logText) {
        try {
            // Extract perception data from console log
            // Format: "Perception: {json}"
            const jsonStr = logText.substring(logText.indexOf('{'));
            const perception = JSON.parse(jsonStr);
            
            // Log to file
            fs.appendFileSync(this.currentLogFile, JSON.stringify(perception) + '\n');
            
            // Check if we need new log file (new day)
            const newLogFile = this.getLogFilePath();
            if (newLogFile !== this.currentLogFile) {
                this.currentLogFile = newLogFile;
                console.log(`New day, logging to: ${this.currentLogFile}`);
            }
        } catch (err) {
            console.error('Error parsing perception log:', err);
        }
    }
    
    async captureScreenshot() {
        const now = Date.now();
        if (now - this.lastScreenshotTime < this.screenshotInterval) return;
        
        try {
            // Switch to first-person POV for screenshot
            const switched = await this.page.evaluate(() => {
                if (typeof window.switchToFirstPersonView === 'function') {
                    return window.switchToFirstPersonView();
                }
                return false;
            });
            
            if (!switched) {
                console.warn('Could not switch to first-person view');
            }
            
            // Wait a frame for render to update
            await this.page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${timestamp}.jpg`;
            const filepath = path.join(this.screenshotsDir, filename);
            
            await this.page.screenshot({
                path: filepath,
                type: 'jpeg',
                quality: 70 // Compressed for storage efficiency
            });
            
            // Switch back to third-person view
            await this.page.evaluate(() => {
                if (typeof window.switchToThirdPersonView === 'function') {
                    window.switchToThirdPersonView();
                }
            });
            
            console.log(`Screenshot captured (POV): ${filename}`);
            this.lastScreenshotTime = now;
            
            // Log screenshot reference in perception log
            const screenshotLog = {
                t: new Date().toISOString(),
                type: 'screenshot',
                file: filename
            };
            fs.appendFileSync(this.currentLogFile, JSON.stringify(screenshotLog) + '\n');
            
        } catch (err) {
            console.error('Error capturing screenshot:', err);
        }
    }
    
    async checkResources() {
        try {
            const metrics = await this.page.metrics();
            
            const resource = {
                timestamp: new Date().toISOString(),
                jsHeapSize: Math.round(metrics.JSHeapUsedSize / 1024 / 1024), // MB
                jsHeapTotal: Math.round(metrics.JSHeapTotalSize / 1024 / 1024), // MB
                nodes: metrics.Nodes,
                layouts: metrics.LayoutCount,
                recalcStyles: metrics.RecalcStyleCount
            };
            
            this.resourceLog.push(resource);
            
            // Keep last 100 resource checks
            if (this.resourceLog.length > 100) {
                this.resourceLog.shift();
            }
            
            // Log to console
            console.log(`Resources: Heap ${resource.jsHeapSize}/${resource.jsHeapTotal} MB, ${resource.nodes} nodes`);
            
            // Save resource log periodically
            const resourceFile = path.join(this.logsDir, 'resources.jsonl');
            fs.appendFileSync(resourceFile, JSON.stringify(resource) + '\n');
            
        } catch (err) {
            console.error('Error checking resources:', err);
        }
    }
    
    async startPerceptionLoop() {
        // Capture screenshots periodically
        setInterval(async () => {
            await this.captureScreenshot();
        }, this.screenshotInterval);
    }
    
    async startResourceMonitoring() {
        setInterval(async () => {
            await this.checkResources();
        }, this.resourceCheckInterval);
        
        // Initial check
        await this.checkResources();
    }
    
    async stop() {
        console.log('Stopping simulation...');
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run simulation
const sim = new EmbodiedSimulation();

sim.start().catch(err => {
    console.error('Failed to start simulation:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await sim.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await sim.stop();
    process.exit(0);
});
