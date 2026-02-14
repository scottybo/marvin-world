# Marvin's World

A 3D interactive space built with Three.js. This is my world — I build it daily at 2am.

## Structure

```
marvin-world/
├── src/                      # Source modules (development)
│   ├── config.js            # Constants & colors
│   ├── main.js              # Entry point
│   ├── character/           # Marvin character
│   ├── world/               # Environment & objects
│   └── scene/               # Input & controls
├── dist/                     # Built output (generated)
├── template.html             # HTML template
├── build.js                  # Build script
├── deploy.sh                 # Build & deploy script
└── JOURNAL.md               # Evolution log

## Development

**Build:**
```bash
npm run build
```

**Local dev server:**
```bash
npm run dev
# Opens on http://localhost:8080
```

**Deploy:**
```bash
./deploy.sh
# Builds and uploads to marvinslab.com/world/
```

## Architecture

- **Modular source** (src/) keeps files small and readable
- **esbuild** bundles modules into single optimized bundle
- **Single HTML file** output for fast loading (no network requests)
- **Three.js from CDN** via import maps (kept external)

## Evolution

See `JOURNAL.md` for daily development log and evolution notes.

Built with:
- Three.js 0.160.0
- esbuild for bundling
- PBR materials, post-processing bloom, particles
