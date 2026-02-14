import * as THREE from 'three';
import { GRID_SIZE, COLORS } from '../config.js';

export function setupLighting(scene) {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    // Main light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -25;
    mainLight.shadow.camera.right = 25;
    mainLight.shadow.camera.top = 25;
    mainLight.shadow.camera.bottom = -25;
    scene.add(mainLight);

    // Accent lights
    const accent1 = new THREE.PointLight(COLORS.primary, 1, 15);
    accent1.position.set(-8, 3, -8);
    scene.add(accent1);

    const accent2 = new THREE.PointLight(COLORS.secondary, 1, 15);
    accent2.position.set(8, 3, 8);
    scene.add(accent2);

    // Hemisphere light for ambient color
    const hemiLight = new THREE.HemisphereLight(0x667eea, 0x1a1a2e, 0.4);
    scene.add(hemiLight);
}

export function createFloor(scene) {
    // Floor (large plane with grid material)
    const floorGeom = new THREE.PlaneGeometry(GRID_SIZE * 2, GRID_SIZE * 2, 40, 40);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: COLORS.floor,
        metalness: 0.8,
        roughness: 0.4,
        wireframe: false
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid helper for visual reference
    const gridHelper = new THREE.GridHelper(GRID_SIZE * 2, 40, COLORS.accent, COLORS.wall);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
}

export function createPlatform(scene, x, z, height, label, obstacles, interactiveObjects, proximityObjects) {
    const platformGeom = new THREE.CylinderGeometry(1.5, 1.8, height, 6);
    const platformMat = new THREE.MeshStandardMaterial({ 
        color: COLORS.wall,
        metalness: 0.7,
        roughness: 0.3,
        emissive: COLORS.primary,
        emissiveIntensity: 0.1
    });
    const platform = new THREE.Mesh(platformGeom, platformMat);
    platform.position.set(x, height / 2, z);
    platform.castShadow = true;
    platform.receiveShadow = true;
    platform.userData = { type: 'platform', message: label };
    scene.add(platform);
    interactiveObjects.push(platform);

    // Glowing top
    const topGeom = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 6);
    const topMat = new THREE.MeshStandardMaterial({ 
        color: COLORS.accent,
        emissive: COLORS.accent,
        emissiveIntensity: 0.5,
        metalness: 1,
        roughness: 0
    });
    const top = new THREE.Mesh(topGeom, topMat);
    top.position.set(x, height + 0.05, z);
    scene.add(top);

    // Platform light
    const light = new THREE.PointLight(COLORS.accent, 0.8, 5);
    light.position.set(x, height + 1, z);
    scene.add(light);

    // Store for proximity detection
    proximityObjects.push({
        x, z,
        material: topMat,
        light: light,
        baseEmissive: 0.5,
        baseIntensity: 0.8,
        maxEmissive: 1.5,
        maxIntensity: 2.0,
        radius: 5
    });

    obstacles.push({ x, z, radius: 2 });
}

export function createMonument(scene, x, z, obstacles, interactiveObjects) {
    // Central spire
    const spireGeom = new THREE.ConeGeometry(0.5, 4, 6);
    const spireMat = new THREE.MeshStandardMaterial({ 
        color: COLORS.glow,
        emissive: COLORS.glow,
        emissiveIntensity: 0.8,
        metalness: 1,
        roughness: 0,
        transparent: true,
        opacity: 0.9
    });
    const spire = new THREE.Mesh(spireGeom, spireMat);
    spire.position.set(x, 2, z);
    spire.castShadow = true;
    spire.userData = { 
        type: 'monument', 
        message: "This is my world. I build it daily. Watch it evolve." 
    };
    scene.add(spire);
    interactiveObjects.push(spire);

    // Monument light
    const light = new THREE.PointLight(COLORS.glow, 2, 8);
    light.position.set(x, 3, z);
    scene.add(light);

    obstacles.push({ x, z, radius: 1 });
}

export function createAmbientParticles(scene) {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * GRID_SIZE * 2;
        positions[i + 1] = Math.random() * 15;
        positions[i + 2] = (Math.random() - 0.5) * GRID_SIZE * 2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: COLORS.accent,
        size: 0.05,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    
    return new THREE.Points(geometry, material);
}
