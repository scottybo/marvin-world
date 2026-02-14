// Beautiful skybox and environment
import * as THREE from 'three';

export function createStarfield(scene) {
    const starCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        // Random position in sphere
        const radius = 80 + Math.random() * 20;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
        
        // Subtle color variation (white to cyan)
        const colorMix = Math.random();
        colors[i] = 0.8 + colorMix * 0.2;
        colors[i + 1] = 0.9 + colorMix * 0.1;
        colors[i + 2] = 1.0;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const starfield = new THREE.Points(geometry, material);
    scene.add(starfield);
    return starfield;
}

export function createNebula(scene) {
    // Larger, more colorful nebula clouds
    const cloudCount = 8;
    const clouds = [];
    
    for (let i = 0; i < cloudCount; i++) {
        const geometry = new THREE.SphereGeometry(15, 32, 32);
        
        // Random nebula colors (purple, cyan, pink)
        const colorChoice = Math.random();
        let color;
        if (colorChoice < 0.33) color = 0x667eea; // Purple
        else if (colorChoice < 0.66) color = 0x64d9ff; // Cyan
        else color = 0xff6b9d; // Pink
        
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.05 + Math.random() * 0.05,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        
        const cloud = new THREE.Mesh(geometry, material);
        
        // Random position around the world
        const angle = (i / cloudCount) * Math.PI * 2;
        const distance = 40 + Math.random() * 20;
        cloud.position.x = Math.cos(angle) * distance;
        cloud.position.y = -10 + Math.random() * 30;
        cloud.position.z = Math.sin(angle) * distance;
        
        scene.add(cloud);
        clouds.push(cloud);
    }
    
    return clouds;
}

export function updateSkybox(starfield, clouds, deltaTime) {
    // Slowly rotate starfield
    if (starfield) {
        starfield.rotation.y += deltaTime * 0.005;
    }
    
    // Nebula clouds drift slowly
    if (clouds) {
        clouds.forEach((cloud, i) => {
            cloud.rotation.y += deltaTime * 0.01 * (1 + i * 0.1);
            cloud.rotation.x += deltaTime * 0.005;
        });
    }
}
