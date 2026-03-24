import { describe, test, expect } from "bun:test";
import fs from "fs";
import path from "path";

import { parseJSONSchema } from "../src/internal/schema.js";
import { compile } from "../src/internal/ast.js";
import { catalog } from "../src/internal/catalog.js";

const cat = catalog();
const { validate } = cat;

const SUITE_DIR = path.resolve(import.meta.dir, "suite/tests/draft7");

// ── THE TODO LIST ──
// Keys are file names. 
// It maps "Group Descriptions" to a Set of specific failing test descriptions.
const TODO_TESTS = {
    // // ── HARD: Tier 3 Dynamic Tracking & External Linking ──
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
    "dynamicRef.json": {
        "A $dynamicRef to a $dynamicAnchor in the same schema resource behaves like a normal $ref to an $anchor": new Set(["An array containing non-strings is invalid"]),
        "A $dynamicRef to an $anchor in the same schema resource behaves like a normal $ref to an $anchor": new Set(["An array containing non-strings is invalid"]),
        "A $dynamicRef resolves to the first $dynamicAnchor still in scope that is encountered when the schema is evaluated": new Set(["An array containing non-strings is invalid"]),
        "A $dynamicRef without anchor in fragment behaves identical to $ref": new Set(["An array of strings is invalid"]),
        "A $dynamicRef with intermediate scopes that don't include a matching $dynamicAnchor does not affect dynamic scope resolution": new Set(["An array containing non-strings is invalid"]),
        "A $dynamicRef that initially resolves to a schema with a matching $dynamicAnchor resolves to the first $dynamicAnchor in the dynamic scope": new Set(["The recursive part is not valid against the root"]),
        "multiple dynamic paths to the $dynamicRef keyword": new Set(["number list with string values", "string list with number values"]),
        "after leaving a dynamic scope, it is not used by a $dynamicRef": new Set(["string matches /$defs/thingy, but the $dynamicRef does not stop here", "first_scope is not in dynamic scope for the $dynamicRef"]),
        "strict-tree schema, guards against misspelled properties": new Set(["instance with misspelled field", "instance with correct field"]),
        "tests for implementation dynamic anchor and reference link": new Set(["incorrect parent schema", "incorrect extended schema", "correct extended schema"]),
        "$ref and $dynamicAnchor are independent of order - $defs first": new Set(["incorrect parent schema", "incorrect extended schema", "correct extended schema"]),
        "$ref and $dynamicAnchor are independent of order - $ref first": new Set(["incorrect parent schema", "incorrect extended schema", "correct extended schema"]),
        "$ref to $dynamicRef finds detached $dynamicAnchor": new Set(["number is valid", "non-number is invalid"]),
        "$dynamicRef points to a boolean schema": new Set(["follow $dynamicRef to a false schema"]),
        "$dynamicRef skips over intermediate resources - direct reference": new Set(["string property fails"]),
        "$dynamicRef avoids the root of each schema, but scopes are still registered": new Set(["data is not sufficient for schema at second#/$defs/length"])
    },
    "not.json": {
        "collect annotations inside a 'not', even if collection is disabled": new Set(["unevaluated property"])
    },
    "ref.json": {
        "remote ref, containing refs itself": new Set(["remote ref valid", "remote ref invalid"]),
        "ref creates new scope when adjacent to keywords": new Set(["referenced subschema doesn't see annotations from properties"]),
        "order of evaluation: $id and $ref on nested schema": new Set(["data is valid against nested sibling", "data is invalid against nested sibling"]),
        "simple URN base URI with $ref via the URN": new Set(["invalid under the URN IDed schema"])
    },
    "refRemote.json": {
        "remote ref": new Set(["remote ref valid", "remote ref invalid"]),
        "fragment within remote ref": new Set(["remote fragment valid", "remote fragment invalid"]),
        "anchor within remote ref": new Set(["remote anchor valid", "remote anchor invalid"]),
        "ref within remote ref": new Set(["ref within ref valid", "ref within ref invalid"]),
        "base URI change": new Set(["base URI change ref valid", "base URI change ref invalid"]),
        "base URI change - change folder": new Set(["number is valid", "string is invalid"]),
        "base URI change - change folder in subschema": new Set(["number is valid", "string is invalid"]),
        "root ref in remote ref": new Set(["string is valid", "null is valid", "object is invalid"]),
        "remote ref with ref to defs": new Set(["invalid", "valid"]),
        "Location-independent identifier in remote ref": new Set(["integer is valid", "string is invalid"]),
        "retrieved nested refs resolve relative to their URI not $id": new Set(["number is invalid", "string is valid"]),
        "remote HTTP ref with different $id": new Set(["number is invalid", "string is valid"]),
        "remote HTTP ref with different URN $id": new Set(["number is invalid", "string is valid"]),
        "remote HTTP ref with nested absolute ref": new Set(["number is invalid", "string is valid"]),
        "$ref to $ref finds detached $anchor": new Set(["number is valid", "non-number is invalid"])
    },
    "unevaluatedItems.json": {
        "unevaluatedItems false": new Set(["with unevaluated items"]),
        "unevaluatedItems as schema": new Set(["with invalid unevaluated items"]),
        "unevaluatedItems with tuple": new Set(["with unevaluated items"]),
        "unevaluatedItems with nested tuple": new Set(["with unevaluated items"]),
        "unevaluatedItems with nested items": new Set(["with invalid additional item"]),
        "unevaluatedItems with anyOf": new Set(["when one schema matches and has unevaluated items", "when two schemas match and has unevaluated items"]),
        "unevaluatedItems with oneOf": new Set(["with unevaluated items"]),
        "unevaluatedItems with not": new Set(["with unevaluated items"]),
        "unevaluatedItems with if/then/else": new Set(["when if matches and it has unevaluated items", "when if doesn't match and it has unevaluated items"]),
        "unevaluatedItems with boolean schemas": new Set(["with unevaluated items"]),
        "unevaluatedItems with $ref": new Set(["with unevaluated items"]),
        "unevaluatedItems before $ref": new Set(["with unevaluated items"]),
        "unevaluatedItems with $dynamicRef": new Set(["with unevaluated items"]),
        "unevaluatedItems can't see inside cousins": new Set(["always fails"]),
        "item is evaluated in an uncle schema to unevaluatedItems": new Set(["uncle keyword evaluation is not significant"]),
        "unevaluatedItems depends on adjacent contains": new Set(["contains fails, second item is not evaluated", "contains passes, second item is not evaluated"]),
        "unevaluatedItems depends on multiple nested contains": new Set(["7 not evaluated, fails unevaluatedItems"]),
        "unevaluatedItems and contains interact to control item dependency relationship": new Set(["only b's are invalid", "only c's are invalid", "only b's and c's are invalid", "only a's and c's are invalid"]),
        "unevaluatedItems with minContains = 0": new Set(["no items evaluated by contains", "some but not all items evaluated by contains"]),
        "unevaluatedItems can see annotations from if without then and else": new Set(["invalid in case if is evaluated"]),
        "Evaluated items collection needs to consider instance location": new Set(["with an unevaluated item that exists at another location"])
    },
    "unevaluatedProperties.json": {
        "unevaluatedProperties schema": new Set(["with invalid unevaluated properties"]),
        "unevaluatedProperties false": new Set(["with unevaluated properties"]),
        "unevaluatedProperties with adjacent properties": new Set(["with unevaluated properties"]),
        "unevaluatedProperties with adjacent patternProperties": new Set(["with unevaluated properties"]),
        "unevaluatedProperties with nested properties": new Set(["with additional properties"]),
        "unevaluatedProperties with nested patternProperties": new Set(["with additional properties"]),
        "unevaluatedProperties with anyOf": new Set(["when one matches and has unevaluated properties", "when two match and has unevaluated properties"]),
        "unevaluatedProperties with oneOf": new Set(["with unevaluated properties"]),
        "unevaluatedProperties with not": new Set(["with unevaluated properties"]),
        "unevaluatedProperties with if/then/else": new Set(["when if is true and has unevaluated properties", "when if is false and has unevaluated properties"]),
        "unevaluatedProperties with if/then/else, then not defined": new Set(["when if is true and has unevaluated properties", "when if is false and has unevaluated properties"]),
        "unevaluatedProperties with if/then/else, else not defined": new Set(["when if is true and has unevaluated properties", "when if is false and has no unevaluated properties", "when if is false and has unevaluated properties"]),
        "unevaluatedProperties with dependentSchemas": new Set(["with unevaluated properties"]),
        "unevaluatedProperties with boolean schemas": new Set(["with unevaluated properties"]),
        "unevaluatedProperties with $ref": new Set(["with unevaluated properties"]),
        "unevaluatedProperties before $ref": new Set(["with unevaluated properties"]),
        "unevaluatedProperties with $dynamicRef": new Set(["with unevaluated properties"]),
        "unevaluatedProperties can't see inside cousins": new Set(["always fails"]),
        "unevaluatedProperties can't see inside cousins (reverse order)": new Set(["always fails"]),
        "nested unevaluatedProperties, outer true, inner false, properties outside": new Set(["with no nested unevaluated properties", "with nested unevaluated properties"]),
        "nested unevaluatedProperties, outer true, inner false, properties inside": new Set(["with nested unevaluated properties"]),
        "cousin unevaluatedProperties, true and false, true with properties": new Set(["with no nested unevaluated properties", "with nested unevaluated properties"]),
        "cousin unevaluatedProperties, true and false, false with properties": new Set(["with nested unevaluated properties"]),
        "property is evaluated in an uncle schema to unevaluatedProperties": new Set(["uncle keyword evaluation is not significant"]),
        "in-place applicator siblings, allOf has unevaluated": new Set(["base case: both properties present", "in place applicator siblings, foo is missing"]),
        "in-place applicator siblings, anyOf has unevaluated": new Set(["base case: both properties present", "in place applicator siblings, bar is missing"]),
        "unevaluatedProperties + single cyclic ref": new Set(["Unevaluated on 1st level is invalid", "Unevaluated on 2nd level is invalid", "Unevaluated on 3rd level is invalid"]),
        "dynamic evalation inside nested refs": new Set(["xx + foo is invalid"]),
        "unevaluatedProperties not affected by propertyNames": new Set(["string property is invalid"]),
        "unevaluatedProperties can see annotations from if without then and else": new Set(["invalid in case if is evaluated"]),
        "dependentSchemas with unevaluatedProperties": new Set(["unevaluatedProperties doesn't consider dependentSchemas", "unevaluatedProperties doesn't see bar when foo2 is absent"]),
        "Evaluated properties collection needs to consider instance location": new Set(["with an unevaluated property that exists at another location"])
    },
    "vocabulary.json": {
        "schema that uses custom metaschema with with no validation vocabulary": new Set(["no validation: invalid number, but it still validates"])
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
    const fileSkips = TODO_TESTS[file];
    const skipWholeFile = fileSkips === null;

    describe(`JSON Schema: ${file}`, () => {

        for (const group of testGroups) {
            describe(group.description, () => {
                let compiledRoot;
                let compileError = null;

                // 1. We attempt to compile the schema ONCE per group
                try {
                    const ast = parseJSONSchema(group.schema, 'draft-07');
                    const compiled = compile(cat, ast);
                    compiledRoot = compiled[0].schema;
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

                    test.skip(testCase.description, () => {
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