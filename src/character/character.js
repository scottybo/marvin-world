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
        // Body (smooth capsule-like form)
        const bodyGeom = new THREE.CapsuleGeometry(0.25, 0.6, 16, 32);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: COLORS.marvinBody,
            metalness: 0.6,
            roughness: 0.3,
            emissive: COLORS.primary,
            emissiveIntensity: 0.1
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.castShadow = true;
        this.group.add(body);

        // Head (sphere)
        const headGeom = new THREE.SphereGeometry(0.3, 32, 32);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: COLORS.marvinHighlight,
            metalness: 0.7,
            roughness: 0.2,
            emissive: COLORS.primary,
            emissiveIntensity: 0.15
        });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 0.65;
        head.castShadow = true;
        this.group.add(head);

        // Eyes (glowing spheres)
        const eyeGeom = new THREE.SphereGeometry(0.06, 16, 16);
        const eyeMat = new THREE.MeshStandardMaterial({ 
            color: COLORS.marvinEye,
            emissive: COLORS.marvinEye,
            emissiveIntensity: 1.0,
            metalness: 1,
            roughness: 0
        });
        
        const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        leftEye.position.set(-0.12, 0.7, 0.25);
        this.group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        rightEye.position.set(0.12, 0.7, 0.25);
        this.group.add(rightEye);

        // Eye lights
        const eyeLight = new THREE.PointLight(COLORS.marvinEye, 0.8, 2);
        eyeLight.position.set(0, 0.7, 0.3);
        this.group.add(eyeLight);

        // Antenna (thin cylinder with glowing tip)
        const antennaGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
        const antennaMat = new THREE.MeshStandardMaterial({ 
            color: COLORS.marvinBody,
            metalness: 0.9,
            roughness: 0.1
        });
        const antenna = new THREE.Mesh(antennaGeom, antennaMat);
        antenna.position.y = 1.05;
        this.group.add(antenna);

        // Antenna tip (glowing sphere)
        const tipGeom = new THREE.SphereGeometry(0.05, 16, 16);
        const tipMat = new THREE.MeshStandardMaterial({ 
            color: COLORS.antenna,
            emissive: COLORS.antenna,
            emissiveIntensity: 1.5,
            metalness: 1,
            roughness: 0
        });
        this.antennaTip = new THREE.Mesh(tipGeom, tipMat);
        this.antennaTip.position.y = 1.25;
        this.group.add(this.antennaTip);

        // Antenna light
        const tipLight = new THREE.PointLight(COLORS.antenna, 1, 3);
        tipLight.position.y = 1.25;
        this.group.add(tipLight);
        this.antennaLight = tipLight;

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
        
        // Antenna pulse
        const pulse = (Math.sin(this.idleTime * 3) + 1) * 0.5 + 0.5;
        this.antennaTip.material.emissiveIntensity = 1 + pulse;
        this.antennaLight.intensity = 0.5 + pulse * 0.5;
        
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
