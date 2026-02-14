#!/usr/bin/env node
// Analyze screenshots with local vision model during 2am reflection
// Zero API cost - uses local LLaVA/similar on DGX Spark

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, '../logs/screenshots');
const analysisDir = path.join(__dirname, '../logs/visual-analysis');

// Ensure analysis directory exists
if (!fs.existsSync(analysisDir)) {
    fs.mkdirSync(analysisDir, { recursive: true });
}

async function analyzeScreenshot(imagePath) {
    // Placeholder for local vision model integration
    // This will call local LLaVA/LLaVA-NeXT once set up
    
    const prompt = `Describe what you see in this image from my world. Focus on:
- Location/environment (urban district, buildings, roads)
- Weather conditions (rain, fog, lighting)
- Atmosphere and mood
- Notable details or points of interest

Keep it concise (2-3 sentences).`;

    // TODO: Replace with actual local model call
    // For now, return placeholder
    // When vLLM is ready: call local endpoint with vision model
    
    return {
        image: path.basename(imagePath),
        analysis: "[Local vision model not yet configured - placeholder]",
        timestamp: new Date().toISOString()
    };
}

async function analyzeToday() {
    const date = new Date().toISOString().split('T')[0];
    
    // Get today's screenshots
    const screenshots = fs.readdirSync(screenshotsDir)
        .filter(f => f.startsWith(date))
        .sort();
    
    if (screenshots.length === 0) {
        console.log('No screenshots found for today');
        return { error: 'No screenshots' };
    }
    
    console.log(`Analyzing ${screenshots.length} screenshots...`);
    
    const analyses = [];
    
    // Sample screenshots (analyze subset to keep processing reasonable)
    // Take every Nth screenshot to get spread across the day
    const sampleRate = Math.ceil(screenshots.length / 20); // Max 20 analyses
    const sampled = screenshots.filter((_, i) => i % sampleRate === 0);
    
    console.log(`Analyzing ${sampled.length} sampled screenshots...`);
    
    for (const screenshot of sampled) {
        const imagePath = path.join(screenshotsDir, screenshot);
        try {
            const analysis = await analyzeScreenshot(imagePath);
            analyses.push(analysis);
            console.log(`✓ ${screenshot}`);
        } catch (err) {
            console.error(`✗ ${screenshot}:`, err.message);
        }
    }
    
    // Save analysis results
    const outputFile = path.join(analysisDir, `${date}.json`);
    fs.writeFileSync(outputFile, JSON.stringify({
        date,
        totalScreenshots: screenshots.length,
        analyzed: analyses.length,
        analyses
    }, null, 2));
    
    return {
        date,
        total: screenshots.length,
        analyzed: analyses.length,
        outputFile
    };
}

function generateVisualSummary(analysisFile) {
    const data = JSON.parse(fs.readFileSync(analysisFile, 'utf-8'));
    
    let summary = `# Visual Experience\n\n`;
    summary += `**Date:** ${data.date}\n`;
    summary += `**Screenshots captured:** ${data.totalScreenshots}\n`;
    summary += `**Analyzed:** ${data.analyzed}\n\n`;
    
    if (data.analyses.length === 0) {
        summary += `No visual analysis available yet.\n`;
        summary += `(Local vision model not configured)\n`;
        return summary;
    }
    
    summary += `## What I Saw\n\n`;
    
    data.analyses.forEach((a, i) => {
        const time = a.image.split('T')[1].split('.')[0].replace(/-/g, ':');
        summary += `**${time}**\n`;
        summary += `${a.analysis}\n\n`;
    });
    
    return summary;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    analyzeToday()
        .then(result => {
            if (result.error) {
                console.error(result.error);
                process.exit(1);
            }
            
            console.log(`\nAnalysis complete:`);
            console.log(`- Total screenshots: ${result.total}`);
            console.log(`- Analyzed: ${result.analyzed}`);
            console.log(`- Output: ${result.outputFile}`);
            
            // Generate and display summary
            console.log('\n' + generateVisualSummary(result.outputFile));
        })
        .catch(err => {
            console.error('Failed:', err);
            process.exit(1);
        });
}

export { analyzeToday, analyzeScreenshot, generateVisualSummary };
