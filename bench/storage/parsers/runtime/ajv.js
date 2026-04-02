/**
 * AJV runtime parser — compiles a JSON Schema at runtime.
 *
 * Usage: node bench/storage/parsers/runtime/ajv.js <schema-path>
 *
 * Prints compile time and the returned validate function type.
 */
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import AjvDraft04 from 'ajv-draft-04';

const schemaPath = process.argv[2];
if (!schemaPath) {
    console.error('Usage: node ajv.js <schema-path>');
    process.exit(1);
}

const raw = fs.readFileSync(path.resolve(schemaPath), 'utf8');
const schema = JSON.parse(raw);

/**
 * Detect draft from the schema's $schema or $id field.
 * ajv-draft-04 must be used for draft-04 schemas.
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
    ajv = new AjvDraft04({ allErrors: false, strict: false });
} else {
    ajv = new Ajv({ allErrors: false });
}

console.log('Compiling with AJV...');
let t0 = performance.now();
let validate;
try {
    validate = ajv.compile(schema);
    let t1 = performance.now();
    console.log(`Compile time: ${(t1 - t0).toFixed(2)} ms`);
    console.log(`Validate fn:  ${typeof validate}`);
} catch (err) {
    let t1 = performance.now();
    console.log(`Compile FAILED after ${(t1 - t0).toFixed(2)} ms`);
    console.error(err.message);
    process.exit(1);
}
