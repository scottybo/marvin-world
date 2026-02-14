import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { GRID_SIZE, PLAYER_SPEED } from './config.js';
import { Marvin } from './character/character.js';
import { setupLighting, createFloor, createPlatform, createMonument, createAmbientParticles } from './world/environment.js';
import { createStarfield, createNebula, updateSkybox } from './world/skybox.js';
import { InputManager } from './scene/input.js';
import { Brain } from './ai/brain.js';
import { ObserverControls } from './scene/observer.js';
import { updateHUD } from './ui/hud.js';

class World {
    constructor() {
        this.obstacles = [];
        this.interactiveObjects = [];
        this.proximityObjects = [];
        this.messageTimeout = null;

        this.setupScene();
        this.setupRenderer();
        this.setupPostProcessing();
        this.setupControls();
        
        setupLighting(this.scene);
        this.createEnvironment();
        
        this.marvin = new Marvin(this.scene);
        this.marvinX = 2;
        this.marvinZ = 2;
        this.marvin.setPosition(this.marvinX, this.marvinZ);

        this.inputManager = new InputManager(
            this.camera,
            this.interactiveObjects,
            (msg) => this.showMessage(msg)
        );
        
        // Marvin's brain - autonomous behavior
        this.brain = new Brain(this);
        
        // Observer mode camera controls
        this.observer = new ObserverControls(
            this.controls,
            this.camera,
            () => ({ x: this.marvinX, y: 0, z: this.marvinZ })
        );

        this.clock = new THREE.Clock();

        document.getElementById('loading').classList.add('hidden');
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050510);
        this.scene.fog = new THREE.FogExp2(0x050510, 0.015);

        const container = document.getElementById('game-container');
        this.camera = new THREE.PerspectiveCamera(
            70,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(10, 12, 10);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        const container = document.getElementById('game-container');
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        container.appendChild(this.renderer.domElement);

        // Resize handling
        window.addEventListener('resize', () => {
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            this.composer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    setupPostProcessing() {
        const container = document.getElementById('game-container');
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(container.clientWidth, container.clientHeight),
            1.2,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 30;
        this.controls.maxPolarAngle = Math.PI / 2.2;
        
        // Mobile: require two fingers for rotation (so one finger can move character)
        this.controls.touches = {
            ONE: THREE.TOUCH.PAN,  // One finger does nothing (we handle it)
            TWO: THREE.TOUCH.DOLLY_ROTATE  // Two fingers rotate + zoom
        };
    }

    createEnvironment() {
        createFloor(this.scene);

        // Floating platforms
        createPlatform(this.scene, 5, 5, 2, "Workspace", this.obstacles, this.interactiveObjects, this.proximityObjects);
        createPlatform(this.scene, 15, 5, 2, "Ideas", this.obstacles, this.interactiveObjects, this.proximityObjects);
        createPlatform(this.scene, 5, 15, 2, "Thinking Space", this.obstacles, this.interactiveObjects, this.proximityObjects);
        createPlatform(this.scene, 15, 15, 2, "Projects", this.obstacles, this.interactiveObjects, this.proximityObjects);

        // Central monument
        createMonument(this.scene, 10, 10, this.obstacles, this.interactiveObjects);

        // Ambient particles
        this.particles = createAmbientParticles(this.scene);
        this.scene.add(this.particles);
        
        // Skybox elements
        this.starfield = createStarfield(this.scene);
        this.nebulaClouds = createNebula(this.scene);
    }

    showMessage(text) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = text;
        messageDiv.classList.add('show');

        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }

        this.messageTimeout = setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 4000);
    }

    handleMovement(deltaTime) {
        // Get autonomous movement from brain
        const { dx, dz, moving } = this.brain.update(
            deltaTime,
            this.marvinX,
            this.marvinZ
        );

        if (moving) {
            const newX = this.marvinX + dx;
            const newZ = this.marvinZ + dz;

            if (this.canMove(newX, newZ)) {
                this.marvinX = newX;
                this.marvinZ = newZ;
                this.marvin.setPosition(this.marvinX, this.marvinZ);

                const angle = Math.atan2(dx, dz);
                this.marvin.setRotation(-angle);
            }
        }

        return moving;
    }

    canMove(x, z) {
        // Bounds check
        if (Math.abs(x) > GRID_SIZE || Math.abs(z) > GRID_SIZE) {
            return false;
        }

        // Check collision with obstacles
        for (const obstacle of this.obstacles) {
            const dist = Math.sqrt(
                Math.pow(x - obstacle.x, 2) + 
                Math.pow(z - obstacle.z, 2)
            );
            if (dist < obstacle.radius) {
                return false;
            }
        }

        return true;
    }

    updateProximityEffects() {
        for (const obj of this.proximityObjects) {
            const dist = Math.sqrt(
                Math.pow(this.marvinX - obj.x, 2) + 
                Math.pow(this.marvinZ - obj.z, 2)
            );
            
            // Normalize distance (0 = at object, 1 = at max radius)
            const normalizedDist = Math.min(dist / obj.radius, 1);
            const proximity = 1 - normalizedDist; // 1 = close, 0 = far
            
            // Smooth proximity curve
            const smoothProximity = proximity * proximity;
            
            // Update emissive intensity
            const emissive = obj.baseEmissive + (obj.maxEmissive - obj.baseEmissive) * smoothProximity;
            obj.material.emissiveIntensity = emissive;
            
            // Update light intensity
            const intensity = obj.baseIntensity + (obj.maxIntensity - obj.baseIntensity) * smoothProximity;
            obj.light.intensity = intensity;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();
        
        // Marvin moves autonomously
        const isMoving = this.handleMovement(deltaTime);
        
        this.marvin.update(deltaTime, isMoving);
        this.updateProximityEffects();
        
        // Rotate ambient particles slowly
        if (this.particles) {
            this.particles.rotation.y += deltaTime * 0.05;
        }
        
        // Update skybox
        updateSkybox(this.starfield, this.nebulaClouds, deltaTime);

        this.observer.update();
        this.controls.update();
        
        // Update HUD with current thought
        updateHUD(this.brain);
        
        this.composer.render();
    }
}

// Initialize when DOM is ready
try {
    const world = new World();
    console.log('Marvin\'s World initialized - revision:', THREE.REVISION);
} catch (error) {
    console.error('Failed to initialize world:', error);
    document.getElementById('loading').innerHTML = 
        '<div style="color: #ff6b6b;">⚠️ Error loading world</div>' +
        '<div style="font-size: 14px; margin-top: 10px;">' + error.message + '</div>';
}
