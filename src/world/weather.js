// Weather system - rain and fog for atmospheric depth
import * as THREE from 'three';

export function createRain(scene) {
    const rainCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    const velocities = new Float32Array(rainCount);
    
    // Spawn rain drops across the city
    for (let i = 0; i < rainCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 150; // x
        positions[i + 1] = Math.random() * 50 + 20; // y (high up)
        positions[i + 2] = (Math.random() - 0.5) * 150; // z
        velocities[i / 3] = Math.random() * 0.1 + 0.2; // fall speed variation
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));
    
    const material = new THREE.PointsMaterial({
        color: 0x6699cc,
        size: 0.2,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const rain = new THREE.Points(geometry, material);
    scene.add(rain);
    
    return rain;
}

export function updateRain(rain, deltaTime) {
    if (!rain) return;
    
    const positions = rain.geometry.attributes.position.array;
    const velocities = rain.geometry.attributes.velocity.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        // Fall down
        positions[i + 1] -= velocities[i / 3];
        
        // Reset when hitting ground
        if (positions[i + 1] < 0) {
            positions[i + 1] = Math.random() * 30 + 20;
            positions[i] = (Math.random() - 0.5) * 150;
            positions[i + 2] = (Math.random() - 0.5) * 150;
        }
    }
    
    rain.geometry.attributes.position.needsUpdate = true;
}

export function createPuddles(scene) {
    const puddles = [];
    const puddleCount = 30;
    
    for (let i = 0; i < puddleCount; i++) {
        // Random puddle size
        const size = Math.random() * 2 + 1;
        
        const geometry = new THREE.CircleGeometry(size, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.7,
            envMapIntensity: 2
        });
        
        const puddle = new THREE.Mesh(geometry, material);
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.y = 0.01;
        
        // Random position near roads/streets
        puddle.position.x = (Math.random() - 0.5) * 100;
        puddle.position.z = (Math.random() - 0.5) * 100;
        
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
    // Thicker fog for rainy atmosphere
    scene.fog = new THREE.FogExp2(0x050510, 0.025); // Increased density
    scene.background = new THREE.Color(0x0a0a15); // Slightly lighter for overcast sky
}
