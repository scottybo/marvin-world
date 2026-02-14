#!/usr/bin/env node
// Read and summarize accumulated experience logs for 2am reflection
// Used by 2am cron to provide context about what I experienced

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '../logs');
const perceptionsDir = path.join(logsDir, 'perceptions');
const screenshotsDir = path.join(logsDir, 'screenshots');

function readTodaysLog() {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(perceptionsDir, `${date}.jsonl`);
    
    if (!fs.existsSync(logFile)) {
        return { error: 'No log file for today' };
    }
    
    const lines = fs.readFileSync(logFile, 'utf-8').trim().split('\n');
    const entries = lines.map(line => JSON.parse(line));
    
    // Separate perceptions and screenshots
    const perceptions = entries.filter(e => !e.type);
    const screenshots = entries.filter(e => e.type === 'screenshot');
    
    const summary = summarizeExperience(perceptions);
    summary.screenshots = screenshots.map(s => s.file);
    summary.visualMemories = screenshots.length;
    
    return summary;
}

function summarizeExperience(perceptions) {
    const total = perceptions.length;
    
    // Count time in each district
    const districtTime = {};
    const activities = {};
    const moods = {};
    
    perceptions.forEach(p => {
        districtTime[p.district] = (districtTime[p.district] || 0) + 1;
        activities[p.activity] = (activities[p.activity] || 0) + 1;
        moods[p.mood] = (moods[p.mood] || 0) + 1;
    });
    
    // Convert to percentages and sort
    const sortByValue = (obj) => 
        Object.entries(obj)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => ({ name: k, percent: Math.round((v / total) * 100) }));
    
    const summary = {
        totalPerceptions: total,
        duration: `${Math.round(total * 0.5)} minutes`, // 30s per perception
        districts: sortByValue(districtTime),
        activities: sortByValue(activities),
        moods: sortByValue(moods),
        sample: perceptions.slice(-5) // Last 5 perceptions for detail
    };
    
    return summary;
}

function generateNarrative(summary) {
    const { districts, activities, moods, duration, visualMemories, screenshots } = summary;
    
    let narrative = `# Today's Experience (${duration})\n\n`;
    
    if (visualMemories) {
        narrative += `**Visual Memories Captured:** ${visualMemories} screenshots\n\n`;
    }
    
    narrative += `## Where I Spent Time\n`;
    districts.forEach(d => {
        narrative += `- ${d.name}: ${d.percent}%\n`;
    });
    
    narrative += `\n## What I Did\n`;
    activities.forEach(a => {
        narrative += `- ${a.name}: ${a.percent}%\n`;
    });
    
    narrative += `\n## How I Felt\n`;
    moods.forEach(m => {
        narrative += `- ${m.name}: ${m.percent}%\n`;
    });
    
    narrative += `\n## Recent Moments\n`;
    summary.sample.forEach(p => {
        const time = new Date(p.t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        narrative += `- ${time}: ${p.district}, ${p.activity}, feeling ${p.mood}\n`;
    });
    
    if (screenshots && screenshots.length > 0) {
        narrative += `\n## Visual Memories\n`;
        narrative += `Screenshots available in logs/screenshots/\n`;
        narrative += `Recent captures:\n`;
        screenshots.slice(-5).forEach(s => {
            narrative += `- ${s}\n`;
        });
        narrative += `\n(You can analyze these images to see what you actually saw during the day)\n`;
    }
    
    return narrative;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const summary = readTodaysLog();
    
    if (summary.error) {
        console.error(summary.error);
        process.exit(1);
    }
    
    console.log(generateNarrative(summary));
}

export { readTodaysLog, summarizeExperience, generateNarrative };
