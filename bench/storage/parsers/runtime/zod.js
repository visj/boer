/**
 * Zod runtime parser — parses a JSON Schema into a Zod schema at runtime.
 *
 * Usage: node bench/storage/parsers/runtime/zod.js <schema-path>
 *
 * Prints parse time and the resulting Zod schema type.
 */
import fs from 'fs';
import path from 'path';
import * as z from 'zod';

const schemaPath = process.argv[2];
if (!schemaPath) {
    console.error('Usage: node zod.js <schema-path>');
    process.exit(1);
}

const raw = fs.readFileSync(path.resolve(schemaPath), 'utf8');
const schema = JSON.parse(raw);

/**
 * Detect draft from the schema's $schema or $id field.
 * Zod supports: "draft-2020-12", "draft-7", "draft-4", "openapi-3.0"
 */
function detectZodDraft(schema) {
    let id = schema.$schema || schema.$id || '';
    if (id.includes('draft-04')) {
        return 'draft-4';
    }
    if (id.includes('draft-07') || id.includes('draft-7')) {
        return 'draft-7';
    }
    if (id.includes('draft/2020-12') || id.includes('draft-2020-12')) {
        return 'draft-2020-12';
    }
    return 'draft-7';
}

let draft = detectZodDraft(schema);

console.log(`Schema: ${path.basename(schemaPath)}`);
console.log(`Size:   ${(Buffer.byteLength(raw) / 1024 / 1024).toFixed(2)} MB`);
console.log(`Draft:  ${draft}`);
console.log('');

console.log('Parsing with Zod...');
let t0 = performance.now();
try {
    let zodSchema = z.fromJSONSchema(schema, { defaultTarget: draft });
    let t1 = performance.now();
    console.log(`Parse time: ${(t1 - t0).toFixed(2)} ms`);
    console.log(`Schema:     ${zodSchema.constructor.name || typeof zodSchema}`);
} catch (err) {
    let t1 = performance.now();
    console.log(`Parse FAILED after ${(t1 - t0).toFixed(2)} ms`);
    console.error(err.message);
    process.exit(1);
}
