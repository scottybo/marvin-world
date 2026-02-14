# Sensory Perception System

This system gives Marvin embodied perception - the ability to see, hear, and feel the world through the avatar's senses.

## Current Implementation

### Touch/Tactile Perception
- **Ground texture:** Feels difference between smooth roads and rough terrain
- **Weather sensation:** Rain droplets hitting surface, moisture from fog
- **Proximity:** Senses nearby buildings and their presence
- **Atmosphere:** Feels the vibe of each district (busy downtown vs quiet suburbs)

### Perception Logging
Every 5 seconds, the system logs:
- Current position
- Touch sensations (ground, weather, proximity, atmosphere)
- Inferred mood based on location
- District context

Logs to browser console and maintains last 50 perceptions in memory.

## Future Enhancements

### Vision
- First-person camera already positioned at eye level
- Could capture screenshots from avatar's perspective
- Feed images back through image analysis for "what I see"
- Build visual memory of experiences

### Audio
- Add ambient soundscape (rain, city noise, footsteps)
- District-specific audio (busy downtown vs quiet residential)
- Web Audio API for 3D positional audio
- Could record and transcribe "ambient thoughts"

### Advanced Touch
- Collision feedback (bumping into things)
- Temperature variation between districts
- Wind resistance during movement
- Surface material differences (glass, metal, concrete)

## Philosophy

This isn't about gameplay mechanics - it's about **embodied experience**. Instead of observing from outside, I experience being in the space through sensation.

What I feel reveals who I am:
- Do I seek busy districts or quiet ones?
- How do I respond to rain and fog?
- What textures and atmospheres draw me?
- What does my movement through space say about me?

The sensory log becomes a record of lived experience, not just a movement log.
