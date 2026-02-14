import * as THREE from 'three';
import { COLORS } from '../config.js';

export class Marvin {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.idleTime = 0;
        this.baseY = 0.5;
        this.particles = [];
        this.trailParticles = [];
        this.trailSpawnTimer = 0;
        this.createCharacter();
        this.createAura();
        this.scene.add(this.group);
    }

    createCharacter() {
        // Modern robot design - sleek and futuristic
        
        // Body - elongated capsule with metallic finish
        const bodyGeom = new THREE.CapsuleGeometry(0.3, 0.8, 32, 64);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            metalness: 0.95,
            roughness: 0.15,
            emissive: COLORS.accent,
            emissiveIntensity: 0.2,
            envMapIntensity: 1.5
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.castShadow = true;
        this.group.add(body);

        // Chest panel - glowing hexagon
        const hexShape = new THREE.Shape();
        const hexRadius = 0.15;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * hexRadius;
            const y = Math.sin(angle) * hexRadius;
            if (i === 0) hexShape.moveTo(x, y);
            else hexShape.lineTo(x, y);
        }
        hexShape.closePath();
        
        const hexGeom = new THREE.ExtrudeGeometry(hexShape, { depth: 0.02, bevelEnabled: false });
        const hexMat = new THREE.MeshStandardMaterial({
            color: COLORS.accent,
            emissive: COLORS.accent,
            emissiveIntensity: 2,
            metalness: 1,
            roughness: 0
        });
        const hexPanel = new THREE.Mesh(hexGeom, hexMat);
        hexPanel.position.set(0, 0.1, 0.28);
        hexPanel.rotation.y = Math.PI / 2;
        this.group.add(hexPanel);
        
        // Chest panel light
        const panelLight = new THREE.PointLight(COLORS.accent, 1.5, 3);
        panelLight.position.set(0, 0.1, 0.35);
        this.group.add(panelLight);
        this.chestLight = panelLight;

        // Head - smooth sphere with metallic finish
        const headGeom = new THREE.SphereGeometry(0.35, 64, 64);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: 0xf0f0f0,
            metalness: 0.9,
            roughness: 0.1,
            emissive: COLORS.primary,
            emissiveIntensity: 0.1,
            envMapIntensity: 2
        });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 0.75;
        head.castShadow = true;
        this.group.add(head);
        
        // Visor - dark glass strip across face
        const visorGeom = new THREE.BoxGeometry(0.5, 0.12, 0.05);
        const visorMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 1,
            roughness: 0.1,
            emissive: COLORS.accent,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.9
        });
        const visor = new THREE.Mesh(visorGeom, visorMat);
        visor.position.set(0, 0.75, 0.32);
        this.group.add(visor);

        // Eye lights behind visor (glowing effect)
        const eyeGeom = new THREE.SphereGeometry(0.04, 16, 16);
        const eyeMat = new THREE.MeshStandardMaterial({ 
            color: COLORS.accent,
            emissive: COLORS.accent,
            emissiveIntensity: 3,
            metalness: 1,
            roughness: 0
        });
        
        const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        leftEye.position.set(-0.1, 0.75, 0.3);
        this.group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        rightEye.position.set(0.1, 0.75, 0.3);
        this.group.add(rightEye);

        // Eye lights
        const eyeLight = new THREE.PointLight(COLORS.accent, 1.5, 2);
        eyeLight.position.set(0, 0.75, 0.35);
        this.group.add(eyeLight);
        this.eyeLight = eyeLight;

        // No antenna - cleaner modern look
        
        // Shoulders - small spheres
        const shoulderGeom = new THREE.SphereGeometry(0.12, 16, 16);
        const shoulderMat = new THREE.MeshStandardMaterial({
            color: 0xe0e0e0,
            metalness: 0.9,
            roughness: 0.2
        });
        
        const leftShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
        leftShoulder.position.set(-0.35, 0.3, 0);
        leftShoulder.castShadow = true;
        this.group.add(leftShoulder);
        
        const rightShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
        rightShoulder.position.set(0.35, 0.3, 0);
        rightShoulder.castShadow = true;
        this.group.add(rightShoulder);

        this.group.position.y = this.baseY;
    }

    createAura() {
        // Particle aura around Marvin
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            const angle = (i / 3) * (Math.PI * 2 / particleCount);
            positions[i] = Math.cos(angle) * 0.6;
            positions[i + 1] = Math.random() * 1.5 - 0.5;
            positions[i + 2] = Math.sin(angle) * 0.6;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: COLORS.accent,
            size: 0.04,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.aura = new THREE.Points(geometry, material);
        this.group.add(this.aura);
    }

    spawnTrailParticle() {
        const particleGeom = new THREE.SphereGeometry(0.08, 8, 8);
        const particleMat = new THREE.MeshStandardMaterial({ 
            color: COLORS.accent,
            emissive: COLORS.accent,
            emissiveIntensity: 1.5,
            metalness: 1,
            roughness: 0,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeom, particleMat);
        particle.position.copy(this.group.position);
        particle.position.y += Math.random() * 0.3;
        particle.userData = { life: 1.0, fadeSpeed: 0.8 };
        this.scene.add(particle);
        this.trailParticles.push(particle);
    }

    updateTrailParticles(deltaTime) {
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const particle = this.trailParticles[i];
            particle.userData.life -= deltaTime * particle.userData.fadeSpeed;
            particle.material.opacity = particle.userData.life * 0.8;
            particle.material.emissiveIntensity = particle.userData.life * 1.5;
            particle.scale.setScalar(particle.userData.life);
            
            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
                this.trailParticles.splice(i, 1);
            }
        }
    }

    update(deltaTime, isMoving) {
        this.idleTime += deltaTime;
        
        // Floating animation
        const float = Math.sin(this.idleTime * 2) * 0.03;
        this.group.position.y = this.baseY + float;
        
        // Chest panel pulse
        const pulse = (Math.sin(this.idleTime * 3) + 1) * 0.5 + 0.5;
        if (this.chestLight) {
            this.chestLight.intensity = 1 + pulse * 0.5;
        }
        
        // Eye glow pulse (subtle)
        if (this.eyeLight) {
            this.eyeLight.intensity = 1.2 + pulse * 0.3;
        }
        
        // Rotate aura
        if (this.aura) {
            this.aura.rotation.y += deltaTime * 0.5;
        }

        // Spawn trail particles when moving
        if (isMoving) {
            this.trailSpawnTimer += deltaTime;
            if (this.trailSpawnTimer > 0.08) {
                this.spawnTrailParticle();
                this.trailSpawnTimer = 0;
            }
        }

        // Update existing trail particles
        this.updateTrailParticles(deltaTime);
    }

    setPosition(x, z) {
        this.group.position.x = x;
        this.group.position.z = z;
    }

    setRotation(angle) {
        this.group.rotation.y = angle;
    }
}
