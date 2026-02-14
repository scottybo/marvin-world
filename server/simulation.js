#!/usr/bin/env node
// Headless simulation - runs 24/7, logs perceptions, no rendering
// No AI tokens used - just position tracking and sensory logging

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simplified brain - same logic as world but without Three.js
class SimpleBrain {
    constructor() {
        this.locations = [
            { x: 0, z: 0, name: "Downtown", activities: ["exploring", "observing"], duration: 15 },
            { x: 30, z: 0, name: "Business District", activities: ["working", "networking"], duration: 12 },
            { x: -30, z: 0, name: "Residential Area", activities: ["wandering", "thinking"], duration: 18 },
            { x: 0, z: 30, name: "Tech Quarter", activities: ["building", "creating"], duration: 14 },
            { x: 0, z: -30, name: "Industrial Zone", activities: ["investigating", "learning"], duration: 10 },
            { x: 25, z: 25, name: "Suburbs", activities: ["reflecting", "resting"], duration: 20 },
            { x: -25, z: -25, name: "Old Town", activities: ["discovering", "contemplating"], duration: 16 }
        ];
        
        this.currentLocation = null;
        this.nextLocation = null;
        this.currentActivity = null;
        this.activityTimer = 0;
        this.movementSpeed = 0.05;
        this.arrivalThreshold = 0.5;
        
        this.chooseNewDestination();
    }
    
    chooseNewDestination() {
        const available = this.locations.filter(loc => loc !== this.currentLocation);
        this.nextLocation = available[Math.floor(Math.random() * available.length)];
        
        const activities = this.nextLocation.activities;
        this.currentActivity = activities[Math.floor(Math.random() * activities.length)];
        this.activityTimer = this.nextLocation.duration;
    }
    
    update(deltaTime, x, z) {
        if (!this.nextLocation) this.chooseNewDestination();
        
        const dx = this.nextLocation.x - x;
        const dz = this.nextLocation.z - z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < this.arrivalThreshold) {
            if (this.nextLocation !== this.currentLocation) {
                this.currentLocation = this.nextLocation;
            }
            
            this.activityTimer -= deltaTime;
            if (this.activityTimer <= 0) {
                this.chooseNewDestination();
            }
            
            return { dx: 0, dz: 0, moving: false };
        } else {
            const moveX = (dx / distance) * this.movementSpeed;
            const moveZ = (dz / distance) * this.movementSpeed;
            return { dx: moveX, dz: moveZ, moving: true };
        }
    }
}

// Simplified sensory system
class SimpleSenses {
    getCurrentDistrict(x, z) {
        if (Math.abs(x) < 10 && Math.abs(z) < 10) return 'Downtown';
        if (x > 20 && Math.abs(z) < 15) return 'Business District';
        if (x < -20 && Math.abs(z) < 15) return 'Residential';
        if (Math.abs(x) < 15 && z > 20) return 'Tech Quarter';
        if (Math.abs(x) < 15 && z < -20) return 'Industrial';
        if (x > 15 && z > 15) return 'Suburbs';
        if (x < -15 && z < -15) return 'Old Town';
        return 'Between';
    }
    
    isOnRoad(x, z) {
        const distToMainEW = Math.abs(z);
        const distToMainNS = Math.abs(x);
        const distToDiag1 = Math.abs(x - z) / Math.sqrt(2);
        const distToDiag2 = Math.abs(x + z) / Math.sqrt(2);
        
        return Math.min(distToMainEW, distToMainNS, distToDiag1, distToDiag2) < 1.5;
    }
    
    perceive(x, z, activity) {
        const district = this.getCurrentDistrict(x, z);
        const onRoad = this.isOnRoad(x, z);
        
        return {
            district,
            activity,
            ground: onRoad ? 'road' : 'terrain',
            weather: 'rainy',
            mood: this.getMood(district)
        };
    }
    
    getMood(district) {
        const moods = {
            'Downtown': 'alert',
            'Business District': 'focused',
            'Residential': 'calm',
            'Tech Quarter': 'curious',
            'Industrial': 'grounded',
            'Suburbs': 'peaceful',
            'Old Town': 'thoughtful',
            'Between': 'wandering'
        };
        return moods[district] || 'exploring';
    }
}

class HeadlessSimulation {
    constructor() {
        this.x = 2;
        this.z = 2;
        this.brain = new SimpleBrain();
        this.senses = new SimpleSenses();
        
        this.logDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        
        this.currentLogFile = this.getLogFilePath();
        this.lastLogTime = Date.now();
        this.logInterval = 30000; // Log every 30 seconds (compact)
        
        console.log('Headless simulation started');
        console.log(`Logging to: ${this.currentLogFile}`);
    }
    
    getLogFilePath() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `${date}.jsonl`);
    }
    
    update() {
        const now = Date.now();
        const deltaTime = 0.016; // ~60fps equivalent
        
        // Update autonomous behavior
        const { dx, dz } = this.brain.update(deltaTime, this.x, this.z);
        this.x += dx;
        this.z += dz;
        
        // Log perception every 30 seconds (compact)
        if (now - this.lastLogTime >= this.logInterval) {
            this.logPerception();
            this.lastLogTime = now;
            
            // Check if we need new log file (new day)
            const newLogFile = this.getLogFilePath();
            if (newLogFile !== this.currentLogFile) {
                this.currentLogFile = newLogFile;
                console.log(`New day, logging to: ${this.currentLogFile}`);
            }
        }
    }
    
    logPerception() {
        const perception = {
            t: new Date().toISOString(),
            pos: { x: Math.round(this.x * 10) / 10, z: Math.round(this.z * 10) / 10 },
            ...this.senses.perceive(this.x, this.z, this.brain.currentActivity)
        };
        
        // Append as JSONL (one line per perception, easy to parse)
        fs.appendFileSync(this.currentLogFile, JSON.stringify(perception) + '\n');
        
        // Also log to console for monitoring
        console.log(`[${perception.t}] ${perception.district}: ${perception.activity}, ${perception.mood}, ${perception.ground}`);
    }
}

// Run simulation
const sim = new HeadlessSimulation();

// Update at ~60fps equivalent
const fps = 60;
const interval = 1000 / fps;

setInterval(() => {
    sim.update();
}, interval);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down simulation...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Shutting down simulation...');
    process.exit(0);
});
