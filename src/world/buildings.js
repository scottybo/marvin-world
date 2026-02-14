// Urban buildings - GTA V style city structures
import * as THREE from 'three';
import { COLORS } from '../config.js';

export function createBuilding(scene, x, z, width, depth, height, style = 'modern') {
    const group = new THREE.Group();
    
    // Main building structure
    const buildingGeom = new THREE.BoxGeometry(width, height, depth);
    
    let buildingMat;
    if (style === 'modern') {
        buildingMat = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            metalness: 0.6,
            roughness: 0.4,
            emissive: 0x1a1a2e,
            emissiveIntensity: 0.1
        });
    } else if (style === 'glass') {
        buildingMat = new THREE.MeshStandardMaterial({
            color: 0x87ceeb,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.7,
            emissive: COLORS.accent,
            emissiveIntensity: 0.2
        });
    } else { // residential
        buildingMat = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            metalness: 0.2,
            roughness: 0.9
        });
    }
    
    const building = new THREE.Mesh(buildingGeom, buildingMat);
    building.position.y = height / 2;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);
    
    // Add windows (glowing rectangles)
    const windowCount = Math.floor(height / 3);
    const windowsPerRow = Math.floor(width / 2);
    
    for (let floor = 0; floor < windowCount; floor++) {
        for (let col = 0; col < windowsPerRow; col++) {
            const windowGeom = new THREE.PlaneGeometry(0.8, 1.2);
            const isLit = Math.random() > 0.3; // 70% of windows lit
            const windowMat = new THREE.MeshStandardMaterial({
                color: isLit ? 0xffeeaa : 0x333333,
                emissive: isLit ? 0xffeeaa : 0x000000,
                emissiveIntensity: isLit ? 0.8 : 0
            });
            
            const window = new THREE.Mesh(windowGeom, windowMat);
            window.position.y = (floor + 0.5) * 3 - height / 2 + 2;
            window.position.x = (col - windowsPerRow / 2 + 0.5) * 2;
            window.position.z = depth / 2 + 0.01;
            group.add(window);
            
            // Back windows
            const windowBack = window.clone();
            windowBack.position.z = -depth / 2 - 0.01;
            windowBack.rotation.y = Math.PI;
            group.add(windowBack);
        }
    }
    
    // Rooftop detail (antenna/AC units for realism)
    if (Math.random() > 0.5) {
        const antennaGeom = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        const antennaMat = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.8,
            roughness: 0.3
        });
        const antenna = new THREE.Mesh(antennaGeom, antennaMat);
        antenna.position.y = height + 1;
        antenna.castShadow = true;
        group.add(antenna);
        
        // Blinking red light on top
        const lightGeom = new THREE.SphereGeometry(0.15, 8, 8);
        const lightMat = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 2
        });
        const light = new THREE.Mesh(lightGeom, lightMat);
        light.position.y = height + 2;
        group.add(light);
        
        const pointLight = new THREE.PointLight(0xff0000, 1, 5);
        pointLight.position.y = height + 2;
        group.add(pointLight);
    }
    
    group.position.set(x, 0, z);
    scene.add(group);
    
    return group;
}

export function createCityBlock(scene, centerX, centerZ, obstacles) {
    // Create a city block with multiple buildings
    const blockSize = 20;
    const buildingCount = 4 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < buildingCount; i++) {
        const angle = (i / buildingCount) * Math.PI * 2;
        const distance = 5 + Math.random() * 5;
        const x = centerX + Math.cos(angle) * distance;
        const z = centerZ + Math.sin(angle) * distance;
        
        const width = 4 + Math.random() * 4;
        const depth = 4 + Math.random() * 4;
        const height = 8 + Math.random() * 15;
        
        const styles = ['modern', 'glass', 'residential'];
        const style = styles[Math.floor(Math.random() * styles.length)];
        
        createBuilding(scene, x, z, width, depth, height, style);
        
        // Add to obstacles
        obstacles.push({
            x, z,
            radius: Math.max(width, depth) / 2 + 0.5
        });
    }
}
