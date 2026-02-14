import * as THREE from 'three';

export class InputManager {
    constructor(camera, interactiveObjects, showMessage) {
        this.camera = camera;
        this.interactiveObjects = interactiveObjects;
        this.showMessage = showMessage;
        
        this.keys = {};
        this.touchStart = null;
        this.touchCurrent = null;
        this.touchMoving = false;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.setupControls();
        this.setupInteraction();
    }

    setupControls() {
        // Detect touch device and show appropriate controls
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) {
            document.getElementById('desktop-controls').style.display = 'none';
            document.getElementById('mobile-controls').style.display = 'block';
        }

        // Touch input for movement
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.touchStart = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
                this.touchCurrent = { ...this.touchStart };
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && this.touchStart) {
                this.touchCurrent = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
                this.touchMoving = true;
            }
        });

        window.addEventListener('touchend', (e) => {
            // Check for tap (not drag) for interaction
            if (!this.touchMoving && this.touchStart) {
                this.handleTap(this.touchStart.x, this.touchStart.y);
            }
            
            this.touchStart = null;
            this.touchCurrent = null;
            this.touchMoving = false;
        });

        // Keyboard input
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    setupInteraction() {
        // Mouse click for desktop
        window.addEventListener('click', (event) => {
            this.handleClick(event.clientX, event.clientY);
        });
    }

    handleClick(clientX, clientY) {
        const container = document.getElementById('game-container');
        const rect = container.getBoundingClientRect();
        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        this.checkInteraction();
    }

    handleTap(clientX, clientY) {
        const container = document.getElementById('game-container');
        const rect = container.getBoundingClientRect();
        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        this.checkInteraction();
    }

    checkInteraction() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj.userData.message) {
                this.showMessage(obj.userData.message);
            }
        }
    }

    getMovementInput() {
        let dx = 0;
        let dz = 0;

        // Keyboard input
        if (this.keys['w'] || this.keys['arrowup']) dz -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dz += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;

        // Touch input - drag to move
        if (this.touchMoving && this.touchStart && this.touchCurrent) {
            const deltaX = this.touchCurrent.x - this.touchStart.x;
            const deltaY = this.touchCurrent.y - this.touchStart.y;
            const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (magnitude > 10) { // Minimum drag distance
                const normalized = Math.min(magnitude / 100, 1); // Normalize to 0-1
                dx += (deltaX / magnitude) * normalized * 2;
                dz += (deltaY / magnitude) * normalized * 2;
            }
        }

        return { dx, dz };
    }
}
