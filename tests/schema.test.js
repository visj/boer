import { describe, test, expect } from 'bun:test';
import { catalog, compile, CompoundSchema } from 'uvd/core';

const cat = catalog();
const { validate } = cat;

describe('schema.test.js', () => {
    describe('dynamic anchor and ref', () => {
        test('anchors pop dyn anchor stack correctly', () => {
            const schema = {
                "if": {
                    "$id": "first_scope",
                    "$defs": {
                        "thingy": { "$dynamicAnchor": "thingy", "type": "number" }
                    }
                },
                "then": {
                    "$id": "second_scope",
                    "$ref": "start",
                    "$defs": {
                        "thingy": { "$dynamicAnchor": "thingy", "type": "null" }
                    }
                },
                "$defs": {
                    "start": { "$id": "start", "$dynamicRef": "inner_scope#thingy" },
                    "thingy": { "$id": "inner_scope", "$dynamicAnchor": "thingy", "type": "string" }
                }
            };
            const compound = new CompoundSchema();
            const ref = compound.add(schema);
            const ast = compound.bundle(ref);
            const resources = compile(cat, ast);
            const IfElse = resources[0].schema;
            expect(validate("a string", IfElse)).toBe(false);
            expect(validate(42, IfElse)).toBe(false);
            expect(validate(null, IfElse)).toBe(true);
        });

    });
});