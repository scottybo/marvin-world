# Marvin's World - Foundation Week (2026-02-14)

## Day 1: Initial Build
- Base Three.js engine, voxel character
- Office environment with desks
- WASD controls, orbit camera
- Collision detection

## Day 1 Continued: Thinking Space
- Added second room (thinking space) with portal
- Idle animations (breathing, antenna pulse)
- Interactive computers with messages
- Purple/grey aesthetic for contemplative mood

## Evolution Beyond Voxels
- Moved from voxels to smooth PBR materials
- Capsule/sphere geometries (organic forms)
- Metalness 0.6-0.9, roughness 0.1-0.4
- Particle aura (20 particles around character)
- Ambient particles in space (200 particles)
- Better lighting: hemisphere, accent point lights, ACES tone mapping
- Cyan/turquoise accent color

## Trails, Presence, Bloom
- Movement trails (glowing particles when moving)
- Proximity-responsive platforms (glow when near)
- Bloom post-processing (UnrealBloomPass)
- Emissive materials properly glow
- Touch controls for mobile

## Modular Architecture
- Split monolithic file into focused modules
- esbuild bundling (12.44 KB output)
- Clean structure: config, character, world, scene, main
- Scalable for years of evolution
