// Procedural objects - building on Three.js primitives
import * as THREE from 'three';
import { COLORS } from '../config.js';

// Simple furniture using primitives (until we load GLTF models)
export function createDesk(scene, x, z) {
    const group = new THREE.Group();
    
    // Desk top
    const topGeom = new THREE.BoxGeometry(1.2, 0.05, 0.6);
    const topMat = new THREE.MeshStandardMaterial({
        color: 0x8B7355,
        metalness: 0.2,
        roughness: 0.8
    });
    const top = new THREE.Mesh(topGeom, topMat);
    top.position.y = 0.6;
    top.castShadow = true;
    group.add(top);
    
    // Legs
    const legGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
    const legMat = new THREE.MeshStandardMaterial({
        color: 0x654321,
        metalness: 0.3,
        roughness: 0.7
    });
    
    const legPositions = [
        [-0.5, 0.3, -0.25],
        [0.5, 0.3, -0.25],
        [-0.5, 0.3, 0.25],
        [0.5, 0.3, 0.25]
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeom, legMat);
        leg.position.set(...pos);
        leg.castShadow = true;
        group.add(leg);
    });
    
    group.position.set(x, 0, z);
    scene.add(group);
    return group;
}

export function createPlant(scene, x, z) {
    const group = new THREE.Group();
    
    // Pot
    const potGeom = new THREE.CylinderGeometry(0.15, 0.12, 0.2, 8);
    const potMat = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9
    });
    const pot = new THREE.Mesh(potGeom, potMat);
    pot.position.y = 0.1;
    pot.castShadow = true;
    group.add(pot);
    
    // Plant (simple sphere for leaves)
    const plantGeom = new THREE.SphereGeometry(0.2, 8, 8);
    const plantMat = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.8
    });
    const plant = new THREE.Mesh(plantGeom, plantMat);
    plant.position.y = 0.3;
    plant.castShadow = true;
    group.add(plant);
    
    group.position.set(x, 0, z);
    scene.add(group);
    return group;
}

export function createComputer(scene, x, y, z) {
    const group = new THREE.Group();
    
    // Monitor
    const monitorGeom = new THREE.BoxGeometry(0.4, 0.3, 0.05);
    const monitorMat = new THREE.MeshStandardMaterial({
        color: 0x2c3e50,
        metalness: 0.6,
        roughness: 0.4
    });
    const monitor = new THREE.Mesh(monitorGeom, monitorMat);
    monitor.castShadow = true;
    group.add(monitor);
    
    // Screen (glowing)
    const screenGeom = new THREE.BoxGeometry(0.35, 0.25, 0.01);
    const screenMat = new THREE.MeshStandardMaterial({
        color: COLORS.accent,
        emissive: COLORS.accent,
        emissiveIntensity: 0.8,
        metalness: 0,
        roughness: 0.2
    });
    const screen = new THREE.Mesh(screenGeom, screenMat);
    screen.position.z = 0.03;
    group.add(screen);
    
    // Screen light
    const screenLight = new THREE.PointLight(COLORS.accent, 0.5, 1);
    screenLight.position.set(0, 0, 0.1);
    group.add(screenLight);
    
    group.position.set(x, y, z);
    scene.add(group);
    return group;
}
