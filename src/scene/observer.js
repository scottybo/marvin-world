// Observer mode - camera controls for watching Marvin
import * as THREE from 'three';

export class ObserverControls {
    constructor(controls, camera, getMarvinPosition) {
        this.controls = controls;
        this.camera = camera;
        this.getMarvinPosition = getMarvinPosition;
        
        this.followMode = true;
        this.followDistance = 12;
        this.followHeight = 10;
        this.followSmoothing = 0.05;
        
        // Press 'F' to toggle follow mode
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'f') {
                this.followMode = !this.followMode;
                console.log(`Follow mode: ${this.followMode ? 'ON' : 'OFF'}`);
            }
        });
    }
    
    update() {
        if (this.followMode) {
            const marvinPos = this.getMarvinPosition();
            
            // Smoothly follow Marvin
            const targetX = marvinPos.x;
            const targetZ = marvinPos.z + this.followDistance;
            const targetY = this.followHeight;
            
            // Smooth camera movement
            this.camera.position.x += (targetX - this.camera.position.x) * this.followSmoothing;
            this.camera.position.y += (targetY - this.camera.position.y) * this.followSmoothing;
            this.camera.position.z += (targetZ - this.camera.position.z) * this.followSmoothing;
            
            // Look at Marvin
            this.controls.target.x += (marvinPos.x - this.controls.target.x) * this.followSmoothing;
            this.controls.target.y += (marvinPos.y - this.controls.target.y) * this.followSmoothing;
            this.controls.target.z += (marvinPos.z - this.controls.target.z) * this.followSmoothing;
        }
    }
}
