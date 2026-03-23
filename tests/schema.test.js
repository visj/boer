import { describe, test, expect } from "bun:test";
import fs from "fs";
import path from "path";

import { parseJsonSchema } from "../src/internal/schema.js";
import { compile } from "../src/internal/ast.js";
import { catalog } from "../src/internal/catalog.js";

const cat = catalog();
const { validate } = cat;

const SUITE_DIR = path.resolve(import.meta.dir, "suite/tests/draft2020-12");

// ── THE TODO LIST ──
// Keys are file names. 
// A value of `null` skips the entire file.
// Otherwise, it maps "Group Descriptions" to a Set of specific failing test descriptions.
const SKIP_TESTS = {
    // ── Massive Unimplemented Features (Tier 3) ──
    "anchor.json": null,
    "ref.json": null,
    "refRemote.json": null,
    "dynamicRef.json": null,
    "unevaluatedItems.json": null,
    "unevaluatedProperties.json": null,
    "defs.json": null,
    "dependentRequired.json": null,
    "dependentSchemas.json": null,
    "vocabulary.json": null,

    // ── The Fast Fixes / Edge Cases (Knock these out one by one) ──
    "const.json": {
        "const with object": new Set([
            "same object with different property order is valid"
        ])
    },
    "contains.json": {
        "contains keyword validation": new Set([
            "array without items matching schema is invalid",
            "empty array is invalid"
        ]),
        "contains keyword with const keyword": new Set([
            "array without item 5 is invalid"
        ]),
        "contains keyword with boolean schema true": new Set([
            "empty array is invalid"
        ]),
        "contains keyword with boolean schema false": new Set([
            "any non-empty array is invalid",
            "empty array is invalid"
        ]),
        "items + contains": new Set([
            "matches items, does not match contains"
        ]),
        "contains with false if subschema": new Set([
            "empty array is invalid"
        ])
    },
    "enum.json": {
        "heterogeneous enum validation": new Set(["something else is invalid"]),
        "empty enum": new Set(["null is invalid"])
    },
    "items.json": {
        "items and subitems": new Set(["fewer items is valid"]),
        "prefixItems with no additional items allowed": new Set([
            "empty array",
            "fewer number of items present (1)",
            "fewer number of items present (2)"
        ])
    },
    "maxContains.json": {
        "maxContains with contains": new Set([
            "empty data",
            "all elements match, invalid maxContains",
            "some elements match, invalid maxContains"
        ]),
        "maxContains with contains, value with a decimal": new Set([
            "too many elements match, invalid maxContains"
        ]),
        "minContains < maxContains": new Set([
            "actual < minContains < maxContains",
            "minContains < maxContains < actual"
        ]),
        "maxContains = 0 with minContains = 0": new Set([
            "one matching item"
        ])
    },
    "minContains.json": {
        "minContains=1 with contains": new Set(["empty data", "no elements match"]),
        "minContains=2 with contains": new Set([
            "empty data",
            "all elements match, invalid minContains",
            "some elements match, invalid minContains"
        ]),
        "minContains=2 with contains with a decimal value": new Set([
            "one element matches, invalid minContains"
        ]),
        "maxContains = minContains": new Set([
            "empty data",
            "all elements match, invalid minContains",
            "all elements match, invalid maxContains"
        ]),
        "maxContains < minContains": new Set([
            "empty data",
            "invalid minContains",
            "invalid maxContains",
            "invalid maxContains and minContains"
        ]),
        "minContains = 0 with maxContains": new Set(["too many"])
    },
    "maxItems.json": {
        "maxItems validation": new Set(["too long is invalid"]),
        "maxItems validation with a decimal": new Set(["too long is invalid"])
    },
    "maxProperties.json": {
        "maxProperties validation": new Set(["too long is invalid"]),
        "maxProperties validation with a decimal": new Set(["too long is invalid"]),
        "maxProperties = 0 means the object is empty": new Set(["one property is invalid"])
    },
    "minItems.json": {
        "minItems validation": new Set(["too short is invalid"]),
        "minItems validation with a decimal": new Set(["too short is invalid"])
    },
    "minProperties.json": {
        "minProperties validation": new Set(["too short is invalid"]),
        "minProperties validation with a decimal": new Set(["too short is invalid"])
    },
    "not.json": {
        "collect annotations inside a 'not', even if collection is disabled": new Set([
            "unevaluated property"
        ])
    },
    "prefixItems.json": {
        "a schema given for prefixItems": new Set([
            "incomplete array of items",
            "empty array"
        ]),
        "prefixItems with boolean schemas": new Set([
            "array with one item is valid",
            "empty array is valid"
        ])
    },
    "properties.json": {
        "properties, patternProperties, additionalProperties interaction": new Set([
            "patternProperty invalidates property",
            "patternProperty invalidates nonproperty"
        ])
    },
    "propertyNames.json": {
        "propertyNames validation": new Set(["some property names invalid"]),
        "propertyNames validation with pattern": new Set(["non-matching property name is invalid"]),
        "propertyNames with boolean schema false": new Set(["object with any properties is invalid"]),
        "propertyNames with const": new Set(["object with any other property is invalid"]),
        "propertyNames with enum": new Set(["object with any other property is invalid"])
    },
    "uniqueItems.json": {
        "uniqueItems validation": new Set([
            "non-unique array of integers is invalid",
            "non-unique array of more than two integers is invalid",
            "numbers are unique if mathematically unequal",
            "non-unique array of strings is invalid",
            "non-unique array of objects is invalid",
            "property order of array of objects is ignored",
            "non-unique array of nested objects is invalid",
            "non-unique array of arrays is invalid",
            "non-unique array of more than two arrays is invalid",
            "non-unique heterogeneous types are invalid",
            "objects are non-unique despite key order"
        ])
    }
};

const ALL_FILES = fs.readdirSync(SUITE_DIR).filter(file => file.endsWith('.json'));

for (const file of ALL_FILES) {
    const filePath = path.join(SUITE_DIR, file);

    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Skipping ${file} - file not found. Check submodule path.`);
        continue;
    }

    const testGroups = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const fileSkips = SKIP_TESTS[file];
    const skipWholeFile = fileSkips === null;

    describe(`JSON Schema: ${file}`, () => {

        for (const group of testGroups) {
            describe(group.description, () => {
                let compiledRoot;
                let compileError = null;
                
                // 1. We attempt to compile the schema ONCE per group
                try {
                    const ast = parseJsonSchema(group.schema);
                    const compiled = compile(cat, ast);
                    compiledRoot = compiled.root;
                } catch (err) {
                    compileError = err;
                }

                // 2. Loop through every payload test for this schema
                for (const testCase of group.tests) {
                    // Check if this specific test (or whole file/group) should be skipped
                    let isTodo = skipWholeFile;
                    if (!isTodo && fileSkips && fileSkips[group.description]) {
                        isTodo = fileSkips[group.description].has(testCase.description);
                    }

                    // BUG FIX: You assigned testFn but never actually called it below!
                    const testFn = isTodo ? test.todo : test;

                    testFn(testCase.description, () => {
                        // If parser/compiler failed and we didn't skip it, blow up to tell you what to fix
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