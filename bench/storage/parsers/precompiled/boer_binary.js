/**
 * boer binary generator — compiles a JSON Schema and dumps the catalog
 * to a binary file that can be loaded instantly without re-parsing.
 *
 * Usage: node bench/storage/parsers/precompiled/boer_binary.js <schema-path> [output-path]
 *
 * If output-path is omitted, writes to <schema-basename>.boer
 * in the same directory as this script.
 *
 * Prints: compile time, dump time, binary size, output path.
 */
import fs from 'fs';
import path from 'path';
import { catalog } from '@boer/validate';
import { CompoundSchema } from '@boer/schema';
import { compile } from '@boer/compiler';
import { dump, print } from '@boer/inspect';

const schemaPath = process.argv[2];
if (!schemaPath) {
    console.error('Usage: node boer_binary.js <schema-path> [output-path]');
    process.exit(1);
}

const raw = fs.readFileSync(path.resolve(schemaPath), 'utf8');
const schema = JSON.parse(raw);

let baseName = path.basename(schemaPath, path.extname(schemaPath));
let outputPath = process.argv[3] || path.join(import.meta.dirname, `${baseName}.boer`);

/**
 * Detect draft from the schema's $schema or $id field.
 */
function detectDraft(schema) {
    let id = schema.$schema || schema.$id || '';
    if (id.includes('draft-04')) {
        return 'draft-04';
    }
    if (id.includes('draft-06')) {
        return 'draft-06';
    }
    if (id.includes('draft-07')) {
        return 'draft-07';
    }
    if (id.includes('draft/2019-09')) {
        return 'draft2019-09';
    }
    if (id.includes('draft/2020-12')) {
        return 'draft2020-12';
    }
    return 'draft-07';
}

let draft = detectDraft(schema);

console.log(`Schema: ${path.basename(schemaPath)}`);
console.log(`Size:   ${(Buffer.byteLength(raw) / 1024 / 1024).toFixed(2)} MB`);
console.log(`Draft:  ${draft}`);
console.log('');

/** Load the draft meta-schema */
const specsDir = path.resolve(import.meta.dirname, '../../../../tests/specs', draft);
const metaSchemaPath = path.join(specsDir, 'schema.json');
let rootMetaSchema = null;
let rootMetaUri = '';
let vocabSchemas = [];

if (fs.existsSync(metaSchemaPath)) {
    rootMetaSchema = JSON.parse(fs.readFileSync(metaSchemaPath, 'utf8'));
    rootMetaUri = rootMetaSchema.$id || rootMetaSchema.id || `https://json-schema.org/${draft}/schema`;

    if (Array.isArray(rootMetaSchema.allOf)) {
        for (let branch of rootMetaSchema.allOf) {
            if (branch.$ref && branch.$ref.startsWith('meta/')) {
                let vocabFileName = branch.$ref.replace('meta/', '') + '.json';
                let vocabPath = path.join(specsDir, 'meta', vocabFileName);
                if (fs.existsSync(vocabPath)) {
                    let vocabSchema = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
                    let vocabUri = vocabSchema.$id || vocabSchema.id;
                    if (vocabUri) {
                        vocabSchemas.push({ schema: vocabSchema, uri: vocabUri });
                    }
                }
            }
        }
    }
}

let cat = catalog();

console.log('Step 1: Compiling with boer...');
let t0 = performance.now();
let rootType;
try {
    let compound = new CompoundSchema(draft);
    if (rootMetaSchema) {
        compound.add(rootMetaSchema, rootMetaUri);
        for (let vocab of vocabSchemas) {
            compound.add(vocab.schema, vocab.uri);
        }
    }
    let ref = compound.add(schema);
    let ast = compound.bundle(ref);
    let compiled = compile(cat, ast);
    rootType = compiled[0].schema;
} catch (err) {
    let t1 = performance.now();
    console.log(`Compile FAILED after ${(t1 - t0).toFixed(2)} ms`);
    console.error(err.message);
    if (err.stack) {
        console.error(err.stack.split('\n').slice(0, 5).join('\n'));
    }
    process.exit(1);
}
let t1 = performance.now();
console.log(`Compile time: ${(t1 - t0).toFixed(2)} ms`);
console.log(`Root typedef: ${rootType} (0x${rootType.toString(16)})`);

/** Print allocation stats */
let stats = print(cat);
console.log('');
console.log('Allocation stats:');
console.log(`  SLAB:       ${stats.stats.slab.size} / ${stats.stats.slab.capacity} elements`);
console.log(`  KINDS:      ${stats.stats.kinds.size} / ${stats.stats.kinds.capacity} elements`);
console.log(`  VALIDATORS: ${stats.stats.validators.size} / ${stats.stats.validators.capacity} elements`);
console.log(`  Keys:       ${stats.stats.keys.size}`);
console.log(`  Regex:      ${stats.stats.regex.size}`);
console.log(`  Constants:  ${stats.stats.constants.size}`);
console.log(`  Enums:      ${stats.stats.enums.size}`);
console.log('');

console.log('Step 2: Dumping binary...');
let t2 = performance.now();
let bin;
try {
    bin = dump(cat);
} catch (err) {
    let t3 = performance.now();
    console.log(`Dump FAILED after ${(t3 - t2).toFixed(2)} ms`);
    console.error(err.message);
    process.exit(1);
}
let t3 = performance.now();
console.log(`Dump time: ${(t3 - t2).toFixed(2)} ms`);

fs.writeFileSync(outputPath, bin);

console.log('');
console.log(`Output: ${outputPath}`);
console.log(`Binary size: ${(bin.byteLength / 1024).toFixed(2)} KB (${(bin.byteLength / 1024 / 1024).toFixed(2)} MB)`);
console.log(`Total time: ${(t3 - t0).toFixed(2)} ms`);
