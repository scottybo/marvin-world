// Weather system - rain and fog for atmospheric depth
import * as THREE from 'three';

export function createRain(scene) {
    // DRAMATIC heavy rain - thick white streaks
    const rainCount = 10000; // Dense rain
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 6); // 2 vertices per drop for lines
    const velocities = new Float32Array(rainCount);
    
    // Spawn rain drops - concentrated around center
    for (let i = 0; i < rainCount; i++) {
        const x = (Math.random() - 0.5) * 100; // Concentrated area
        const y = Math.random() * 60 + 10; // Lower spawn for visibility
        const z = (Math.random() - 0.5) * 100;
        
        // Top of raindrop streak
        positions[i * 6] = x;
        positions[i * 6 + 1] = y;
        positions[i * 6 + 2] = z;
        
        // Bottom of raindrop streak (creates visible line)
        positions[i * 6 + 3] = x;
        positions[i * 6 + 4] = y - 3; // Longer streaks
        positions[i * 6 + 5] = z;
        
        velocities[i] = Math.random() * 0.5 + 1.0; // Much faster fall
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));
    
    const material = new THREE.LineBasicMaterial({
        color: 0xccddff, // Brighter, more visible
        transparent: true,
        opacity: 0.9, // Less transparent
        linewidth: 2 // Thicker lines (if supported)
    });
    
    const rain = new THREE.LineSegments(geometry, material);
    scene.add(rain);
    
    return rain;
}

export function updateRain(rain, deltaTime) {
    if (!rain) return;
    
    const positions = rain.geometry.attributes.position.array;
    const velocities = rain.geometry.attributes.velocity.array;
    
    // Update line segments (6 values per drop: 2 vertices * 3 coords)
    for (let i = 0; i < velocities.length; i++) {
        const baseIndex = i * 6;
        const velocity = velocities[i];
        
        // Move both vertices down
        positions[baseIndex + 1] -= velocity; // top Y
        positions[baseIndex + 4] -= velocity; // bottom Y
        
        // Reset when hitting ground
        if (positions[baseIndex + 1] < 0) {
            const x = (Math.random() - 0.5) * 200;
            const y = Math.random() * 80 + 30;
            const z = (Math.random() - 0.5) * 200;
            
            positions[baseIndex] = x;
            positions[baseIndex + 1] = y;
            positions[baseIndex + 2] = z;
            positions[baseIndex + 3] = x;
            positions[baseIndex + 4] = y - 2;
            positions[baseIndex + 5] = z;
        }
    }
    
    rain.geometry.attributes.position.needsUpdate = true;
}

export function createPuddles(scene) {
    const puddles = [];
    const puddleCount = 50; // More puddles
    
    for (let i = 0; i < puddleCount; i++) {
        // Bigger, more visible puddles
        const size = Math.random() * 4 + 2;
        
        const geometry = new THREE.CircleGeometry(size, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x0a0a15, // Darker for contrast
            metalness: 1.0, // Maximum reflectivity
            roughness: 0.05, // Very smooth
            transparent: true,
            opacity: 0.85,
            envMapIntensity: 3 // Strong reflections
        });
        
        const puddle = new THREE.Mesh(geometry, material);
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.y = 0.02;
        
        // Cluster puddles near center (where I spend time)
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50;
        puddle.position.x = Math.cos(angle) * distance;
        puddle.position.z = Math.sin(angle) * distance;
        
        puddle.receiveShadow = true;
        scene.add(puddle);
        puddles.push(puddle);
    }
    
    return puddles;
}

export function updatePuddles(puddles, time) {
    if (!puddles) return;
    
    puddles.forEach((puddle, i) => {
        // Subtle ripple effect
        const ripple = Math.sin(time * 2 + i) * 0.05;
        puddle.scale.setScalar(1 + ripple);
    });
}

export function enhanceFog(scene) {
    // VERY dense fog for heavy rain atmosphere
    scene.fog = new THREE.FogExp2(0x0d0d1a, 0.055); // Much denser
    scene.background = new THREE.Color(0x0f0f1a); // Dark stormy sky
}

// Rain impact particles on ground
export function createRainImpacts(scene) {
    const impactCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(impactCount * 3);
    const scales = new Float32Array(impactCount);
    const ages = new Float32Array(impactCount);
    
    for (let i = 0; i < impactCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = 0.1;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        scales[i] = Math.random();
        ages[i] = Math.random();
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('age', new THREE.BufferAttribute(ages, 1));
    
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const impacts = new THREE.Points(geometry, material);
    scene.add(impacts);
    
    return impacts;
}

export function updateRainImpacts(impacts, deltaTime) {
    if (!impacts) return;
    
    const positions = impacts.geometry.attributes.position.array;
    const ages = impacts.geometry.attributes.age.array;
    
    for (let i = 0; i < ages.length; i++) {
        ages[i] += deltaTime * 2;
        
        // Reset impact when it fades out
        if (ages[i] > 1) {
            ages[i] = 0;
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }
        
        // Fade out
        const opacity = 1 - ages[i];
        impacts.material.opacity = opacity * 0.6;
    }
    
    impacts.geometry.attributes.position.needsUpdate = true;
    impacts.geometry.attributes.age.needsUpdate = true;
}

// Lightning system for dramatic weather
export function createLightning(scene) {
    const lightning = {
        light: null,
        nextFlash: 0,
        isFlashing: false,
        flashDuration: 0
    };
    
    // Ambient lightning light (starts disabled)
    const lightningLight = new THREE.DirectionalLight(0xffffff, 0);
    lightningLight.position.set(0, 50, 0);
    scene.add(lightningLight);
    lightning.light = lightningLight;
    
    return lightning;
}

export function updateLightning(lightning, time) {
    if (!lightning || !lightning.light) return;
    
    // Random lightning flashes
    if (!lightning.isFlashing && time > lightning.nextFlash) {
        // Trigger flash
        lightning.isFlashing = true;
        lightning.flashDuration = 0.1 + Math.random() * 0.15; // 100-250ms flash
        lightning.light.intensity = 3 + Math.random() * 2; // Very bright
        
        // Schedule next flash (5-20 seconds from now)
        lightning.nextFlash = time + 5 + Math.random() * 15;
    }
    
    // End flash
    if (lightning.isFlashing) {
        lightning.flashDuration -= 0.016; // Approximate frame time
        if (lightning.flashDuration <= 0) {
            lightning.isFlashing = false;
            lightning.light.intensity = 0;
        }
    }
}
