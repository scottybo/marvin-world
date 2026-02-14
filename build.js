import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';

console.log('🔨 Building Marvin\'s World...');

try {
    // Bundle the JavaScript
    const result = await build({
        entryPoints: ['src/main.js'],
        bundle: true,
        format: 'esm',
        minify: true,
        write: false,
        external: ['three', 'three/*']
    });

    // Get the bundled code
    const bundledCode = result.outputFiles[0].text;

    // Read the HTML template
    const template = readFileSync('template.html', 'utf-8');

    // Inject the bundled code
    const html = template.replace('{{BUNDLE}}', bundledCode);

    // Write the final HTML file
    writeFileSync('dist/index.html', html);

    console.log('✅ Build complete: dist/index.html');
    console.log(`📦 Bundle size: ${(bundledCode.length / 1024).toFixed(2)} KB`);
} catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
}
