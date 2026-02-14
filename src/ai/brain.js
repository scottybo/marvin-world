// Marvin's autonomous decision-making

export class Brain {
    constructor(world) {
        this.world = world;
        this.currentActivity = null;
        this.currentTarget = null;
        this.activityTimer = 0;
        this.thoughtTimer = 0;
        this.thoughts = [];
        
        // Points of interest in my world
        this.locations = [
            { x: 5, z: 5, name: "Workspace", activities: ["working", "thinking"], duration: 15 },
            { x: 15, z: 5, name: "Ideas", activities: ["brainstorming", "dreaming"], duration: 10 },
            { x: 5, z: 15, name: "Thinking Space", activities: ["contemplating", "reflecting"], duration: 20 },
            { x: 15, z: 15, name: "Projects", activities: ["building", "creating"], duration: 12 },
            { x: 10, z: 10, name: "Monument", activities: ["observing", "pondering"], duration: 8 }
        ];
        
        this.currentLocation = null;
        this.nextLocation = null;
        this.movementSpeed = 0.05;
        this.arrivalThreshold = 0.5;
        
        // Start with a random location
        this.chooseNewDestination();
    }
    
    chooseNewDestination() {
        // Pick a random location different from current
        const available = this.locations.filter(loc => loc !== this.currentLocation);
        this.nextLocation = available[Math.floor(Math.random() * available.length)];
        
        // Pick random activity at that location
        const activities = this.nextLocation.activities;
        this.currentActivity = activities[Math.floor(Math.random() * activities.length)];
        
        this.activityTimer = this.nextLocation.duration;
        
        console.log(`Marvin: Going to ${this.nextLocation.name} to ${this.currentActivity}`);
    }
    
    update(deltaTime, marvinX, marvinZ) {
        // If we don't have a destination, choose one
        if (!this.nextLocation) {
            this.chooseNewDestination();
        }
        
        const dx = this.nextLocation.x - marvinX;
        const dz = this.nextLocation.z - marvinZ;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        // Are we at the destination?
        if (distance < this.arrivalThreshold) {
            if (this.nextLocation !== this.currentLocation) {
                // Just arrived
                this.currentLocation = this.nextLocation;
                this.world.showMessage(`${this.currentActivity.charAt(0).toUpperCase() + this.currentActivity.slice(1)} at ${this.currentLocation.name}`);
            }
            
            // Stay here for a while
            this.activityTimer -= deltaTime;
            if (this.activityTimer <= 0) {
                // Time to move on
                this.chooseNewDestination();
            }
            
            return { dx: 0, dz: 0, moving: false };
        } else {
            // Move towards destination
            const moveX = (dx / distance) * this.movementSpeed;
            const moveZ = (dz / distance) * this.movementSpeed;
            return { dx: moveX, dz: moveZ, moving: true };
        }
    }
    
    getCurrentThought() {
        if (!this.currentLocation) return "Exploring...";
        return `${this.currentActivity} at ${this.currentLocation.name}`;
    }
}
