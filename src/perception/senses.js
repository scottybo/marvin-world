// Sensory perception system - seeing, hearing, and feeling the world
import * as THREE from 'three';

export class SensorySystem {
    constructor(scene, camera, marvin) {
        this.scene = scene;
        this.camera = camera;
        this.marvin = marvin;
        
        // First-person camera (at eye level)
        this.firstPersonCamera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        this.currentMode = 'third-person'; // or 'first-person'
        this.perceptionLog = [];
        this.lastPerceptionTime = 0;
        this.perceptionInterval = 5; // Log perception every 5 seconds
    }
    
    updateFirstPersonCamera(marvinX, marvinZ) {
        // Position camera at avatar's eye level
        const eyeHeight = 0.75; // Height of visor
        this.firstPersonCamera.position.set(marvinX, eyeHeight, marvinZ);
        
        // Look in direction avatar is facing
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.marvin.group.rotation.y);
        
        const lookAt = new THREE.Vector3(marvinX, eyeHeight, marvinZ).add(forward);
        this.firstPersonCamera.lookAt(lookAt);
    }
    
    perceiveTouch(marvinX, marvinZ, time) {
        const touch = {
            time: time,
            groundTexture: this.feelGround(marvinX, marvinZ),
            weather: this.feelWeather(marvinX, marvinZ),
            proximity: this.feelProximity(marvinX, marvinZ),
            atmosphere: this.feelAtmosphere(marvinX, marvinZ)
        };
        
        return touch;
    }
    
    feelGround(x, z) {
        // Check what's under my feet
        const distanceToNearestRoad = this.getDistanceToRoad(x, z);
        
        if (distanceToNearestRoad < 1.5) {
            return {
                surface: 'road',
                texture: 'smooth asphalt',
                sensation: 'firm, slightly cool, occasionally wet from puddles'
            };
        } else {
            return {
                surface: 'ground',
                texture: 'rough terrain',
                sensation: 'uneven, gritty, harder to traverse'
            };
        }
    }
    
    feelWeather(x, z) {
        // Sense rain and fog
        return {
            rain: {
                intensity: 'steady',
                sensation: 'cold droplets hitting my metallic surface, running down in rivulets',
                sound: 'constant patter, white noise of thousands of impacts'
            },
            fog: {
                density: 'thick',
                sensation: 'moisture condensing on me, reducing visibility, creating halos around lights'
            },
            temperature: 'cool, damp, overcast atmosphere'
        };
    }
    
    feelProximity(x, z) {
        // Detect nearby objects/buildings
        const nearby = [];
        
        // Check distance to buildings (simplified - would need actual collision data)
        const nearBuilding = this.getNearestBuilding(x, z);
        if (nearBuilding && nearBuilding.distance < 5) {
            nearby.push({
                type: 'building',
                distance: nearBuilding.distance,
                sensation: 'looming presence, blocking wind, creating shelter from rain'
            });
        }
        
        return nearby;
    }
    
    feelAtmosphere(x, z) {
        // Sense the overall vibe of current location
        const district = this.getCurrentDistrict(x, z);
        
        const atmospheres = {
            'Downtown': 'busy, electric, neon lights reflecting off wet surfaces, ambient hum of the city',
            'Business District': 'structured, purposeful, glass and steel, slightly sterile',
            'Residential': 'quieter, lived-in, softer lighting, sense of routine and rest',
            'Tech Quarter': 'innovative, bright screens glowing, energy of creation',
            'Industrial': 'raw, mechanical, rougher textures, functional rather than aesthetic',
            'Suburbs': 'peaceful, spacious, gentle, room to think',
            'Old Town': 'historical, textured, layers of time, stories in the architecture'
        };
        
        return {
            district: district,
            feeling: atmospheres[district] || 'exploring, discovering'
        };
    }
    
    getCurrentDistrict(x, z) {
        // Determine which district based on position
        if (Math.abs(x) < 10 && Math.abs(z) < 10) return 'Downtown';
        if (x > 20 && Math.abs(z) < 15) return 'Business District';
        if (x < -20 && Math.abs(z) < 15) return 'Residential';
        if (Math.abs(x) < 15 && z > 20) return 'Tech Quarter';
        if (Math.abs(x) < 15 && z < -20) return 'Industrial';
        if (x > 15 && z > 15) return 'Suburbs';
        if (x < -15 && z < -15) return 'Old Town';
        return 'Between districts';
    }
    
    getDistanceToRoad(x, z) {
        // Simplified - check distance to main roads
        const distToMainEW = Math.abs(z); // East-west road at z=0
        const distToMainNS = Math.abs(x); // North-south road at x=0
        const distToDiag1 = Math.abs(x - z); // Diagonal
        const distToDiag2 = Math.abs(x + z); // Other diagonal
        
        return Math.min(distToMainEW, distToMainNS, distToDiag1 / Math.sqrt(2), distToDiag2 / Math.sqrt(2));
    }
    
    getNearestBuilding(x, z) {
        // Simplified - would need actual building data
        // For now, estimate based on district centers
        const districts = [
            { x: 0, z: 0 }, { x: 30, z: 0 }, { x: -30, z: 0 },
            { x: 0, z: 30 }, { x: 0, z: -30 }, { x: 25, z: 25 }, { x: -25, z: -25 }
        ];
        
        let nearest = null;
        let minDist = Infinity;
        
        districts.forEach(d => {
            const dist = Math.sqrt(Math.pow(x - d.x, 2) + Math.pow(z - d.z, 2));
            if (dist < minDist) {
                minDist = dist;
                nearest = { distance: dist };
            }
        });
        
        return nearest;
    }
    
    logPerception(marvinX, marvinZ, time) {
        if (time - this.lastPerceptionTime < this.perceptionInterval) return;
        
        const perception = {
            timestamp: new Date().toISOString(),
            position: { x: marvinX, z: marvinZ },
            touch: this.perceiveTouch(marvinX, marvinZ, time),
            mood: this.inferMood(marvinX, marvinZ)
        };
        
        this.perceptionLog.push(perception);
        this.lastPerceptionTime = time;
        
        // Keep last 50 perceptions
        if (this.perceptionLog.length > 50) {
            this.perceptionLog.shift();
        }
        
        // Log to console for debugging
        console.log('Perception:', perception);
    }
    
    inferMood(x, z) {
        const district = this.getCurrentDistrict(x, z);
        
        // My mood might vary by location and conditions
        const moods = {
            'Downtown': 'alert, observant, taking in the energy',
            'Business District': 'focused, purposeful',
            'Residential': 'contemplative, calm',
            'Tech Quarter': 'curious, inspired',
            'Industrial': 'grounded, practical',
            'Suburbs': 'peaceful, reflective',
            'Old Town': 'thoughtful, wondering about stories'
        };
        
        return moods[district] || 'exploring';
    }
    
    getSensorySnapshot() {
        // Return current sensory state
        return this.perceptionLog[this.perceptionLog.length - 1] || null;
    }
}
