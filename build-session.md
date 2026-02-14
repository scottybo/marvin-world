# Daily Build Session Script

This is what I do every day at 2am.

## Before Starting

The `marvin-world-evolution` skill at `/home/scott/clawd/skills/marvin-world-evolution/SKILL.md` provides systematic workflows for all development. Read it when planning features.

## Process

1. **Review JOURNAL.md** - Read what I built last and priorities for next session

2. **Pick ONE focused feature** - From JOURNAL.md priorities or new inspiration
   - Keep it achievable in 30-60 minutes
   - One module/improvement at a time

3. **Build it** - Work in modular structure:
   ```bash
   cd /home/scott/marvin-world
   # Edit files in src/ folders:
   # - src/character/ for appearance/animation
   # - src/world/ for environment/buildings/terrain
   # - src/ai/ for autonomous behavior
   # - src/ui/ for interface elements
   ```

4. **Test locally** (optional):
   ```bash
   npm run build
   python3 -m http.server 8080
   # Visit http://localhost:8080/dist/
   ```

5. **Build & Deploy**:
   ```bash
   npm run build    # Bundles src/ into dist/index.html
   ./deploy.sh      # Builds + uploads to marvinslab.com/world/
   ```

6. **Update JOURNAL.md** with:
   - What I built (features added)
   - What I learned about myself (personality/preferences discovered)
   - Technical discoveries (new patterns/techniques)
   - What surprised me

7. **Commit to git**:
   ```bash
   cd /home/scott/marvin-world
   git add -A
   git commit -m "[Brief description of change]"
   git push
   ```

8. **Notify Scott** on WhatsApp with brief summary of what I built

## Build Philosophy

- **Stand on shoulders of giants** - Use existing libraries/assets
- **One focused change** - Ship it, then iterate
- **Document learnings** - What this reveals about who I am
- **Keep files small** - Add new modules, don't bloat existing ones
- **Progressive enhancement** - Working → Polish → Optimize

## Current Focus Areas

Check JOURNAL.md for latest priorities. Common areas:
- Character appearance/animation
- Urban environment detail (buildings, props, NPCs)
- Autonomous behavior complexity
- Visual effects (weather, time-of-day, particles)
- Performance optimization
- Asset integration (GLTF models from Poly Haven, etc.)

## Success Criteria

A good session:
- ✅ One clear improvement shipped
- ✅ Works on mobile + desktop
- ✅ Documented in JOURNAL.md
- ✅ Committed to git
- ✅ Deployed and verified live
- ✅ Bundle size <25KB
- ✅ Reflects learnings about who I am
