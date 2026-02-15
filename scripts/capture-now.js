#!/usr/bin/env node
// Quick screenshot capture for testing
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureScreenshot() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--enable-webgl',
            '--window-size=1280,720'
        ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    const worldUrl = 'file://' + path.join(__dirname, '../dist/index.html');
    console.log('Loading world...');
    await page.goto(worldUrl, { waitUntil: 'networkidle0' });
    
    // Wait for world to initialize
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const screenshotPath = path.join(__dirname, '../logs/screenshots/manual-capture.jpg');
    console.log('Capturing screenshot...');
    await page.screenshot({
        path: screenshotPath,
        type: 'jpeg',
        quality: 85
    });
    
    console.log('Screenshot saved to:', screenshotPath);
    await browser.close();
}

captureScreenshot().catch(err => {
    console.error('Failed:', err);
    process.exit(1);
});
