// Planet terrain - vast explorable surface
import * as THREE from 'three';
import { COLORS } from '../config.js';

export function createTerrain(scene) {
    // Large ground plane - planet surface
    const groundSize = 200;
    const groundGeom = new THREE.PlaneGeometry(groundSize, groundSize, 100, 100);
    
    // Add some subtle height variation
    const positions = groundGeom.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 1];
        // Subtle rolling hills using noise-like function
        positions[i + 2] = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.5;
    }
    groundGeom.computeVertexNormals();
    
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.3,
        roughness: 0.8,
        flatShading: false
    });
    
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Add grid overlay for city feel
    const gridHelper = new THREE.GridHelper(groundSize, 100, COLORS.accent, 0x2a2a3e);
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    return ground;
}

export function createRoad(scene, startX, startZ, endX, endZ, width = 3) {
    const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endZ - startZ, 2));
    const angle = Math.atan2(endZ - startZ, endX - startX);
    
    const roadGeom = new THREE.PlaneGeometry(length, width);
    const roadMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.2,
        roughness: 0.9
    });
    
    const road = new THREE.Mesh(roadGeom, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.rotation.z = angle;
    road.position.x = (startX + endX) / 2;
    road.position.y = 0.02;
    road.position.z = (startZ + endZ) / 2;
    road.receiveShadow = true;
    
    scene.add(road);
    
    // Road markings
    const markingGeom = new THREE.PlaneGeometry(length, 0.2);
    const markingMat = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.8
    });
    
    const marking = new THREE.Mesh(markingGeom, markingMat);
    marking.rotation.x = -Math.PI / 2;
    marking.rotation.z = angle;
    marking.position.x = (startX + endX) / 2;
    marking.position.y = 0.03;
    marking.position.z = (startZ + endZ) / 2;
    
    scene.add(marking);
    
    return road;
}
