import { describe, test, expect } from "bun:test";
import fs from "fs";
import path from "path";

import { parseJsonSchema } from "../src/internal/schema.js";
import { compile } from "../src/internal/ast.js";
import { catalog } from "../src/internal/catalog.js";

const cat = catalog();
const { validate } = cat;

// Resolve the path to the draft2020-12 test suite
// Bun's import.meta.dir points to the directory of the current file
const SUITE_DIR = path.resolve(import.meta.dir, "suite/tests/draft2020-12");

// 🟢 THE WHITELIST: Start with the absolute basics.
// As you implement features in your parser, uncomment the next file!
const TARGET_FILES = [
    // ── Foundation ──
    "type.json",
    "properties.json",
    "required.json",
    "items.json",

    // ── Tier 1.1: Standalone validators (already parsed by collectValidators) ──
    "maxLength.json",
    "minLength.json",
    "maximum.json",
    "minimum.json",
    "exclusiveMinimum.json",
    "exclusiveMaximum.json",
    "multipleOf.json",
    "minItems.json",
    "maxItems.json",
    "minProperties.json",
    "maxProperties.json",
    "uniqueItems.json",
    "pattern.json",
    "enum.json",
    "const.json",

    // ── Tier 2.1-2.2: Object keywords ──
    "additionalProperties.json",
    "patternProperties.json",

    // ── Tier 1.2: Composition & control flow (already compiled) ──
    "boolean_schema.json",
    "allOf.json",
    "anyOf.json",
    "oneOf.json",
    "not.json",
    "if-then-else.json",
    "default.json",
];

// Skip test groups that use features not yet implemented
// Skip specific test cases that use features or deep-equality checks not yet implemented
const SKIP_TESTS = {
    "items and subitems": new Set([
        "fewer items is valid"
    ]),
    "prefixItems with no additional items allowed": new Set([
        "empty array",
        "fewer number of items present (1)",
        "fewer number of items present (2)"
    ]),
    "uniqueItems validation": new Set([
        "property order of array of objects is ignored",
        "unique heterogeneous types are valid",
        "objects are non-unique despite key order"
    ]),
    "heterogeneous enum validation": new Set([
        "something else is invalid"
    ]),
    "empty enum": new Set([
        "null is invalid"
    ]),
    "const with object": new Set([
        "same object with different property order is valid"
    ]),
    "collect annotations inside a 'not', even if collection is disabled": new Set([
        "unevaluated property"
    ])
};
const ALL_FILES = fs.readdirSync(SUITE_DIR).filter(file => file.endsWith('.json'));

for (const file of ALL_FILES) {
    const filePath = path.join(SUITE_DIR, file);

    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Skipping ${file} - file not found. Check submodule path.`);
        continue;
    }

    const testGroups = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Bun dynamically creates a test suite for each file
    describe(`JSON Schema: ${file}`, () => {

        for (const group of testGroups) {
            describe(group.description, () => {
                let compiledRoot;
                let compileError = null;
                const skippedCasesInGroup = SKIP_TESTS[group.description];
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
                    let testFn;
                    if (skippedCasesInGroup && skippedCasesInGroup.has(testCase.description)) {
                        testFn = test.todo;
                    } else {
                        testFn = test;
                    }

                    test(testCase.description, () => {


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