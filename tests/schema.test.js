import { describe, test, expect } from "bun:test";
import fs from "fs";
import path from "path";

import { CompoundSchema } from "../src/internal/schema.js";
import { compile } from "../src/internal/ast.js";
import { catalog } from "../src/internal/catalog.js";

const cat = catalog();
const { validate } = cat;

const __dirname = import.meta.dir;

const SUPPORTED_DRAFTS = ["draft2020-12"];

const SUITE_DIR = path.resolve(__dirname, "suite/tests");
const REMOTE_DIR = path.resolve(__dirname, "suite/remotes");

// ── THE TODO LIST ──
// Keys are file names. 
// It maps "Group Descriptions" to a Set of specific failing test descriptions.
const TODO_TESTS = {
    // ── HARD: Tier 3 Dynamic Tracking & External Linking ──
    "defs.json": {
        "validate definition against metaschema": new Set(["valid definition schema", "invalid definition schema"])
    },
    "dependentRequired.json": {
        "single dependency": new Set(["missing dependency"]),
        "multiple dependents required": new Set(["missing dependency", "missing other dependency", "missing both dependencies"]),
        "dependencies with escaped characters": new Set(["CRLF missing dependent", "quoted quotes missing dependent"])
    },
    "dependentSchemas.json": {
        "single dependency": new Set(["wrong type", "wrong type other", "wrong type both"]),
        "boolean subschemas": new Set(["object with property having schema false is invalid", "object with both properties is invalid"]),
        "dependencies with escaped characters": new Set(["quoted quote", "quoted tab invalid under dependent schema", "quoted quote invalid under dependent schema"]),
        "dependent subschema incompatible with root": new Set(["matches root", "matches both"])
    },
    // "unevaluatedItems.json": {
    //     "unevaluatedItems false": new Set(["with unevaluated items"]),
    //     "unevaluatedItems as schema": new Set(["with invalid unevaluated items"]),
    //     "unevaluatedItems with tuple": new Set(["with unevaluated items"]),
    //     "unevaluatedItems with nested tuple": new Set(["with unevaluated items"]),
    //     "unevaluatedItems with nested items": new Set(["with invalid additional item"]),
    //     "unevaluatedItems with anyOf": new Set(["when one schema matches and has unevaluated items", "when two schemas match and has unevaluated items"]),
    //     "unevaluatedItems with oneOf": new Set(["with unevaluated items"]),
    //     "unevaluatedItems with not": new Set(["with unevaluated items"]),
    //     "unevaluatedItems with if/then/else": new Set(["when if matches and it has unevaluated items", "when if doesn't match and it has unevaluated items"]),
    //     "unevaluatedItems with boolean schemas": new Set(["with unevaluated items"]),
    //     "unevaluatedItems with $ref": new Set(["with unevaluated items"]),
    //     "unevaluatedItems before $ref": new Set(["with unevaluated items"]),
    //     "unevaluatedItems with $dynamicRef": new Set(["with unevaluated items"]),
    //     "unevaluatedItems can't see inside cousins": new Set(["always fails"]),
    //     "item is evaluated in an uncle schema to unevaluatedItems": new Set(["uncle keyword evaluation is not significant"]),
    //     "unevaluatedItems depends on adjacent contains": new Set(["contains fails, second item is not evaluated", "contains passes, second item is not evaluated"]),
    //     "unevaluatedItems depends on multiple nested contains": new Set(["7 not evaluated, fails unevaluatedItems"]),
    //     "unevaluatedItems and contains interact to control item dependency relationship": new Set(["only b's are invalid", "only c's are invalid", "only b's and c's are invalid", "only a's and c's are invalid"]),
    //     "unevaluatedItems with minContains = 0": new Set(["no items evaluated by contains", "some but not all items evaluated by contains"]),
    //     "unevaluatedItems can see annotations from if without then and else": new Set(["invalid in case if is evaluated"]),
    //     "Evaluated items collection needs to consider instance location": new Set(["with an unevaluated item that exists at another location"])
    // },
    // "unevaluatedProperties.json": {
    //     "unevaluatedProperties schema": new Set(["with invalid unevaluated properties"]),
    //     "unevaluatedProperties false": new Set(["with unevaluated properties"]),
    //     "unevaluatedProperties with adjacent properties": new Set(["with unevaluated properties"]),
    //     "unevaluatedProperties with adjacent patternProperties": new Set(["with unevaluated properties"]),
    //     "unevaluatedProperties with nested properties": new Set(["with additional properties"]),
    //     "unevaluatedProperties with nested patternProperties": new Set(["with additional properties"]),
    //     "unevaluatedProperties with anyOf": new Set(["when one matches and has unevaluated properties", "when two match and has unevaluated properties"]),
    //     "unevaluatedProperties with oneOf": new Set(["with unevaluated properties"]),
    //     "unevaluatedProperties with not": new Set(["with unevaluated properties"]),
    //     "unevaluatedProperties with if/then/else": new Set(["when if is true and has unevaluated properties", "when if is false and has unevaluated properties"]),
    //     "unevaluatedProperties with if/then/else, then not defined": new Set(["when if is true and has unevaluated properties", "when if is false and has unevaluated properties"]),
    //     "unevaluatedProperties with if/then/else, else not defined": new Set(["when if is true and has unevaluated properties", "when if is false and has no unevaluated properties", "when if is false and has unevaluated properties"]),
    //     "unevaluatedProperties with dependentSchemas": new Set(["with unevaluated properties"]),
    //     "unevaluatedProperties with boolean schemas": new Set(["with unevaluated properties"]),
    //     "unevaluatedProperties with $ref": new Set(["with unevaluated properties"]),
    //     "unevaluatedProperties before $ref": new Set(["with unevaluated properties"]),
    //     "unevaluatedProperties with $dynamicRef": new Set(["with unevaluated properties"]),
    //     "unevaluatedProperties can't see inside cousins": new Set(["always fails"]),
    //     "unevaluatedProperties can't see inside cousins (reverse order)": new Set(["always fails"]),
    //     "nested unevaluatedProperties, outer true, inner false, properties outside": new Set(["with no nested unevaluated properties", "with nested unevaluated properties"]),
    //     "nested unevaluatedProperties, outer true, inner false, properties inside": new Set(["with nested unevaluated properties"]),
    //     "cousin unevaluatedProperties, true and false, true with properties": new Set(["with no nested unevaluated properties", "with nested unevaluated properties"]),
    //     "cousin unevaluatedProperties, true and false, false with properties": new Set(["with nested unevaluated properties"]),
    //     "property is evaluated in an uncle schema to unevaluatedProperties": new Set(["uncle keyword evaluation is not significant"]),
    //     "in-place applicator siblings, allOf has unevaluated": new Set(["base case: both properties present", "in place applicator siblings, foo is missing"]),
    //     "in-place applicator siblings, anyOf has unevaluated": new Set(["base case: both properties present", "in place applicator siblings, bar is missing"]),
    //     "unevaluatedProperties + single cyclic ref": new Set(["Unevaluated on 1st level is invalid", "Unevaluated on 2nd level is invalid", "Unevaluated on 3rd level is invalid"]),
    //     "dynamic evalation inside nested refs": new Set(["xx + foo is invalid"]),
    //     "unevaluatedProperties not affected by propertyNames": new Set(["string property is invalid"]),
    //     "unevaluatedProperties can see annotations from if without then and else": new Set(["invalid in case if is evaluated"]),
    //     "dependentSchemas with unevaluatedProperties": new Set(["unevaluatedProperties doesn't consider dependentSchemas", "unevaluatedProperties doesn't see bar when foo2 is absent"]),
    //     "Evaluated properties collection needs to consider instance location": new Set(["with an unevaluated property that exists at another location"])
    // },
    "not.json": {
        "collect annotations inside a 'not', even if collection is disabled": new Set(["unevaluated property"])
    },
    "vocabulary.json": {
        "schema that uses custom metaschema with with no validation vocabulary": new Set(["no validation: invalid number, but it still validates"])
    }
};

/**
 * Recursively reads all JSON files in a directory.
 * @param {string} rootDir 
 * @returns {Array<{path: string, schema: any}>}
 */
function readDirRecursive(rootDir) {
    let files = [];
    function readDir(dirName) {
        const content = fs.readdirSync(dirName);
        for (const file of content) {
            const abspath = path.join(dirName, file);
            const stats = fs.statSync(abspath);
            if (stats.isDirectory()) {
                readDir(abspath);
            } else if (file.endsWith('.json')) {
                const contentStr = fs.readFileSync(abspath, "utf8");
                // Get path relative to the root 'remotes' folder
                const relativePath = path.relative(rootDir, abspath);
                files.push({ path: relativePath, schema: JSON.parse(contentStr) });
            }
        }
    }
    readDir(rootDir); // Kick off the recursion
    return files;
}

const REMOTE_FILES = readDirRecursive(REMOTE_DIR);

for (const draft of SUPPORTED_DRAFTS) {
    const suiteDir = path.join(SUITE_DIR, draft);
    
    if (!fs.existsSync(suiteDir)) {
        console.warn(`⚠️ Skipping ${draft} - test folder not found.`);
        continue;
    }

    const allFiles = fs.readdirSync(suiteDir).filter(f => f.endsWith('.json'));

    describe(`JSON Schema: ${draft}`, () => {
        for (const file of allFiles) {
            const filePath = path.join(suiteDir, file);
            const testGroups = JSON.parse(fs.readFileSync(filePath, "utf8"));
            
            const fileSkips = TODO_TESTS[file];
            const skipWholeFile = fileSkips === null;

            describe(`File: ${file}`, () => {
                for (const group of testGroups) {
                    describe(group.description, () => {
                        let compiledRoot;
                        let compileError = null;

                        // 1. Compile the schema ONCE per group
                        try {
                            const compound = new CompoundSchema(draft);
                            
                            // Inject all remotes into this specific compound instance
                            for (const remoteFile of REMOTE_FILES) {
                                const uriPath = remoteFile.path.split(path.sep).join('/');
                                const uri = `http://localhost:1234/${uriPath}`;
                                compound.add(remoteFile.schema, uri);
                            }
                            
                            const ref = compound.add(group.schema);
                            const ast = compound.bundle(ref);
                            const compiled = compile(cat, ast);
                            compiledRoot = compiled[0].schema;
                        } catch (err) {
                            compileError = err;
                        }

                        // 2. Loop through every payload test
                        for (const testCase of group.tests) {
                            let isTodo = skipWholeFile;
                            if (!isTodo && fileSkips && fileSkips[group.description]) {
                                isTodo = fileSkips[group.description].has(testCase.description);
                            }

                            const testFn = isTodo ? test.todo : test;

                            testFn(testCase.description, () => {
                                if (compileError) {
                                    throw new Error(
                                        `Parser/Compiler failed: ${compileError.message}\n` +
                                        `Schema: ${JSON.stringify(group.schema)}`
                                    );
                                }

                                // 3. The Max Squeeze Validation
                                const isValid = validate(testCase.data, compiledRoot);
                                expect(isValid).toBe(testCase.valid);
                            });
                        }
                    });
                }
            });
        }
    });
}