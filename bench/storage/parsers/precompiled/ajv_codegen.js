/**
 * AJV standalone code generator — compiles a JSON Schema into a
 * self-contained validation module that can be loaded without AJV.
 *
 * Usage: node bench/storage/parsers/precompiled/ajv_codegen.js <schema-path> [output-path]
 *
 * If output-path is omitted, writes to <schema-basename>.validate.mjs
 * in the same directory as this script.
 *
 * Prints: compile time, generated code size, output path.
 */
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import AjvDraft04 from 'ajv-draft-04';
import standaloneCode from 'ajv/dist/standalone/index.js';

const schemaPath = process.argv[2];
if (!schemaPath) {
    console.error('Usage: node ajv_codegen.js <schema-path> [output-path]');
    process.exit(1);
}

const raw = fs.readFileSync(path.resolve(schemaPath), 'utf8');
const schema = JSON.parse(raw);

let baseName = path.basename(schemaPath, path.extname(schemaPath));
let outputPath = process.argv[3] || path.join(import.meta.dirname, `${baseName}.validate.mjs`);

/**
 * Detect draft from the schema's $schema or $id field.
 */
function detectDraft(schema) {
    let id = schema.$schema || schema.$id || '';
    if (id.includes('draft-04')) {
        return 'draft-04';
    }
    return 'default';
}

let draft = detectDraft(schema);

console.log(`Schema: ${path.basename(schemaPath)}`);
console.log(`Size:   ${(Buffer.byteLength(raw) / 1024 / 1024).toFixed(2)} MB`);
console.log(`Draft:  ${draft}`);
console.log('');

let ajv;
if (draft === 'draft-04') {
    ajv = new AjvDraft04({ allErrors: false, strict: false, code: { source: true, esm: true } });
} else {
    ajv = new Ajv({ allErrors: false, strict: false, code: { source: true, esm: true } });
}

console.log('Step 1: Compiling with AJV...');
let t0 = performance.now();
let validate;
try {
    validate = ajv.compile(schema);
} catch (err) {
    let t1 = performance.now();
    console.log(`Compile FAILED after ${(t1 - t0).toFixed(2)} ms`);
    console.error(err.message);
    process.exit(1);
}
let t1 = performance.now();
console.log(`Compile time: ${(t1 - t0).toFixed(2)} ms`);

console.log('Step 2: Generating standalone code...');
let t2 = performance.now();
let code;
try {
    code = standaloneCode(ajv, validate);
} catch (err) {
    let t3 = performance.now();
    console.log(`Codegen FAILED after ${(t3 - t2).toFixed(2)} ms`);
    console.error(err.message);
    process.exit(1);
}
let t3 = performance.now();
console.log(`Codegen time: ${(t3 - t2).toFixed(2)} ms`);

fs.writeFileSync(outputPath, code, 'utf8');

let codeSize = Buffer.byteLength(code);
console.log('');
console.log(`Output: ${outputPath}`);
console.log(`Code size: ${(codeSize / 1024).toFixed(2)} KB (${(codeSize / 1024 / 1024).toFixed(2)} MB)`);
console.log(`Total time: ${(t3 - t0).toFixed(2)} ms`);
