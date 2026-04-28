import { describe, test, expect } from "bun:test";
import fs from "fs";
import path from "path";

import { CompoundSchema } from '@luvd/schema';
import { compile } from '@luvd/compiler';
import { catalog } from '@luvd/validate';

const __dirname = import.meta.dir;
const SPECS_DIR = path.resolve(__dirname, "specs");

/**
 * Loads meta-schema files for a given draft.
 * @param {string} draft
 */
function loadDraftMeta(draft) {
    const specDir = path.join(SPECS_DIR, draft);
    const rootSchemaPath = path.join(specDir, "schema.json");
    const rootMetaSchema = JSON.parse(fs.readFileSync(rootSchemaPath, "utf8"));
    const rootMetaUri = rootMetaSchema.$id || rootMetaSchema.id || `https://json-schema.org/${draft}/schema`;

    const vocabSchemas = [];
    if (Array.isArray(rootMetaSchema.allOf)) {
        for (const branch of rootMetaSchema.allOf) {
            if (branch.$ref && branch.$ref.startsWith("meta/")) {
                const vocabFileName = branch.$ref.replace("meta/", "") + ".json";
                const vocabPath = path.join(specDir, "meta", vocabFileName);
                if (fs.existsSync(vocabPath)) {
                    const vocabSchema = JSON.parse(fs.readFileSync(vocabPath, "utf8"));
                    const vocabUri = vocabSchema.$id || vocabSchema.id;
                    if (vocabUri) {
                        vocabSchemas.push({ schema: vocabSchema, uri: vocabUri });
                    }
                }
            }
        }
    }
    return { rootMetaSchema, rootMetaUri, vocabSchemas };
}

/**
 * Compiles a schema under a specific draft and validates data against it.
 * @param {object} schema
 * @param {any} data
 * @param {string} draft
 * @returns {boolean}
 */
function compileAndValidate(schema, data, draft) {
    const cat = catalog();
    const { rootMetaSchema, rootMetaUri, vocabSchemas } = loadDraftMeta(draft);
    const compound = new CompoundSchema(draft);
    compound.add(structuredClone(rootMetaSchema), rootMetaUri);
    for (const vocab of vocabSchemas) {
        compound.add(structuredClone(vocab.schema), vocab.uri);
    }
    const ref = compound.add(schema);
    const ast = compound.bundle(ref);
    const compiled = compile(cat, ast);
    return cat.validate(data, compiled[0].schema);
}

/* =========================================================================
 * TRANSPILE TESTS
 *
 * Tests that verify correct transpilation of older JSON Schema drafts
 * to the baseline (draft 2020-12) format used internally by the runtime.
 * ========================================================================= */

describe("Transpile: additionalItems → items (pre-2020 tuple desugaring)", () => {

    describe("draft-07: items array with additionalItems: false", () => {
        const schema = {
            type: "array",
            items: [{ type: "string" }, { type: "number" }],
            additionalItems: false
        };
        test("tuple items valid", () => {
            expect(compileAndValidate(schema, ["hello", 42], "draft-07")).toBe(true);
        });
        test("extra items rejected by additionalItems: false", () => {
            expect(compileAndValidate(schema, ["hello", 42, true], "draft-07")).toBe(false);
        });
        test("fewer items than tuple is valid", () => {
            expect(compileAndValidate(schema, ["hello"], "draft-07")).toBe(true);
        });
    });

    describe("draft-07: items array with additionalItems: schema", () => {
        const schema = {
            type: "array",
            items: [{ type: "string" }],
            additionalItems: { type: "number" }
        };
        test("additional items matching schema are valid", () => {
            expect(compileAndValidate(schema, ["hello", 1, 2, 3], "draft-07")).toBe(true);
        });
        test("additional items not matching schema are invalid", () => {
            expect(compileAndValidate(schema, ["hello", "world"], "draft-07")).toBe(false);
        });
    });

    describe("draft-07: items array without additionalItems (defaults to allow)", () => {
        const schema = {
            type: "array",
            items: [{ type: "string" }]
        };
        test("additional items allowed when additionalItems absent", () => {
            expect(compileAndValidate(schema, ["hello", 42, true, null], "draft-07")).toBe(true);
        });
        test("tuple item validated", () => {
            expect(compileAndValidate(schema, [42], "draft-07")).toBe(false);
        });
    });

    describe("draft-04: same tuple semantics as draft-07", () => {
        const schema = {
            items: [{ type: "integer" }],
            additionalItems: false
        };
        test("single tuple item valid", () => {
            expect(compileAndValidate(schema, [1], "draft-04")).toBe(true);
        });
        test("extra items rejected", () => {
            expect(compileAndValidate(schema, [1, 2], "draft-04")).toBe(false);
        });
    });

    describe("draft-07: items as schema (not array) — additionalItems irrelevant", () => {
        const schema = {
            type: "array",
            items: { type: "string" }
        };
        test("all items validated against single schema", () => {
            expect(compileAndValidate(schema, ["a", "b", "c"], "draft-07")).toBe(true);
        });
        test("non-matching item rejected", () => {
            expect(compileAndValidate(schema, ["a", 1], "draft-07")).toBe(false);
        });
    });
});

describe("Transpile: draft-04 id → $id", () => {

    describe("standard URI id", () => {
        const schema = {
            id: "http://example.com/schema",
            type: "object",
            properties: {
                name: { type: "string" }
            }
        };
        test("schema with URI id compiles and validates", () => {
            expect(compileAndValidate(schema, { name: "test" }, "draft-04")).toBe(true);
        });
        test("invalid data rejected", () => {
            expect(compileAndValidate(schema, { name: 123 }, "draft-04")).toBe(false);
        });
    });

    describe("plain string id (relative URI)", () => {
        const schema = {
            id: "my-schema",
            type: "string",
            minLength: 1
        };
        test("schema with relative URI id compiles correctly", () => {
            expect(compileAndValidate(schema, "hello", "draft-04")).toBe(true);
        });
        test("validation still works", () => {
            expect(compileAndValidate(schema, "", "draft-04")).toBe(false);
        });
    });

    describe("fragment-only id (#anchor)", () => {
        const schema = {
            type: "object",
            definitions: {
                name: {
                    id: "#name",
                    type: "string"
                }
            },
            properties: {
                name: { $ref: "#name" }
            }
        };
        test("fragment id used as anchor", () => {
            expect(compileAndValidate(schema, { name: "hello" }, "draft-04")).toBe(true);
        });
        test("invalid ref target rejects", () => {
            expect(compileAndValidate(schema, { name: 42 }, "draft-04")).toBe(false);
        });
    });

    describe("relative path id", () => {
        const schema = {
            id: "/schemas/person",
            type: "object",
            properties: {
                age: { type: "integer" }
            }
        };
        test("relative path id compiles", () => {
            expect(compileAndValidate(schema, { age: 25 }, "draft-04")).toBe(true);
        });
    });
});

describe("Transpile: draft-04 boolean exclusiveMinimum/Maximum", () => {

    describe("exclusiveMinimum: true", () => {
        const schema = {
            type: "number",
            minimum: 5,
            exclusiveMinimum: true
        };
        test("value above minimum is valid", () => {
            expect(compileAndValidate(schema, 6, "draft-04")).toBe(true);
        });
        test("value equal to minimum is invalid (exclusive)", () => {
            expect(compileAndValidate(schema, 5, "draft-04")).toBe(false);
        });
        test("value below minimum is invalid", () => {
            expect(compileAndValidate(schema, 4, "draft-04")).toBe(false);
        });
    });

    describe("exclusiveMinimum: false (same as non-exclusive)", () => {
        const schema = {
            type: "number",
            minimum: 5,
            exclusiveMinimum: false
        };
        test("value equal to minimum is valid (non-exclusive)", () => {
            expect(compileAndValidate(schema, 5, "draft-04")).toBe(true);
        });
        test("value below minimum is invalid", () => {
            expect(compileAndValidate(schema, 4, "draft-04")).toBe(false);
        });
    });

    describe("exclusiveMaximum: true", () => {
        const schema = {
            type: "number",
            maximum: 10,
            exclusiveMaximum: true
        };
        test("value below maximum is valid", () => {
            expect(compileAndValidate(schema, 9, "draft-04")).toBe(true);
        });
        test("value equal to maximum is invalid (exclusive)", () => {
            expect(compileAndValidate(schema, 10, "draft-04")).toBe(false);
        });
    });

    describe("exclusiveMaximum: false (same as non-exclusive)", () => {
        const schema = {
            type: "number",
            maximum: 10,
            exclusiveMaximum: false
        };
        test("value equal to maximum is valid (non-exclusive)", () => {
            expect(compileAndValidate(schema, 10, "draft-04")).toBe(true);
        });
    });

    describe("draft-06+ exclusiveMinimum is numeric (no transpile needed)", () => {
        const schema = {
            type: "number",
            exclusiveMinimum: 5
        };
        test("value above exclusive minimum is valid", () => {
            expect(compileAndValidate(schema, 6, "draft-06")).toBe(true);
        });
        test("value equal to exclusive minimum is invalid", () => {
            expect(compileAndValidate(schema, 5, "draft-06")).toBe(false);
        });
    });
});

describe("Transpile: dependencies → dependentRequired / dependentSchemas", () => {

    describe("draft-07: array dependencies → dependentRequired", () => {
        const schema = {
            type: "object",
            dependencies: {
                foo: ["bar", "baz"]
            }
        };
        test("foo present requires bar and baz", () => {
            expect(compileAndValidate(schema, { foo: 1, bar: 2, baz: 3 }, "draft-07")).toBe(true);
        });
        test("foo present without bar is invalid", () => {
            expect(compileAndValidate(schema, { foo: 1 }, "draft-07")).toBe(false);
        });
        test("foo absent - no requirements", () => {
            expect(compileAndValidate(schema, { bar: 2 }, "draft-07")).toBe(true);
        });
    });

    describe("draft-07: schema dependencies → dependentSchemas", () => {
        const schema = {
            type: "object",
            dependencies: {
                foo: {
                    properties: {
                        bar: { type: "string" }
                    },
                    required: ["bar"]
                }
            }
        };
        test("foo present triggers schema dependency", () => {
            expect(compileAndValidate(schema, { foo: 1, bar: "hello" }, "draft-07")).toBe(true);
        });
        test("foo present but bar missing is invalid", () => {
            expect(compileAndValidate(schema, { foo: 1 }, "draft-07")).toBe(false);
        });
        test("foo absent - schema not applied", () => {
            expect(compileAndValidate(schema, { baz: 1 }, "draft-07")).toBe(true);
        });
    });

    describe("draft-04: mixed dependencies", () => {
        const schema = {
            type: "object",
            dependencies: {
                a: ["b"],
                c: { required: ["d"] }
            }
        };
        test("a requires b (array dep)", () => {
            expect(compileAndValidate(schema, { a: 1, b: 2 }, "draft-04")).toBe(true);
        });
        test("a without b is invalid", () => {
            expect(compileAndValidate(schema, { a: 1 }, "draft-04")).toBe(false);
        });
        test("c requires d (schema dep)", () => {
            expect(compileAndValidate(schema, { c: 1, d: 2 }, "draft-04")).toBe(true);
        });
        test("c without d is invalid", () => {
            expect(compileAndValidate(schema, { c: 1 }, "draft-04")).toBe(false);
        });
    });
});

describe("Transpile: definitions → $defs", () => {

    describe("draft-07: $ref to definitions is rewritten to $defs", () => {
        const schema = {
            type: "object",
            definitions: {
                name: { type: "string", minLength: 1 }
            },
            properties: {
                name: { $ref: "#/definitions/name" }
            }
        };
        test("$ref resolves through rewritten $defs", () => {
            expect(compileAndValidate(schema, { name: "hello" }, "draft-07")).toBe(true);
        });
        test("invalid data rejected via $ref", () => {
            expect(compileAndValidate(schema, { name: "" }, "draft-07")).toBe(false);
        });
    });

    describe("draft-04: definitions + $ref rewriting", () => {
        const schema = {
            definitions: {
                positiveInt: {
                    type: "integer",
                    minimum: 1
                }
            },
            properties: {
                count: { $ref: "#/definitions/positiveInt" }
            }
        };
        test("$ref resolves to definition", () => {
            expect(compileAndValidate(schema, { count: 5 }, "draft-04")).toBe(true);
        });
        test("invalid value rejected", () => {
            expect(compileAndValidate(schema, { count: 0 }, "draft-04")).toBe(false);
        });
    });
});

describe("Transpile: $ref sibling stripping (draft-07 and older)", () => {

    describe("draft-07: $ref strips all sibling keywords", () => {
        const schema = {
            type: "object",
            properties: {
                value: {
                    $ref: "#/definitions/base",
                    minLength: 100
                }
            },
            definitions: {
                base: { type: "string" }
            }
        };
        test("minLength sibling is stripped — short string passes", () => {
            expect(compileAndValidate(schema, { value: "hi" }, "draft-07")).toBe(true);
        });
    });

    describe("draft2019-09: $ref does NOT strip siblings", () => {
        const schema = {
            $defs: {
                base: { type: "string" }
            },
            type: "object",
            properties: {
                value: {
                    $ref: "#/$defs/base",
                    minLength: 5
                }
            }
        };
        test("minLength sibling is preserved — short string fails", () => {
            expect(compileAndValidate(schema, { value: "hi" }, "draft2019-09")).toBe(false);
        });
        test("string meeting both constraints passes", () => {
            expect(compileAndValidate(schema, { value: "hello" }, "draft2019-09")).toBe(true);
        });
    });
});

describe("Transpile: draft 2019-09 $recursiveAnchor/$recursiveRef", () => {

    describe("$recursiveAnchor + $recursiveRef → $dynamicAnchor + $dynamicRef", () => {
        /**
         * This models the classic recursive-schema pattern from 2019-09:
         * a base schema defines a recursive structure, and an extending
         * schema overrides the recursion target via $recursiveAnchor.
         */
        const baseSchema = {
            $schema: "https://json-schema.org/draft/2019-09/schema",
            $id: "http://example.com/base",
            $recursiveAnchor: true,
            type: "object",
            properties: {
                name: { type: "string" },
                children: {
                    type: "array",
                    items: { $recursiveRef: "#" }
                }
            },
            required: ["name"]
        };

        test("basic recursive schema validates", () => {
            const cat = catalog();
            const { rootMetaSchema, rootMetaUri, vocabSchemas } = loadDraftMeta("draft2019-09");
            const compound = new CompoundSchema("draft2019-09");
            compound.add(structuredClone(rootMetaSchema), rootMetaUri);
            for (const vocab of vocabSchemas) {
                compound.add(structuredClone(vocab.schema), vocab.uri);
            }
            const ref = compound.add(structuredClone(baseSchema));
            const ast = compound.bundle(ref);
            const compiled = compile(cat, ast);
            const compiledRoot = compiled[0].schema;

            expect(cat.validate({ name: "root", children: [{ name: "child" }] }, compiledRoot)).toBe(true);
            expect(cat.validate({ name: "root", children: [{}] }, compiledRoot)).toBe(false);
        });
    });
});

describe("Transpile: $ref path rewriting /items/N → /prefixItems/N", () => {

    describe("draft-07: $ref to tuple item rewritten", () => {
        const schema = {
            type: "object",
            definitions: {
                myTuple: {
                    type: "array",
                    items: [{ type: "string" }, { type: "number" }]
                }
            },
            properties: {
                first: { $ref: "#/definitions/myTuple/items/0" },
                second: { $ref: "#/definitions/myTuple/items/1" }
            }
        };
        test("$ref to items/0 resolves to string schema", () => {
            expect(compileAndValidate(schema, { first: "hello" }, "draft-07")).toBe(true);
        });
        test("$ref to items/0 rejects number", () => {
            expect(compileAndValidate(schema, { first: 42 }, "draft-07")).toBe(false);
        });
        test("$ref to items/1 resolves to number schema", () => {
            expect(compileAndValidate(schema, { second: 42 }, "draft-07")).toBe(true);
        });
    });
});

describe("Transpile: cross-draft edge cases", () => {

    describe("draft-04: multiple transpilations in one schema", () => {
        /**
         * Schema combining multiple draft-04 features:
         * - id → $id
         * - definitions → $defs
         * - dependencies → dependentRequired
         * - exclusiveMinimum boolean → numeric
         * - $ref path rewriting
         */
        const schema = {
            id: "http://example.com/combined",
            definitions: {
                age: {
                    type: "integer",
                    minimum: 0,
                    exclusiveMinimum: true
                }
            },
            type: "object",
            dependencies: {
                email: ["name"]
            },
            properties: {
                name: { type: "string" },
                email: { type: "string" },
                age: { $ref: "#/definitions/age" }
            }
        };
        test("valid data passes all transpiled constraints", () => {
            expect(compileAndValidate(schema, { name: "John", email: "john@test.com", age: 25 }, "draft-04")).toBe(true);
        });
        test("age=0 fails exclusiveMinimum", () => {
            expect(compileAndValidate(schema, { name: "John", age: 0 }, "draft-04")).toBe(false);
        });
        test("email without name fails dependency", () => {
            expect(compileAndValidate(schema, { email: "john@test.com" }, "draft-04")).toBe(false);
        });
    });

    describe("draft-06: const keyword (introduced in draft-06)", () => {
        const schema = {
            type: "object",
            properties: {
                version: { const: 1 }
            }
        };
        test("matching const value passes", () => {
            expect(compileAndValidate(schema, { version: 1 }, "draft-06")).toBe(true);
        });
        test("non-matching const value fails", () => {
            expect(compileAndValidate(schema, { version: 2 }, "draft-06")).toBe(false);
        });
    });

    describe("draft-07: if/then/else (introduced in draft-07)", () => {
        const schema = {
            type: "object",
            if: {
                properties: { type: { const: "business" } },
                required: ["type"]
            },
            then: {
                required: ["company"]
            },
            else: {
                required: ["firstName"]
            }
        };
        test("business type requires company", () => {
            expect(compileAndValidate(schema, { type: "business", company: "Acme" }, "draft-07")).toBe(true);
        });
        test("business type without company fails", () => {
            expect(compileAndValidate(schema, { type: "business" }, "draft-07")).toBe(false);
        });
        test("personal type requires firstName", () => {
            expect(compileAndValidate(schema, { type: "personal", firstName: "John" }, "draft-07")).toBe(true);
        });
    });

    describe("draft-04: $ref overrides all siblings including type", () => {
        const schema = {
            definitions: {
                num: { type: "number" }
            },
            type: "object",
            properties: {
                value: {
                    $ref: "#/definitions/num",
                    type: "string",
                    minimum: 0,
                    maximum: 100
                }
            }
        };
        test("$ref target type (number) is used, not sibling type (string)", () => {
            expect(compileAndValidate(schema, { value: 42 }, "draft-04")).toBe(true);
        });
        test("string rejected because $ref resolved to number schema", () => {
            expect(compileAndValidate(schema, { value: "hello" }, "draft-04")).toBe(false);
        });
    });
});
