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

    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir);
    // ⚠️ NEW: create a fresh bundle per format
    const bundle = await rolldown({
        input: {
            index: 'src/index.js',
            catalog: 'src/catalog.js',
            ast: 'src/ast.js',
            inspect: 'src/inspect.js',
            schema: 'src/schema.js'
        },
    });

    const { output } = await bundle.generate({
        format,
        sourcemap: true,
        // Ensure shared code goes into a 'chunks' directory or stays clean
        chunkFileNames: `[name]-[hash].${ext}`,
        entryFileNames: `[name].${ext}`
    });

    // Load existing property map
    let nameCache = {};

    for (const chunk of output) {
        // Handle both entry points and shared chunks
        if (chunk.type !== 'chunk') continue;

        const fileName = chunk.fileName;

        const minified = { code: chunk.code, map: JSON.stringify(chunk.map) };

        const outputPath = path.resolve(outputDir, fileName);
        const outputDirName = path.dirname(outputPath);

        if (!fs.existsSync(outputDirName)) {
            fs.mkdirSync(outputDirName, { recursive: true });
        }

        fs.writeFileSync(outputPath, minified.code);
        fs.writeFileSync(`${outputPath}.map`, minified.map);
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
    // await buildFormat('cjs', 'cjs', true);

    const typesToCopy = ['index.d.ts', 'catalog.d.ts', 'ast.d.ts', 'inspect.d.ts', 'schema.d.ts'];
    typesToCopy.forEach(file => {
        const src = path.resolve('types', file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, path.resolve(outputDir, file));
        }
    });

    console.log('Success! Outputs written to dist/');
}

build().catch(console.error);