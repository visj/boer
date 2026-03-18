import fs from 'fs';
import path from 'path';
import { rolldown } from 'rolldown';
import { minify } from 'terser';

const cwd = process.cwd();
const outputDir = path.resolve(cwd, 'dist');
const buildDir = path.resolve(cwd, 'build');
const mangleFile = path.resolve(buildDir, 'mangle.json');

async function buildFormat(format, ext, isModule) {
    console.log(`2. Generating ${format.toUpperCase()} build...`);

    // ⚠️ NEW: create a fresh bundle per format
    const bundle = await rolldown({
        input: {
            core: 'src/core.js',
            index: 'src/index.js'
        }
    });

    const { output } = await bundle.generate({
        format,
        sourcemap: true,
    });

    // Load existing property map
    let nameCache = {};
    // if (fs.existsSync(mangleFile)) {
    //     nameCache = JSON.parse(fs.readFileSync(mangleFile, 'utf8'));
    // }

    for (const chunk of output) {
        if (chunk.type !== 'chunk') continue;

        const fileName = `${chunk.name}.${ext}`;

        const minified = await minify(chunk.code, {
            sourceMap: {
                content: chunk.map,
                url: `${fileName}.map`
            },
            module: isModule,
            compress: {
                passes: 2,
                unsafe: true,
                dead_code: true,
                inline: 3
            },
            mangle: {
                properties: {
                    regex: /^_/
                }
            },
            nameCache
        });
        // Ugly hack, don't know how to fix it
        if (fileName === 'index.cjs') {
            minified.code = minified.code.replace('require("./core.js")', 'require("./core.cjs")');
        }

        fs.writeFileSync(path.resolve(outputDir, fileName), minified.code);
        fs.writeFileSync(path.resolve(outputDir, `${fileName}.map`), minified.map);
    }
}

async function build() {
    console.log('1. Bundling with Rolldown...');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // ✅ Build ESM
    await buildFormat('esm', 'js', true);

    // ✅ Build CJS (separate graph → correct imports)
    await buildFormat('cjs', 'cjs', true);

    // Copy types
    if (fs.existsSync('types/core.d.ts')) {
        fs.copyFileSync('types/core.d.ts', path.resolve(outputDir, 'core.d.ts'));
    }
    if (fs.existsSync('types/index.d.ts')) {
        fs.copyFileSync('types/index.d.ts', path.resolve(outputDir, 'index.d.ts'));
    }

    console.log('Success! Outputs written to dist/');
}

build().catch(console.error);