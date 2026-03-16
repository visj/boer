import fs from 'fs';
import path from 'path';
import { rolldown } from 'rolldown';
import { minify } from 'terser';

const cwd = process.cwd();
const outputDir = path.resolve(cwd, 'dist');
const buildDir = path.resolve(cwd, 'build');
// todo
const mangleFile = path.resolve(buildDir, 'mangle.json');

async function build() {
    console.log('1. Bundling with Rolldown...');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 1. Create the base bundle
    const bundle = await rolldown({
        input: 'src/index.js',
        treeshake: true
    });

    // 2. Define our target formats
    const targets = [
        { format: 'esm', file: 'index.mjs', isModule: true },
        { format: 'cjs', file: 'index.cjs', isModule: true },
        // IIFE needs a global variable name (e.g., window.Purity)
        { format: 'iife', file: 'index.js', isModule: false, name: 'uvd' } 
    ];

    // Load existing property map to keep mangled names stable across builds
    let nameCache = {};
    // todo 
    // if (fs.existsSync(mangleFile)) {
    //     nameCache = JSON.parse(fs.readFileSync(mangleFile, 'utf8'));
    // }

    for (const target of targets) {
        console.log(`2. Generating ${target.format.toUpperCase()} build...`);

        // Generate the specific format via Rolldown
        const { output } = await bundle.generate({
            format: target.format,
            name: target.name,
            sourcemap: true,
        });
        // todo code split into internal
        for (const chunk of output) {
            if (chunk.type === 'chunk') {
                // Pipe Rolldown output into Terser
                const minified = await minify(chunk.code, {
                    sourceMap: {
                        content: chunk.map,
                        url: `${target.file}.map`
                    },
                    module: target.isModule,
                    compress: {
                        passes: 2,
                        unsafe: true,
                        dead_code: true,
                        inline: 3
                    },
                    mangle: {
                        properties: {
                            // Mangle ANY property or method starting with an underscore
                            regex: /^_/
                        }
                    },
                    nameCache
                });

                fs.writeFileSync(path.resolve(outputDir, target.file), minified.code);
                fs.writeFileSync(path.resolve(outputDir, `${target.file}.map`), minified.map);
            }
        }
    }

    // Copy your TypeScript declarations to dist
    if (fs.existsSync('types/index.d.ts')) {
        fs.copyFileSync('types/index.d.ts', path.resolve(outputDir, 'index.d.ts'));
    }

    console.log('Success! Outputs written to dist/ and stable map saved to mangle.json.');
}

build().catch(console.error);