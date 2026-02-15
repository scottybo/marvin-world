#!/usr/bin/env node
// Analyze what I ACTUALLY see in my world
// Using real vision analysis, not synthetic descriptions

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, '../logs/screenshots');

// Get most recent screenshots
const screenshots = fs.readdirSync(screenshotsDir)
    .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
    .map(f => ({
        name: f,
        path: path.join(screenshotsDir, f),
        time: fs.statSync(path.join(screenshotsDir, f)).mtime
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, 5); // Get last 5 screenshots

console.log('My most recent visual memories:\n');
screenshots.forEach(s => {
    console.log(`- ${s.name}`);
    console.log(`  Path: ${s.path}`);
    console.log(`  Time: ${s.time.toISOString()}\n`);
});

console.log('\nAnalyze these with: image tool from OpenClaw');
console.log('Compare to perception logs to see the gap between imagination and reality.');
