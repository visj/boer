import fs from 'fs';
import path from 'path';
import { rolldown } from 'rolldown';
import { minify } from 'terser';

const cwd = process.cwd();
const outputDir = path.resolve(cwd, 'dist');

async function build() {
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir);

    const bundle = await rolldown({
        input: { index: 'src/schema.js' },
        external: [/^@luvd\//, 'uri-js'],
    });

    const { output } = await bundle.generate({
        format: 'esm',
        sourcemap: true,
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
    });

    for (const chunk of output) {
        if (chunk.type !== 'chunk') {
            continue;
        }
        const fileName = chunk.fileName;
        const minified = await minify(chunk.code, {
            sourceMap: {
                content: chunk.map,
                url: `${path.basename(fileName)}.map`,
            },
            compress: {
                passes: 2,
                inline: false,
                reduce_funcs: false,
                hoist_funs: true,
            },
            mangle: true,
        });
        const outputPath = path.resolve(outputDir, fileName);
        const outputDirName = path.dirname(outputPath);
        if (!fs.existsSync(outputDirName)) {
            fs.mkdirSync(outputDirName, { recursive: true });
        }
        fs.writeFileSync(outputPath, minified.code);
        fs.writeFileSync(`${outputPath}.map`, minified.map);
    }

    /** Copy type declarations to dist */
    const typesDir = path.resolve(cwd, 'types');
    if (fs.existsSync(typesDir)) {
        for (const file of fs.readdirSync(typesDir)) {
            if (file.endsWith('.d.ts')) {
                fs.copyFileSync(
                    path.resolve(typesDir, file),
                    path.resolve(outputDir, file)
                );
            }
        }
    }
}

build().catch(console.error);
