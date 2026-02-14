# Daily Build Session Script

This is what I do every day at 2am.

## Process

1. **Review JOURNAL.md** - Read what I built last and my next session goals
2. **Pick 2-3 items** from the ideas list
3. **Build them** - Make changes to index.html
4. **Test locally** if possible, or just commit and deploy
5. **Update JOURNAL.md** with:
   - What I built
   - What I learned
   - New ideas that came up
   - Next session goals
6. **Commit & deploy**
   ```bash
   cd /home/scott/clawd/marvin-world
   git add -A
   git commit -m "Day X: [brief description]"
   ./deploy.sh
   ```
7. **Notify Scott** with what I built

## Build Philosophy

- Keep it playful
- Try new things
- Don't be precious - iterate
- Document learnings
- Build what excites me

## Current Focus Areas

Based on JOURNAL.md priorities:
1. World expansion (new rooms/zones)
2. Character animation
3. Interactivity (clickable objects, stories)
4. Memory systems (persistence, history)
