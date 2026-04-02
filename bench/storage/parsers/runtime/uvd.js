/**
 * UVD runtime parser — compiles a JSON Schema at runtime.
 *
 * Usage: node bench/storage/parsers/runtime/uvd.js <schema-path>
 *
 * Prints compile time and the compiled typedef pointer.
 */
import fs from 'fs';
import path from 'path';
import { catalog, CompoundSchema, compile } from '../../../../src/core.js';

const schemaPath = process.argv[2];
if (!schemaPath) {
    console.error('Usage: node uvd.js <schema-path>');
    process.exit(1);
}

const raw = fs.readFileSync(path.resolve(schemaPath), 'utf8');
const schema = JSON.parse(raw);

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

/** Load the draft meta-schema so CompoundSchema can resolve $ref */
const specsDir = path.resolve(import.meta.dirname, '../../../../tests/specs', draft);
const metaSchemaPath = path.join(specsDir, 'schema.json');
let rootMetaSchema = null;
let rootMetaUri = '';
let vocabSchemas = [];

if (fs.existsSync(metaSchemaPath)) {
    rootMetaSchema = JSON.parse(fs.readFileSync(metaSchemaPath, 'utf8'));
    rootMetaUri = rootMetaSchema.$id || rootMetaSchema.id || `https://json-schema.org/${draft}/schema`;

    /** Load vocabulary schemas if any (draft2019-09, draft2020-12) */
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

console.log('Compiling with UVD...');
let t0 = performance.now();
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
    let t1 = performance.now();

    let rootType = compiled[0].schema;
    console.log(`Compile time: ${(t1 - t0).toFixed(2)} ms`);
    console.log(`Root typedef: ${rootType} (0x${rootType.toString(16)})`);
} catch (err) {
    let t1 = performance.now();
    console.log(`Compile FAILED after ${(t1 - t0).toFixed(2)} ms`);
    console.error(err.message);
    if (err.stack) {
        console.error(err.stack.split('\n').slice(0, 5).join('\n'));
    }
    process.exit(1);
}
