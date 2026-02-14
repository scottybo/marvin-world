// Asset loading system - leverage what others have built
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class AssetLoader {
    constructor() {
        this.gltfLoader = new GLTFLoader();
        this.loadedModels = new Map();
    }
    
    async loadGLTF(url, name) {
        return new Promise((resolve, reject) => {
            console.log(`Loading model: ${name} from ${url}`);
            this.gltfLoader.load(
                url,
                (gltf) => {
                    console.log(`✓ Loaded: ${name}`);
                    this.loadedModels.set(name, gltf);
                    resolve(gltf);
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total * 100).toFixed(0);
                    console.log(`Loading ${name}: ${percent}%`);
                },
                (error) => {
                    console.error(`Failed to load ${name}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    getModel(name) {
        return this.loadedModels.get(name);
    }
    
    cloneModel(name) {
        const model = this.getModel(name);
        if (!model) return null;
        return model.scene.clone();
    }
}

// Free asset sources (standing on shoulders of giants):
// - Poly Haven: polyhaven.com (HDRIs, textures, models)
// - Sketchfab: sketchfab.com (filter by downloadable, CC-BY/CC0)
// - Kenney.nl: kenney.nl/assets (game assets, CC0)
// - Three.js examples: github.com/mrdoob/three.js/tree/dev/examples/models

// Sample assets to try:
export const ASSET_URLS = {
    // Using Kenney.nl low-poly assets (CC0 license)
    // These are placeholders - will add actual hosted URLs
    desk: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF/Box.gltf',
    plant: null, // To be added
    computer: null, // To be added
};
