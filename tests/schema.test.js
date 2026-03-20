import { describe, test, expect } from "bun:test";
import fs from "fs";
import path from "path";

import { parseJsonSchema } from "../src/schema.js";
import { compile } from "../src/ast.js";
import { catalog } from "../src/catalog.js";

const cat = catalog();
const { validate } = cat;

// Resolve the path to the draft2020-12 test suite
// Bun's import.meta.dir points to the directory of the current file
const SUITE_DIR = path.resolve(import.meta.dir, "suite/tests/draft2020-12");

// 🟢 THE WHITELIST: Start with the absolute basics.
// As you implement features in your parser, uncomment the next file!
const TARGET_FILES = [
    "type.json",           // The absolute foundation (string, number, array, object, null)
    "maxLength.json",      // String validators
    "minLength.json",
    "maximum.json",        // Number validators
    "minimum.json",
    "properties.json",     // Object properties
    "required.json",       // Required properties
    "items.json",          // Array items
];

// Skip test groups that use features not yet implemented
const SKIP_GROUPS = new Set([
    // properties.json — patternProperties/additionalProperties not yet supported
    "properties, patternProperties, additionalProperties interaction",
    // items.json — prefixItems not yet supported
    "items and subitems",
    "prefixItems with no additional items allowed",
    "items does not look in applicators, valid case",
    "prefixItems validation adjusts the starting index for items",
    "items with heterogeneous array",
]);

for (const file of TARGET_FILES) {
    const filePath = path.join(SUITE_DIR, file);
    
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Skipping ${file} - file not found. Check submodule path.`);
        continue;
    }

    const testGroups = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Bun dynamically creates a test suite for each file
    describe(`JSON Schema: ${file}`, () => {
        
        for (const group of testGroups) {
            if (SKIP_GROUPS.has(group.description)) continue;
            describe(group.description, () => {
                let compiledRoot;
                let compileError = null;

                // 1. We attempt to compile the schema ONCE per group
                try {
                    const ast = parseJsonSchema(group.schema);
                    const compiled = compile(cat, ast);
                    compiledRoot = compiled.root;
                } catch (err) {
                    // We catch the error but don't throw it yet. 
                    // We want the individual `it` blocks to fail so Bun reports them properly.
                    compileError = err;
                }

                // 2. Loop through every payload test for this schema
                for (const testCase of group.tests) {
                    test(testCase.description, () => {
                        
                        if (
                            testCase.description === 'none of the properties mentioned' ||
                            testCase.descriptin === '__proto__ present' ||
                            testCase.description === 'toString present'
                        ) {
                            debugger;
                        }
                        // If your parser or compiler isn't ready for this schema syntax, 
                        // the test fails immediately, telling you what you need to build next.
                        if (compileError) {
                            throw new Error(
                                `Parser/Compiler failed: ${compileError.message}\n` +
                                `Schema: ${JSON.stringify(group.schema)}`
                            );
                        }
                        // 3. The Max Squeeze Check
                        const isValid = validate(testCase.data, compiledRoot);
                        
                        expect(isValid).toBe(testCase.valid);
                    });
                }
            });
        }
    });
}