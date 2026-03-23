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
// It maps "Group Descriptions" to a Set of specific failing test descriptions.
const TODO_TESTS = {
    "items.json": {
        "items and subitems": new Set(["fewer items is valid"]),
        "prefixItems with no additional items allowed": new Set([
            "empty array",
            "fewer number of items present (1)",
            "fewer number of items present (2)"
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
    "maxItems.json": {
        "maxItems validation": new Set(["too long is invalid"]),
        "maxItems validation with a decimal": new Set(["too long is invalid"])
    },
    "minItems.json": {
        "minItems validation": new Set(["too short is invalid"]),
        "minItems validation with a decimal": new Set(["too short is invalid"])
    },
    "maxProperties.json": {
        "maxProperties validation": new Set(["too long is invalid"]),
        "maxProperties validation with a decimal": new Set(["too long is invalid"]),
        "maxProperties = 0 means the object is empty": new Set(["one property is invalid"])
    },
    "minProperties.json": {
        "minProperties validation": new Set(["too short is invalid"]),
        "minProperties validation with a decimal": new Set(["too short is invalid"])
    },
    "propertyNames.json": {
        "propertyNames validation": new Set(["some property names invalid"]),
        "propertyNames validation with pattern": new Set(["non-matching property name is invalid"]),
        "propertyNames with boolean schema false": new Set(["object with any properties is invalid"]),
        "propertyNames with const": new Set(["object with any other property is invalid"]),
        "propertyNames with enum": new Set(["object with any other property is invalid"])
    },
    "properties.json": {
        "properties, patternProperties, additionalProperties interaction": new Set([
            "patternProperty invalidates property",
            "patternProperty invalidates nonproperty"
        ])
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
    },

    // ── MEDIUM: The 'Contains' Group ──
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
        "minContains=1 with contains": new Set([
            "empty data",
            "no elements match"
        ]),
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
        "minContains = 0 with maxContains": new Set([
            "too many"
        ])
    },

    // ── HARD: Tier 3 Dynamic Tracking & External Linking ──
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
    "defs.json": {
        "validate definition against metaschema": new Set(["valid definition schema", "invalid definition schema"])
    },
    "vocabulary.json": {
        "schema that uses custom metaschema with with no validation vocabulary": new Set(["no validation: invalid number, but it still validates"])
    },
    "anchor.json": {
        "Location-independent identifier": new Set(["match", "mismatch"]),
        "Location-independent identifier with absolute URI": new Set(["match", "mismatch"]),
        "Location-independent identifier with base URI change in subschema": new Set(["match", "mismatch"]),
        "same $anchor with different base uri": new Set(["$ref resolves to /$defs/A/allOf/1", "$ref does not resolve to /$defs/A/allOf/0"])
    },
    "ref.json": {
        "root pointer ref": new Set(["match", "recursive match", "mismatch", "recursive mismatch"]),
        "relative pointer ref to object": new Set(["match", "mismatch"]),
        "relative pointer ref to array": new Set(["match array", "mismatch array"]),
        "escaped pointer ref": new Set(["slash invalid", "tilde invalid", "percent invalid", "slash valid", "tilde valid", "percent valid"]),
        "ref applies alongside sibling keywords": new Set(["ref valid, maxItems invalid"]),
        "remote ref, containing refs itself": new Set(["remote ref valid", "remote ref invalid"]),
        "Recursive references between schemas": new Set(["valid tree", "invalid tree"]),
        "refs with quote": new Set(["object with numbers is valid", "object with strings is invalid"]),
        "ref creates new scope when adjacent to keywords": new Set(["referenced subschema doesn't see annotations from properties"]),
        "refs with relative uris and defs": new Set(["invalid on inner field", "invalid on outer field", "valid on both fields"]),
        "relative refs with absolute uris and defs": new Set(["invalid on inner field", "invalid on outer field", "valid on both fields"]),
        "$id must be resolved against nearest parent, not just immediate parent": new Set(["number is valid", "non-number is invalid"]),
        "order of evaluation: $id and $ref": new Set(["data is valid against first definition", "data is invalid against first definition"]),
        "order of evaluation: $id and $anchor and $ref": new Set(["data is valid against first definition", "data is invalid against first definition"]),
        "order of evaluation: $id and $ref on nested schema": new Set(["data is valid against nested sibling", "data is invalid against nested sibling"]),
        "simple URN base URI with $ref via the URN": new Set(["valid under the URN IDed schema", "invalid under the URN IDed schema"]),
        "URN base URI with URN and JSON pointer ref": new Set(["a string is valid", "a non-string is invalid"]),
        "URN base URI with URN and anchor ref": new Set(["a string is valid", "a non-string is invalid"]),
        "URN ref with nested pointer ref": new Set(["a string is valid", "a non-string is invalid"]),
        "ref to if": new Set(["a non-integer is invalid due to the $ref", "an integer is valid"]),
        "ref to then": new Set(["a non-integer is invalid due to the $ref", "an integer is valid"]),
        "ref to else": new Set(["a non-integer is invalid due to the $ref", "an integer is valid"]),
        "ref with absolute-path-reference": new Set(["a string is valid", "an integer is invalid"]),
        "empty tokens in $ref json-pointer": new Set(["number is valid", "non-number is invalid"])
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
    "dynamicRef.json": {
        "A $dynamicRef to a $dynamicAnchor in the same schema resource behaves like a normal $ref to an $anchor": new Set(["An array containing non-strings is invalid"]),
        "A $dynamicRef to an $anchor in the same schema resource behaves like a normal $ref to an $anchor": new Set(["An array containing non-strings is invalid"]),
        "A $ref to a $dynamicAnchor in the same schema resource behaves like a normal $ref to an $anchor": new Set(["An array of strings is valid", "An array containing non-strings is invalid"]),
        "A $dynamicRef resolves to the first $dynamicAnchor still in scope that is encountered when the schema is evaluated": new Set(["An array of strings is valid", "An array containing non-strings is invalid"]),
        "A $dynamicRef without anchor in fragment behaves identical to $ref": new Set(["An array of strings is invalid", "An array of numbers is valid"]),
        "A $dynamicRef with intermediate scopes that don't include a matching $dynamicAnchor does not affect dynamic scope resolution": new Set(["An array of strings is valid", "An array containing non-strings is invalid"]),
        "An $anchor with the same name as a $dynamicAnchor is not used for dynamic scope resolution": new Set(["Any array is valid"]),
        "A $dynamicRef without a matching $dynamicAnchor in the same schema resource behaves like a normal $ref to $anchor": new Set(["Any array is valid"]),
        "A $dynamicRef with a non-matching $dynamicAnchor in the same schema resource behaves like a normal $ref to $anchor": new Set(["Any array is valid"]),
        "A $dynamicRef that initially resolves to a schema with a matching $dynamicAnchor resolves to the first $dynamicAnchor in the dynamic scope": new Set(["The recursive part is valid against the root", "The recursive part is not valid against the root"]),
        "A $dynamicRef that initially resolves to a schema without a matching $dynamicAnchor behaves like a normal $ref to $anchor": new Set(["The recursive part doesn't need to validate against the root"]),
        "multiple dynamic paths to the $dynamicRef keyword": new Set(["number list with number values", "number list with string values", "string list with number values", "string list with string values"]),
        "after leaving a dynamic scope, it is not used by a $dynamicRef": new Set(["string matches /$defs/thingy, but the $dynamicRef does not stop here", "first_scope is not in dynamic scope for the $dynamicRef", "/then/$defs/thingy is the final stop for the $dynamicRef"]),
        "strict-tree schema, guards against misspelled properties": new Set(["instance with misspelled field", "instance with correct field"]),
        "tests for implementation dynamic anchor and reference link": new Set(["incorrect parent schema", "incorrect extended schema", "correct extended schema"]),
        "$ref and $dynamicAnchor are independent of order - $defs first": new Set(["incorrect parent schema", "incorrect extended schema", "correct extended schema"]),
        "$ref and $dynamicAnchor are independent of order - $ref first": new Set(["incorrect parent schema", "incorrect extended schema", "correct extended schema"]),
        "$ref to $dynamicRef finds detached $dynamicAnchor": new Set(["number is valid", "non-number is invalid"]),
        "$dynamicRef points to a boolean schema": new Set(["follow $dynamicRef to a false schema"]),
        "$dynamicRef skips over intermediate resources - direct reference": new Set(["integer property passes", "string property fails"]),
        "$dynamicRef avoids the root of each schema, but scopes are still registered": new Set(["data is sufficient for schema at second#/$defs/length", "data is not sufficient for schema at second#/$defs/length"])
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
        "unevaluatedItems with $dynamicRef": new Set(["with no unevaluated items", "with unevaluated items"]),
        "unevaluatedItems can't see inside cousins": new Set(["always fails"]),
        "item is evaluated in an uncle schema to unevaluatedItems": new Set(["no extra items", "uncle keyword evaluation is not significant"]),
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
        "unevaluatedProperties with $dynamicRef": new Set(["with no unevaluated properties", "with unevaluated properties"]),
        "unevaluatedProperties can't see inside cousins": new Set(["always fails"]),
        "unevaluatedProperties can't see inside cousins (reverse order)": new Set(["always fails"]),
        "nested unevaluatedProperties, outer true, inner false, properties outside": new Set(["with no nested unevaluated properties", "with nested unevaluated properties"]),
        "nested unevaluatedProperties, outer true, inner false, properties inside": new Set(["with nested unevaluated properties"]),
        "cousin unevaluatedProperties, true and false, true with properties": new Set(["with no nested unevaluated properties", "with nested unevaluated properties"]),
        "cousin unevaluatedProperties, true and false, false with properties": new Set(["with nested unevaluated properties"]),
        "property is evaluated in an uncle schema to unevaluatedProperties": new Set(["uncle keyword evaluation is not significant"]),
        "in-place applicator siblings, allOf has unevaluated": new Set(["base case: both properties present", "in place applicator siblings, foo is missing"]),
        "in-place applicator siblings, anyOf has unevaluated": new Set(["base case: both properties present", "in place applicator siblings, bar is missing"]),
        "unevaluatedProperties + single cyclic ref": new Set(["Empty is valid", "Single is valid", "Unevaluated on 1st level is invalid", "Nested is valid", "Unevaluated on 2nd level is invalid", "Deep nested is valid", "Unevaluated on 3rd level is invalid"]),
        "dynamic evalation inside nested refs": new Set(["xx + foo is invalid"]),
        "unevaluatedProperties not affected by propertyNames": new Set(["string property is invalid"]),
        "unevaluatedProperties can see annotations from if without then and else": new Set(["invalid in case if is evaluated"]),
        "dependentSchemas with unevaluatedProperties": new Set(["unevaluatedProperties doesn't consider dependentSchemas", "unevaluatedProperties doesn't see bar when foo2 is absent"]),
        "Evaluated properties collection needs to consider instance location": new Set(["with an unevaluated property that exists at another location"])
    },
    "not.json": {
        "collect annotations inside a 'not', even if collection is disabled": new Set([
            "unevaluated property"
        ])
    },
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