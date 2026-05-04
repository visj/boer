import { describe, test, expect } from "bun:test";
import fs from "fs";
import path from "path";

import { CompoundSchema } from '@boer/schema';
import { compile } from '@boer/compiler';
import { catalog } from '@boer/validate';

const __dirname = import.meta.dir;
const SPECS_DIR = path.resolve(__dirname, "specs");

/**
 * Loads meta-schema files for a given draft and returns the necessary objects
 * to compile schemas against that draft.
 * @param {string} draft
 * @returns {{ rootMetaSchema: any, rootMetaUri: string, vocabSchemas: Array<{schema: any, uri: string}> }}
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
 * Compiles a JSON Schema and validates data against it.
 * @param {object} schema - The JSON Schema to compile
 * @param {any} data - The data to validate
 * @param {string} [draft="draft-07"] - The draft version to use
 * @returns {boolean} - Whether the data is valid
 */
function compileAndValidate(schema, data, draft = "draft-07") {
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
    const compiledRoot = compiled[0].schema;
    return cat.validate(data, compiledRoot);
}

/**
 * Helper to run a group of tests against a schema.
 * @param {object} schema
 * @param {Array<{description: string, data: any, valid: boolean}>} tests
 * @param {string} [draft]
 */
function runSchemaTests(schema, tests, draft) {
    for (const tc of tests) {
        test(tc.description, () => {
            const result = compileAndValidate(schema, tc.data, draft);
            expect(result).toBe(tc.valid);
        });
    }
}

/* =========================================================================
 * AJV HARDENING COMPLIANCE TESTS
 *
 * These tests are derived from real-world issues reported against ajv.
 * Each test verifies correct JSON Schema validation behavior per the spec,
 * targeting edge cases and common pitfalls in schema validators.
 * ========================================================================= */

describe("Compliance: if/then/else", () => {

    describe("ajv#753 - if/then with properties: absent property makes if succeed", () => {
        const schema = {
            type: "object",
            properties: {
                foo: { type: "string" },
                bar: { type: "string" }
            },
            if: { properties: { foo: { enum: ["bar"] } } },
            then: { required: ["bar"] }
        };
        runSchemaTests(schema, [
            { description: "empty object - if passes (properties skips absent keys), then requires bar => invalid", data: {}, valid: false },
            { description: "foo=bar triggers then, bar missing => invalid", data: { foo: "bar" }, valid: false },
            { description: "foo=bar and bar present => valid", data: { foo: "bar", bar: "baz" }, valid: true },
            { description: "foo=other, if fails, then not applied => valid", data: { foo: "other" }, valid: true }
        ]);
    });

    describe("ajv#650 - if/then with pattern: absent property makes if succeed", () => {
        const schema = {
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "object",
            properties: {
                firstName: { type: "string" },
                countryOfBirth: { type: "string", enum: ["England", "Italy"] },
                cityOfBirth: { type: "string" }
            },
            required: ["firstName"],
            if: { properties: { countryOfBirth: { pattern: "^England$" } } },
            then: { required: ["cityOfBirth"] }
        };
        runSchemaTests(schema, [
            { description: "only firstName - if passes vacuously, then requires cityOfBirth => invalid", data: { firstName: "Emma" }, valid: false },
            { description: "countryOfBirth=England, cityOfBirth present => valid", data: { firstName: "Emma", countryOfBirth: "England", cityOfBirth: "London" }, valid: true },
            { description: "countryOfBirth=England, cityOfBirth absent => invalid", data: { firstName: "Emma", countryOfBirth: "England" }, valid: false },
            { description: "countryOfBirth=Italy, if fails => valid", data: { firstName: "Emma", countryOfBirth: "Italy" }, valid: true }
        ]);
    });

    describe("ajv#724 - if/then in allOf: absent property makes if succeed", () => {
        const schema = {
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "object",
            allOf: [{
                if: { properties: { code: { enum: ["01", "02"] } } },
                then: { required: ["reason"] }
            }]
        };
        runSchemaTests(schema, [
            { description: "empty object - if passes, then requires reason => invalid", data: {}, valid: false },
            { description: "code=01 without reason => invalid", data: { code: "01" }, valid: false },
            { description: "code=01 with reason => valid", data: { code: "01", reason: "test" }, valid: true },
            { description: "code=03 (not in enum), if fails => valid", data: { code: "03" }, valid: true }
        ]);
    });

    describe("ajv#2520 - if/then with minLength: short name does not trigger then", () => {
        const schema = {
            type: "object",
            properties: {
                name: { type: "string" },
                age: { type: "number" }
            },
            required: ["name"],
            if: { properties: { name: { type: "string", minLength: 3 } } },
            then: {
                properties: { age: { type: "number", minimum: 10 } },
                required: ["age"]
            }
        };
        runSchemaTests(schema, [
            { description: "name >= 3 chars triggers then requiring age => invalid without age", data: { name: "John" }, valid: false },
            { description: "name >= 3 chars and valid age => valid", data: { name: "John", age: 15 }, valid: true },
            { description: "short name does not trigger then => valid without age", data: { name: "Jo" }, valid: true },
            { description: "empty name does not trigger then => valid", data: { name: "" }, valid: true }
        ]);
    });

    describe("ajv#2439 - if/then with properties: if matches when property is absent", () => {
        const schema = {
            type: "object",
            properties: {
                a: { type: "string" },
                b: { type: "string" }
            },
            if: { properties: { a: { const: "yes" } } },
            then: { required: ["b"] }
        };
        runSchemaTests(schema, [
            { description: "a absent - if passes vacuously, then requires b => invalid", data: {}, valid: false },
            { description: "a absent but b present => valid", data: { b: "hello" }, valid: true },
            { description: "a=yes, b present => valid", data: { a: "yes", b: "hello" }, valid: true },
            { description: "a=yes, b missing => invalid", data: { a: "yes" }, valid: false },
            { description: "a=no, if fails, then not applied => valid without b", data: { a: "no" }, valid: true }
        ]);
    });

    // According to ajv, this is by design, I need to understand better how the spec works, likely ajv is correct
    describe("ajv#913 - if/then with enum check on absent property", () => {
        const schema = {
            type: "object",
            properties: {
                A: { type: "string" },
                hasA: { type: "boolean" }
            },
            if: { properties: { hasA: { enum: [true] } } },
            then: { required: ["A"] }
        };
        runSchemaTests(schema, [
            { description: "hasA absent - if passes vacuously, then requires A => invalid", data: {}, valid: false },
            { description: "hasA=true, A missing => invalid", data: { hasA: true }, valid: false },
            { description: "hasA=true, A present => valid", data: { hasA: true, A: "hello" }, valid: true },
            { description: "hasA=false, if fails => valid", data: { hasA: false }, valid: true }
        ]);
    });

    describe("ajv#1935 - if/then/else with integer narrowing of number type", () => {
        const schema = {
            type: "number",
            if: { type: "integer", maximum: 5 },
            else: { minimum: 10 }
        };
        runSchemaTests(schema, [
            { description: "integer <= 5 matches if => valid", data: 4, valid: true },
            { description: "non-integer < 10 fails if, must pass else => invalid", data: 4.5, valid: false },
            { description: "integer > 5 fails if, must pass else minimum 10 => invalid", data: 7, valid: false },
            { description: "non-integer >= 10 fails if, passes else => valid", data: 11.5, valid: true },
            { description: "string fails type:number => invalid", data: "", valid: false },
            { description: "null fails type:number => invalid", data: null, valid: false }
        ]);
    });
});

describe("Compliance: oneOf", () => {

    describe("ajv#474 - oneOf with const for discriminated objects", () => {
        const schema = {
            type: "object",
            additionalProperties: false,
            properties: {
                graphs: {
                    type: "array",
                    items: {
                        oneOf: [
                            {
                                type: "object", additionalProperties: false,
                                properties: { nature: { type: "string", const: "throughput" } },
                                required: ["nature"]
                            },
                            {
                                type: "object", additionalProperties: false,
                                properties: {
                                    color_scale: { type: "string", enum: ["absolute", "relative", "ranked"] },
                                    nature: { type: "string", const: "histogram" }
                                },
                                required: ["color_scale", "nature"]
                            },
                            {
                                type: "object", additionalProperties: false,
                                properties: { nature: { type: "string", const: "marker" } },
                                required: ["nature"]
                            }
                        ]
                    }
                }
            },
            required: ["graphs"]
        };
        runSchemaTests(schema, [
            { description: "histogram with color_scale => valid", data: { graphs: [{ color_scale: "absolute", nature: "histogram" }] }, valid: true },
            { description: "marker => valid", data: { graphs: [{ nature: "marker" }] }, valid: true },
            { description: "throughput => valid", data: { graphs: [{ nature: "throughput" }] }, valid: true }
        ]);
    });

    describe("ajv#298 - oneOf with enum subsets", () => {
        const schema = {
            type: "array",
            minItems: 1,
            items: {
                type: "string",
                oneOf: [
                    { enum: ["admin"] },
                    { enum: ["read", "search"] }
                ]
            }
        };
        runSchemaTests(schema, [
            { description: "admin alone => valid", data: ["admin"], valid: true },
            { description: "read alone => valid", data: ["read"], valid: true },
            { description: "read and search => valid", data: ["read", "search"], valid: true },
            { description: "admin and read - each item individually valid", data: ["admin", "read"], valid: true }
        ]);
    });

    describe("ajv#538 - oneOf with additionalProperties at branch level", () => {
        const schema = {
            type: "object",
            oneOf: [
                {
                    type: "object",
                    properties: { "@USE": { type: "string" } },
                    required: ["@USE"],
                    additionalProperties: false
                },
                {
                    type: "object",
                    properties: { "@DEF": { type: "string" }, "@name": { type: "string" } },
                    required: ["@name"],
                    additionalProperties: false
                }
            ]
        };
        runSchemaTests(schema, [
            { description: "@name and @DEF matches second branch", data: { "@name": "f", "@DEF": "kl" }, valid: true },
            { description: "@USE matches first branch", data: { "@USE": "test" }, valid: true },
            { description: "@name only matches second branch", data: { "@name": "f" }, valid: true },
            { description: "empty object matches neither => invalid", data: {}, valid: false }
        ]);
    });

    describe("ajv#439 - oneOf: branch without type matches everything", () => {
        const schema = {
            properties: {
                data: {
                    oneOf: [
                        { properties: { value: { type: "integer" } } },
                        { type: "string" }
                    ]
                }
            }
        };
        runSchemaTests(schema, [
            { description: "string matches both branches (first has no type) => oneOf fails", data: { data: "546" }, valid: false },
            { description: "object with integer value matches first only => valid", data: { data: { value: 5 } }, valid: true },
            { description: "integer matches first only (no type constraint) => valid", data: { data: 546 }, valid: true }
        ]);
    });

    describe("ajv#252 - oneOf with null type", () => {
        const schema = {
            type: "object",
            properties: {
                username: {
                    oneOf: [
                        { type: "string" },
                        { type: "null" }
                    ]
                }
            }
        };
        runSchemaTests(schema, [
            { description: "null matches only null branch => valid", data: { username: null }, valid: true },
            { description: "string matches only string branch => valid", data: { username: "john" }, valid: true },
            { description: "number matches neither => invalid", data: { username: 123 }, valid: false }
        ]);
    });

    describe("ajv#1388 - oneOf with additionalProperties:false in each branch", () => {
        const schema = {
            type: "object",
            oneOf: [
                {
                    properties: { foo: { type: "string" } },
                    required: ["foo"],
                    additionalProperties: false
                },
                {
                    properties: { bar: { type: "integer" } },
                    required: ["bar"],
                    additionalProperties: false
                }
            ]
        };
        runSchemaTests(schema, [
            { description: "only foo matches first branch => valid", data: { foo: "abc" }, valid: true },
            { description: "only bar matches second branch => valid", data: { bar: 1 }, valid: true },
            { description: "both foo and bar fails both branches (additionalProperties) => invalid", data: { foo: "abc", bar: 1 }, valid: false },
            { description: "empty object fails both (required) => invalid", data: {}, valid: false }
        ]);
    });

    describe("ajv#1107 - oneOf with type null and type string", () => {
        const schema = {
            type: "object",
            properties: {
                id: { type: "number" },
                name: { oneOf: [{ type: "string" }, { type: "null" }] },
                num: { type: "number" }
            },
            required: ["id"]
        };
        runSchemaTests(schema, [
            { description: "null matches type:null only => valid", data: { id: 1, name: null, num: 2 }, valid: true },
            { description: "string matches type:string only => valid", data: { id: 1, name: "hello", num: 2 }, valid: true },
            { description: "number matches neither => invalid", data: { id: 1, name: 42 }, valid: false }
        ]);
    });

    describe("ajv#1274 - oneOf with empty schema and type:null - null matches both", () => {
        const schema = {
            properties: {
                content: { oneOf: [{}, { type: "null" }] }
            }
        };
        runSchemaTests(schema, [
            { description: "null matches both {} and {type:null} => oneOf fails", data: { content: null }, valid: false },
            { description: "string matches only {} => oneOf passes", data: { content: "hello" }, valid: true }
        ]);
    });

    describe("ajv#1573 - oneOf requiring schema or content (not both)", () => {
        const schema = {
            type: "object",
            properties: {
                name: { type: "string" },
                in: { enum: ["query", "header", "path", "cookie"] },
                required: { default: false, type: "boolean" },
                schema: true,
                content: { type: "object" }
            },
            required: ["in"],
            oneOf: [
                { required: ["schema"] },
                { required: ["content"] }
            ]
        };
        runSchemaTests(schema, [
            { description: "schema present => matches first branch", data: { name: "limit", in: "query", required: false, schema: { type: "integer" } }, valid: true },
            { description: "content present => matches second branch", data: { in: "query", content: {} }, valid: true },
            { description: "both schema and content => matches both, oneOf fails", data: { in: "query", schema: {}, content: {} }, valid: false },
            { description: "neither => matches none, oneOf fails", data: { in: "query" }, valid: false }
        ]);
    });

    describe("ajv#1934 - oneOf: empty array matches both array schemas", () => {
        const schema = {
            type: "object",
            required: ["transactions"],
            properties: {
                transactions: {
                    oneOf: [
                        {
                            type: "array",
                            items: {
                                type: "object",
                                required: ["chainId", "input"],
                                properties: {
                                    input: { type: "string", pattern: "^0x[0-9a-f]*$" },
                                    chainId: { type: "string", pattern: "^0x([1-9a-f]+[0-9a-f]*|0)$" }
                                }
                            }
                        },
                        {
                            type: "array",
                            items: {
                                type: "string",
                                pattern: "^0x[0-9a-f]{64}$"
                            }
                        }
                    ]
                }
            }
        };
        runSchemaTests(schema, [
            { description: "empty array matches both schemas => oneOf fails", data: { transactions: [] }, valid: false },
            { description: "valid transaction object => first schema only", data: { transactions: [{ chainId: "0x1", input: "0xabc" }] }, valid: true },
            { description: "valid hash => second schema only", data: { transactions: ["0x0000000000000000000000000000000000000000000000000000000000000001"] }, valid: true }
        ]);
    });

    describe("ajv#2566 - oneOf with overlapping schemas both match", () => {
        const schema = {
            type: "object",
            required: ["id"],
            additionalProperties: false,
            properties: {
                id: { type: "string" },
                analysis: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        extractedData: {
                            oneOf: [
                                {
                                    type: "object",
                                    properties: { firstProp: { type: "number", maximum: 3 } }
                                },
                                {
                                    type: "object",
                                    properties: { secondProp: { type: "number", minimum: 10 } }
                                }
                            ]
                        }
                    }
                }
            }
        };
        runSchemaTests(schema, [
            { description: "firstProp=2 matches both (no required/additionalProperties) => oneOf fails", data: { id: "X", analysis: { extractedData: { firstProp: 2 } } }, valid: false },
            { description: "firstProp=5 fails first (maximum:3), matches second => valid", data: { id: "X", analysis: { extractedData: { firstProp: 5 } } }, valid: true },
            { description: "empty extractedData matches both => oneOf fails", data: { id: "X", analysis: { extractedData: {} } }, valid: false }
        ]);
    });
});

describe("Compliance: allOf / anyOf", () => {

    describe("ajv#649 - allOf combining properties from multiple subschemas", () => {
        const schema = {
            type: "object",
            allOf: [
                { type: "object", properties: { a: { type: "number" } }, required: ["a"] },
                { type: "object", properties: { b: { type: "number" } }, required: ["b"] }
            ]
        };
        runSchemaTests(schema, [
            { description: "both a and b => valid", data: { a: 1, b: 2 }, valid: true },
            { description: "missing b => invalid", data: { a: 1 }, valid: false },
            { description: "missing a => invalid", data: { b: 2 }, valid: false },
            { description: "empty => invalid", data: {}, valid: false }
        ]);
    });

    describe("ajv#428 - allOf within anyOf: lineId type mismatch", () => {
        const schema = {
            type: "array",
            items: {
                type: "object",
                anyOf: [{
                    allOf: [
                        {
                            allOf: [
                                { properties: { type: { type: "string", minLength: 1 } } },
                                { required: ["type"] }
                            ]
                        },
                        {
                            properties: {
                                type: { enum: ["openUrl"] },
                                lineId: { type: "string" },
                                url: { type: "string", minLength: 1 }
                            },
                            required: ["url"]
                        }
                    ]
                }]
            }
        };
        runSchemaTests(schema, [
            { description: "lineId is integer instead of string => invalid", data: [{ lineId: 1, type: "openUrl", url: "http://localhost" }], valid: false },
            { description: "all correct types => valid", data: [{ lineId: "1", type: "openUrl", url: "http://localhost" }], valid: true },
            { description: "missing required url => invalid", data: [{ type: "openUrl" }], valid: false },
            { description: "no lineId at all => valid", data: [{ type: "openUrl", url: "http://localhost" }], valid: true }
        ]);
    });

    describe("ajv#1496 - allOf with separate additionalProperties:false rejects everything", () => {
        const schema = {
            allOf: [
                {
                    type: "object",
                    properties: { a: { type: "string" } },
                    required: ["a"],
                    additionalProperties: false
                },
                {
                    type: "object",
                    properties: { b: { type: "number" } },
                    required: ["b"],
                    additionalProperties: false
                }
            ]
        };
        runSchemaTests(schema, [
            { description: "both a and b - each sub-schema forbids the other => invalid", data: { a: "hello", b: 3000 }, valid: false },
            { description: "only a - second sub-schema requires b => invalid", data: { a: "hello" }, valid: false },
            { description: "only b - first sub-schema requires a => invalid", data: { b: 3000 }, valid: false }
        ]);
    });

    describe("ajv#1515 - nested anyOf validation", () => {
        const schema = {
            type: "object",
            anyOf: [
                {
                    required: ["flag"],
                    properties: {
                        type: { const: "FOO" },
                        flag: { type: "boolean" }
                    }
                },
                {
                    properties: {
                        type: { enum: ["BAR", "BAZ"] }
                    },
                    anyOf: [
                        { required: ["name"], properties: { name: { type: "string" } } },
                        { required: ["value"], properties: { value: { type: "number" } } }
                    ]
                }
            ]
        };
        runSchemaTests(schema, [
            { description: "BAR with value matches second anyOf branch", data: { type: "BAR", value: 500 }, valid: true },
            { description: "FOO with flag matches first anyOf branch", data: { type: "FOO", flag: true }, valid: true },
            { description: "BAZ with name matches second anyOf branch", data: { type: "BAZ", name: "test" }, valid: true },
            { description: "no matching branch => invalid", data: { type: "OTHER" }, valid: false }
        ]);
    });

    describe("ajv#1123 - anyOf with additionalProperties:false in each branch", () => {
        const schema = {
            type: "object",
            anyOf: [
                {
                    type: "object",
                    properties: {
                        addresses: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: { line1: { type: "string" }, city: { type: "string" } },
                                required: ["line1", "city"],
                                additionalProperties: false
                            }
                        }
                    },
                    required: ["addresses"],
                    additionalProperties: false
                },
                {
                    type: "object",
                    properties: {
                        emails: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: { address: { type: "string" } },
                                required: ["address"],
                                additionalProperties: false
                            }
                        }
                    },
                    required: ["emails"],
                    additionalProperties: false
                }
            ]
        };
        runSchemaTests(schema, [
            { description: "only addresses => matches first branch", data: { addresses: [{ line1: "300 E Main St", city: "Madison" }] }, valid: true },
            { description: "only emails => matches second branch", data: { emails: [{ address: "test@example.com" }] }, valid: true },
            { description: "both addresses and emails => fails both (additionalProperties)", data: { addresses: [{ line1: "300 E Main St", city: "Madison" }], emails: [{ address: "test@example.com" }] }, valid: false }
        ]);
    });

    describe("ajv#1668 - anyOf should not be ignored in presence of not", () => {
        const schema = {
            anyOf: [{ const: 1 }],
            not: { const: true }
        };
        runSchemaTests(schema, [
            { description: "1 satisfies anyOf and not => valid", data: 1, valid: true },
            { description: "3 fails anyOf => invalid", data: 3, valid: false },
            { description: "true fails not => invalid", data: true, valid: false }
        ]);
    });
});

describe("Compliance: properties / required / additionalProperties", () => {

    describe("ajv#279 - schema without type: properties/required only apply to objects", () => {
        const schema = {
            properties: {
                prime: { type: "boolean" },
                number: { type: "number", minimum: 1, maximum: 10 },
                name: { type: "string" }
            },
            required: ["name"],
            additionalProperties: false
        };
        runSchemaTests(schema, [
            { description: "array data - properties/required only apply to objects => valid", data: [{ blah: "one" }], valid: true },
            { description: "object missing required + additional props => invalid", data: { blah: "one", number: 1, prime: false, mappedTo: "E" }, valid: false },
            { description: "valid object => valid", data: { name: "one", number: 1, prime: true }, valid: true }
        ]);
    });

    describe("ajv#728 - nested required: parent not requiring child object", () => {
        const schema = {
            type: "object",
            properties: {
                person: {
                    type: "object",
                    required: ["name", "email"],
                    properties: {
                        name: { type: "string", minLength: 1 },
                        email: { type: "string", minLength: 1 }
                    }
                }
            }
        };
        runSchemaTests(schema, [
            { description: "empty root - person not required => valid", data: {}, valid: true },
            { description: "person as empty object - missing name/email => invalid", data: { person: {} }, valid: false },
            { description: "person with name and email => valid", data: { person: { name: "John", email: "john@example.com" } }, valid: true },
            { description: "person with only name => invalid", data: { person: { name: "John" } }, valid: false }
        ]);
    });

    describe("ajv#133 - object with property named 'type'", () => {
        const schema = {
            type: "object",
            required: ["type", "percent", "foo"],
            additionalProperties: false,
            properties: {
                type: { type: "string" },
                percent: { type: "number", minimum: 0, maximum: 100 },
                foo: { type: "string" }
            }
        };
        runSchemaTests(schema, [
            { description: "all required present => valid", data: { type: "sales", percent: 10, foo: "bar" }, valid: true },
            { description: "missing type => invalid", data: { percent: 10, foo: "bar" }, valid: false },
            { description: "missing foo => invalid", data: { type: "sales", percent: 10 }, valid: false },
            { description: "empty object => invalid", data: {}, valid: false }
        ]);
    });

    describe("ajv#745 - required/properties without type: non-objects pass", () => {
        const schema = {
            required: ["foo"],
            properties: { foo: { type: "number" } }
        };
        runSchemaTests(schema, [
            { description: "object with valid property => valid", data: { foo: 5 }, valid: true },
            { description: "object with wrong type => invalid", data: { foo: "bar" }, valid: false },
            { description: "empty object missing required => invalid", data: {}, valid: false },
            { description: "null - required only applies to objects => valid", data: null, valid: true },
            { description: "string => valid", data: "bar", valid: true },
            { description: "number => valid", data: 0, valid: true }
        ]);
    });

    describe("ajv#746 - required in array items only checks matching property", () => {
        const schema = {
            type: "object",
            properties: {
                ARRs: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: { name: { type: "string" } },
                        required: ["name"]
                    }
                }
            }
        };
        runSchemaTests(schema, [
            { description: "different property name (vsds) not validated against ARRs schema => valid", data: { vsds: [{}] }, valid: true },
            { description: "ARRs item missing required name => invalid", data: { ARRs: [{}] }, valid: false },
            { description: "ARRs item with name => valid", data: { ARRs: [{ name: "test" }] }, valid: true }
        ]);
    });

    describe("ajv#1790 - non-required properties not validated when absent", () => {
        const schema = {
            type: "object",
            required: ["userId", "metaKey", "metaValue"],
            properties: {
                id: { type: "integer", minimum: 1 },
                userId: { type: "integer", minimum: 1 },
                metaKey: { type: "string", minLength: 1, maxLength: 30 },
                metaValue: { type: "string" }
            },
            additionalProperties: false
        };
        runSchemaTests(schema, [
            { description: "without optional id => valid", data: { userId: 3840, metaKey: "LAST_ACTIVITY_TIME", metaValue: "2021-10-15 12:19:36" }, valid: true },
            { description: "with valid id => valid", data: { id: 1, userId: 3840, metaKey: "LAST_ACTIVITY_TIME", metaValue: "2021-10-15 12:19:36" }, valid: true },
            { description: "with invalid id (0) => invalid", data: { id: 0, userId: 3840, metaKey: "LAST_ACTIVITY_TIME", metaValue: "2021-10-15 12:19:36" }, valid: false }
        ]);
    });

    describe("ajv#2492 - optional properties not validated when absent", () => {
        const schema = {
            type: "object",
            properties: {
                heartbeat: { type: "string", pattern: "please" }
            }
        };
        runSchemaTests(schema, [
            { description: "object without the optional property => valid", data: { a: 1 }, valid: true },
            { description: "matching property => valid", data: { heartbeat: "please" }, valid: true },
            { description: "non-matching property => invalid", data: { heartbeat: "no" }, valid: false },
            { description: "empty object => valid", data: {}, valid: true }
        ]);
    });

    describe("ajv#1180 - required property typo (different key name)", () => {
        const schema = {
            type: "object",
            properties: {
                version: { type: "integer", enum: [1] },
                status: { type: "string", enum: ["running", "notRunning", "undefined"] },
                message: { type: "string" },
                dbSnapshotExists: { type: "boolean" }
            },
            required: ["version", "status", "dbSnaphotExists"]
        };
        runSchemaTests(schema, [
            { description: "data has dbSnapshotExists but required is dbSnaphotExists (typo) => invalid", data: { version: 1, status: "undefined", message: "", dbSnapshotExists: true }, valid: false },
            { description: "data has the typo key => valid", data: { version: 1, status: "undefined", dbSnaphotExists: true }, valid: true }
        ]);
    });

    describe("ajv#2077 - empty string key in required and properties", () => {
        const schema = {
            type: "object",
            properties: { "": { type: "number" } },
            required: [""]
        };
        runSchemaTests(schema, [
            { description: "missing empty-string key => invalid", data: {}, valid: false },
            { description: "empty-string key with correct type => valid", data: { "": 42 }, valid: true },
            { description: "empty-string key with wrong type => invalid", data: { "": "hello" }, valid: false }
        ]);
    });

    describe("ajv#87 - property name $ (dollar sign)", () => {
        const schema = {
            type: "object",
            additionalProperties: false,
            properties: { "$": { type: "string" } },
            required: ["$"]
        };
        runSchemaTests(schema, [
            { description: "$ property as string => valid", data: { "$": "Client" }, valid: true },
            { description: "$ property as number => invalid", data: { "$": 123 }, valid: false },
            { description: "missing $ => invalid", data: {}, valid: false }
        ]);
    });

    describe("ajv#2376 - minProperties with additionalProperties:false", () => {
        const schema = {
            additionalProperties: false,
            minProperties: 1,
            type: "object",
            properties: { good: { type: "string" } },
            required: []
        };
        runSchemaTests(schema, [
            { description: "additional property fails additionalProperties => invalid", data: { bad: "will be removed" }, valid: false },
            { description: "known property => valid", data: { good: "value" }, valid: true },
            { description: "empty object fails minProperties => invalid", data: {}, valid: false }
        ]);
    });

    describe("ajv#2323 - required in nested object references its own scope", () => {
        const schema = {
            type: "object",
            properties: {
                addresses: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            stid: { type: "string" },
                            street: {
                                type: "object",
                                properties: { st1: { type: "string" }, st2: { type: "string" } },
                                required: ["stid", "postcode"]
                            },
                            postcode: { type: "integer" },
                            updated: { type: "string" }
                        },
                        required: ["stid", "postcode", "updated"]
                    }
                }
            },
            required: ["addresses"]
        };
        runSchemaTests(schema, [
            { description: "street object missing its own required stid and postcode => invalid", data: { addresses: [{ stid: "1111", street: { st1: "st1", st2: "st2" }, postcode: 232323, updated: "2000-01-01" }] }, valid: false }
        ]);
    });
});

describe("Compliance: type validation", () => {

    describe("ajv#1118 - 1.0 is a valid integer per JSON Schema", () => {
        const schema = {
            properties: { foo: { type: "integer" } }
        };
        runSchemaTests(schema, [
            { description: "1.0 is a valid integer (mathematically integer)", data: { foo: 1.0 }, valid: true },
            { description: "1.1 is not a valid integer", data: { foo: 1.1 }, valid: false },
            { description: "1 is a valid integer", data: { foo: 1 }, valid: true }
        ]);
    });

    describe("ajv#490 - integer type should reject strings", () => {
        const schema = { type: "integer", minimum: 0 };
        runSchemaTests(schema, [
            { description: "valid integer => valid", data: 1, valid: true },
            { description: "string '1' => invalid", data: "1", valid: false },
            { description: "string 'abc' => invalid", data: "abc", valid: false }
        ]);
    });

    describe("ajv#2185 - type array rejects non-array input", () => {
        const schema = {
            type: "array",
            items: {
                type: "object",
                properties: {
                    Id: { type: "string" },
                    PostedBy: { type: "string" },
                    category: { type: "string" },
                    UserName: { type: "string" },
                    reviewerId: { type: "number" }
                },
                required: ["Id", "PostedBy", "category", "UserName", "reviewerId"]
            }
        };
        runSchemaTests(schema, [
            { description: "non-array object fails type => invalid", data: { items: [{ Id: "1" }] }, valid: false },
            { description: "array with valid item => valid", data: [{ Id: "1", PostedBy: "Jane", category: "Cat", UserName: "Me", reviewerId: 5 }], valid: true },
            { description: "reviewerId as string => invalid", data: [{ Id: "1", PostedBy: "Jane", category: "Cat", UserName: "Me", reviewerId: "Mon" }], valid: false },
            { description: "missing required field => invalid", data: [{ Id: "1", PostedBy: "Jane", category: "Cat", UserName: "Me" }], valid: false }
        ]);
    });

    describe("ajv#1157 - enum with object values", () => {
        const schema = {
            type: "object",
            properties: {
                object_enum: {
                    type: "object",
                    enum: [{ text: "Test 1", value: "test1" }]
                }
            }
        };
        runSchemaTests(schema, [
            { description: "matching object => valid", data: { object_enum: { text: "Test 1", value: "test1" } }, valid: true },
            { description: "non-matching object => invalid", data: { object_enum: { text: "Test 2", value: "test2" } }, valid: false },
            { description: "object with extra property => invalid", data: { object_enum: { text: "Test 1", value: "test1", extra: true } }, valid: false }
        ]);
    });
});

describe("Compliance: enum / const", () => {

    describe("ajv#1270 - items:false rejects non-empty arrays", () => {
        const schema = { type: "array", items: false };
        runSchemaTests(schema, [
            { description: "non-empty array => invalid", data: [1], valid: false },
            { description: "empty array => valid", data: [], valid: true }
        ]);
    });
});

describe("Compliance: tuple / items", () => {

    describe("ajv#604 - tuple validation (items as array)", () => {
        const schema = {
            type: "object",
            required: ["rolls"],
            properties: {
                rolls: {
                    type: "array",
                    minItems: 1,
                    items: [{
                        type: "object",
                        required: ["uid", "length"],
                        additionalProperties: false,
                        properties: {
                            uid: { type: "string" },
                            length: { type: "number", minimum: 1 },
                            waste: { type: "number" }
                        }
                    }]
                }
            }
        };
        runSchemaTests(schema, [
            { description: "first item valid, second unconstrained => valid", data: { rolls: [{ uid: "abc", length: 10 }, { anything: true }] }, valid: true },
            { description: "single valid item => valid", data: { rolls: [{ uid: "abc", length: 10, waste: 1 }] }, valid: true },
            { description: "first item missing required uid => invalid", data: { rolls: [{ length: 10 }] }, valid: false },
            { description: "empty array fails minItems => invalid", data: { rolls: [] }, valid: false }
        ]);
    });

    describe("ajv#737 - tuple: only first element constrained", () => {
        const schema = {
            type: "object",
            properties: {
                creditAccounts: {
                    type: "array",
                    items: [{
                        type: "object",
                        properties: {
                            recordType: { type: "number", const: 3 },
                            beneficiaryAccountNumber: { type: "string" },
                            beneficiarySortCode: { type: "string" },
                            paymentDate: { type: "string" },
                            paymentCurrency: { type: "string" }
                        },
                        required: ["recordType", "beneficiaryAccountNumber", "beneficiarySortCode", "paymentDate", "paymentCurrency"]
                    }]
                }
            }
        };
        runSchemaTests(schema, [
            { description: "first item valid, second unconstrained => valid", data: { creditAccounts: [{ recordType: 3, beneficiaryAccountNumber: "123", beneficiarySortCode: "456", paymentDate: "2024-01-01", paymentCurrency: "GBP" }, { random: "data" }] }, valid: true },
            { description: "first item missing required => invalid", data: { creditAccounts: [{ recordType: 3 }] }, valid: false },
            { description: "single valid first item => valid", data: { creditAccounts: [{ recordType: 3, beneficiaryAccountNumber: "123", beneficiarySortCode: "456", paymentDate: "2024-01-01", paymentCurrency: "GBP" }] }, valid: true }
        ]);
    });
});

describe("Compliance: dependencies", () => {

    describe("ajv#94 - multiple property dependencies", () => {
        const schema = {
            type: "object",
            dependencies: {
                bar: ["baz"],
                foo: ["bar"]
            }
        };
        runSchemaTests(schema, [
            { description: "foo without bar => invalid", data: { foo: "test" }, valid: false },
            { description: "bar without baz => invalid", data: { bar: "test" }, valid: false },
            { description: "foo, bar, and baz => valid", data: { foo: "test", bar: "test", baz: "test" }, valid: true },
            { description: "empty object => valid", data: {}, valid: true },
            { description: "only baz => valid", data: { baz: "test" }, valid: true }
        ]);
    });
});

describe("Compliance: patternProperties / propertyNames", () => {

    describe("ajv#286 - patternProperties and properties both apply", () => {
        const schema = {
            type: "object",
            properties: { test: { type: "string" } },
            patternProperties: { "^.*$": { type: "boolean" } },
            additionalProperties: false
        };
        runSchemaTests(schema, [
            { description: "test='example' satisfies properties but fails patternProperties => invalid", data: { test: "example" }, valid: false },
            { description: "test=true satisfies patternProperties but fails properties => invalid", data: { test: true }, valid: false },
            { description: "empty object => valid", data: {}, valid: true }
        ]);
    });

    describe("ajv#2177 - propertyNames with enum", () => {
        const schema = {
            type: "object",
            propertyNames: { enum: ["Foo", "Bar"] },
            patternProperties: { ".*": { type: "number" } }
        };
        runSchemaTests(schema, [
            { description: "allowed names and number values => valid", data: { Foo: 123, Bar: 456 }, valid: true },
            { description: "disallowed name Baz => invalid", data: { Foo: 123, Baz: 456 }, valid: false },
            { description: "empty object => valid", data: {}, valid: true },
            { description: "wrong value type => invalid", data: { Foo: "hello" }, valid: false }
        ]);
    });

    describe("ajv#861 - propertyNames with empty schema allows all names", () => {
        const schema = {
            type: "object",
            additionalProperties: {
                type: "array",
                items: { type: "string" },
                uniqueItems: true
            },
            propertyNames: {}
        };
        runSchemaTests(schema, [
            { description: "value not matching additionalProperties => invalid", data: { foo: "abc" }, valid: false },
            { description: "value matching additionalProperties => valid", data: { foo: ["abc"] }, valid: true },
            { description: "empty object => valid", data: {}, valid: true }
        ]);
    });
});

describe("Compliance: multipleOf (floating point precision)", () => {

    describe("ajv#2329 - multipleOf 0.01 with common decimals", () => {
        const schema = {
            type: "object",
            required: ["price"],
            properties: {
                price: { type: "number", multipleOf: 0.01, minimum: 0 }
            }
        };
        runSchemaTests(schema, [
            { description: "143.47 => valid", data: { price: 143.47 }, valid: true },
            { description: "143.48 => valid", data: { price: 143.48 }, valid: true },
            { description: "0.01 => valid", data: { price: 0.01 }, valid: true },
            { description: "0.005 is not a multiple => invalid", data: { price: 0.005 }, valid: false }
        ]);
    });

    describe("ajv#2537 - multipleOf 0.01 for 1.11", () => {
        const schema = {
            type: "object",
            properties: { price: { type: "number", multipleOf: 0.01 } },
            required: ["price"]
        };
        runSchemaTests(schema, [
            { description: "1.11 => valid", data: { price: 1.11 }, valid: true },
            { description: "1.10 => valid", data: { price: 1.10 }, valid: true },
            { description: "0.99 => valid", data: { price: 0.99 }, valid: true },
            { description: "1.111 is not a multiple => invalid", data: { price: 1.111 }, valid: false }
        ]);
    });

    describe("ajv#2416 - multipleOf 0.01 for 8.69", () => {
        const schema = { type: "number", multipleOf: 0.01 };
        runSchemaTests(schema, [
            { description: "8.69 => valid", data: 8.69, valid: true },
            { description: "8.5 => valid", data: 8.5, valid: true },
            { description: "8.691 is not a multiple => invalid", data: 8.691, valid: false }
        ]);
    });

    describe("ajv#2561 - multipleOf 1 for large integers", () => {
        const schema = { multipleOf: 1 };
        runSchemaTests(schema, [
            { description: "1e21 => valid", data: 1e21, valid: true },
            { description: "1e15 => valid", data: 1e15, valid: true },
            { description: "1.5 is not a multiple => invalid", data: 1.5, valid: false },
            { description: "7 => valid", data: 7, valid: true }
        ]);
    });

    describe("ajv#652 - multipleOf 0.015", () => {
        const schema = { type: "number", multipleOf: 0.015 };
        runSchemaTests(schema, [
            { description: "0.135 (9x) => valid", data: 0.135, valid: true },
            { description: "0.165 (11x) => valid", data: 0.165, valid: true },
            { description: "0.195 (13x) => valid", data: 0.195, valid: true },
            { description: "0.225 (15x) => valid", data: 0.225, valid: true },
            { description: "0.015 => valid", data: 0.015, valid: true },
            { description: "0.01 is not a multiple => invalid", data: 0.01, valid: false }
        ]);
    });

    describe("ajv#1005 - multipleOf 0.01 various decimals", () => {
        const schema = { type: "number", minimum: 0, multipleOf: 0.01 };
        runSchemaTests(schema, [
            { description: "0.94 => valid", data: 0.94, valid: true },
            { description: "0.93 => valid", data: 0.93, valid: true },
            { description: "19.99 => valid", data: 19.99, valid: true },
            { description: "1.005 is not a multiple => invalid", data: 1.005, valid: false }
        ]);
    });

    describe("ajv#2353 - multipleOf 0.1", () => {
        const schema = {
            type: "object",
            properties: { myProperty: { type: "number", multipleOf: 0.1 } }
        };
        runSchemaTests(schema, [
            { description: "0.3 => valid", data: { myProperty: 0.3 }, valid: true },
            { description: "0.7 => valid", data: { myProperty: 0.7 }, valid: true },
            { description: "0.2 => valid", data: { myProperty: 0.2 }, valid: true },
            { description: "0.4 => valid", data: { myProperty: 0.4 }, valid: true },
            { description: "0.15 is not a multiple => invalid", data: { myProperty: 0.15 }, valid: false }
        ]);
    });

    describe("ajv#2104 - multipleOf with floating point: 2.02 is multiple of 1.01", () => {
        const schema = {
            type: "object",
            properties: { foo: { multipleOf: 1.01, type: "number" } },
            required: ["foo"],
            additionalProperties: false
        };
        runSchemaTests(schema, [
            { description: "2.02 is a multiple of 1.01 => valid", data: { foo: 2.02 }, valid: true },
            { description: "0 is a multiple of any number => valid", data: { foo: 0 }, valid: true }
        ]);
    });
});

describe("Compliance: exclusiveMinimum / exclusiveMaximum", () => {

    describe("ajv#506 - exclusiveMinimum as number (draft-06+)", () => {
        const schema = { exclusiveMinimum: 0 };
        runSchemaTests(schema, [
            { description: "zero is exclusive => invalid", data: 0, valid: false },
            { description: "negative => invalid", data: -1, valid: false },
            { description: "positive => valid", data: 1, valid: true },
            { description: "non-number (no type constraint) => valid", data: "foo", valid: true }
        ]);
    });
});

describe("Compliance: contains / minContains / maxContains", () => {

    describe("ajv#502 - contains requires at least one matching item", () => {
        const schema = {
            definitions: { def: { type: "string" } },
            type: "object",
            properties: {
                str: { $ref: "#/definitions/def" },
                arr: { type: "array", contains: { type: "number" } }
            }
        };
        runSchemaTests(schema, [
            { description: "empty array fails contains => invalid", data: { str: "", arr: [] }, valid: false },
            { description: "array with number => valid", data: { str: "", arr: [1] }, valid: true },
            { description: "array without number => invalid", data: { str: "", arr: ["a"] }, valid: false }
        ]);
    });

    describe("ajv#1819 - minContains:0 allows arrays with no matching items", () => {
        const schema = {
            type: "array",
            minContains: 0,
            maxContains: 1,
            contains: { type: "number" }
        };
        runSchemaTests(schema, [
            { description: "no numbers (minContains:0) => valid", data: ["apple"], valid: true },
            { description: "one number => valid", data: ["apple", 1], valid: true },
            { description: "two numbers (maxContains:1) => invalid", data: ["apple", 1, 2], valid: false }
        ], "draft2020-12");
    });
});

describe.skip("Compliance: format validation", () => {

    describe("ajv#1193 - date-time timezone per RFC 3339", () => {
        const schema = { type: "string", format: "date-time" };
        runSchemaTests(schema, [
            { description: "timezone without colon => invalid", data: "2020-04-21T18:00:00+0200", valid: false },
            { description: "timezone without minutes => invalid", data: "2020-04-21T18:00:00+02", valid: false },
            { description: "timezone with colon => valid", data: "2020-04-21T18:00:00+02:00", valid: true },
            { description: "UTC Z => valid", data: "2020-04-21T18:00:00Z", valid: true }
        ]);
    });

    describe("ajv#1000 - date format rejects invalid calendar dates", () => {
        const schema = {
            type: "array",
            items: { type: "string", format: "date" }
        };
        runSchemaTests(schema, [
            { description: "Feb 29 in non-leap year => invalid", data: ["2018-02-29"], valid: false },
            { description: "Feb 35 => invalid", data: ["2018-02-35"], valid: false },
            { description: "Month 15 => invalid", data: ["2018-15-01"], valid: false },
            { description: "Valid date => valid", data: ["2018-06-15"], valid: true },
            { description: "Feb 29 in leap year => valid", data: ["2020-02-29"], valid: true }
        ]);
    });

    describe("ajv#953 - date format rejects impossible dates", () => {
        const schema = {
            properties: {
                "birth-date": { type: "string", format: "date" }
            }
        };
        runSchemaTests(schema, [
            { description: "impossible date 2019-13-39 => invalid", data: { "birth-date": "2019-13-39" }, valid: false },
            { description: "valid date => valid", data: { "birth-date": "2019-06-15" }, valid: true }
        ]);
    });

    describe("ajv#996 - time format rejects invalid hours", () => {
        const schema = { type: "string", format: "time" };
        runSchemaTests(schema, [
            { description: "25:00:00 => invalid", data: "25:00:00", valid: false },
            { description: "12:30:00Z => valid", data: "12:30:00Z", valid: true },
            { description: "23:59:59Z => valid", data: "23:59:59Z", valid: true },
            { description: "00:00:00Z => valid", data: "00:00:00Z", valid: true }
        ]);
    });

    describe("ajv#594 - date-time should support leap seconds", () => {
        const schema = { type: "string", format: "date-time" };
        runSchemaTests(schema, [
            { description: "leap second => valid", data: "2016-12-31T23:59:60Z", valid: true },
            { description: "normal datetime => valid", data: "2016-12-31T23:59:59Z", valid: true },
            { description: "second 61 => invalid", data: "2016-12-31T23:59:61Z", valid: false }
        ]);
    });

    describe("ajv#2572 - date-time with trailing characters", () => {
        const schema = { type: "string", format: "date-time" };
        runSchemaTests(schema, [
            { description: "valid date-time => valid", data: "2024-06-01T12:34:56Z", valid: true },
            { description: "trailing chars after Z => invalid", data: "2024-06-01T12:34:56ZAS", valid: false }
        ]);
    });

    describe("ajv#2594 - time format in oneOf with null", () => {
        const schema = {
            type: "object",
            properties: {
                time: {
                    oneOf: [
                        { type: "string", format: "time" },
                        { type: "null" }
                    ]
                }
            },
            additionalProperties: false
        };
        runSchemaTests(schema, [
            { description: "valid time string => valid", data: { time: "01:00:00" }, valid: true },
            { description: "null => valid", data: { time: null }, valid: true },
            { description: "invalid time string => invalid", data: { time: "not-a-time" }, valid: false },
            { description: "missing time => valid", data: {}, valid: true }
        ]);
    });

    describe("ajv#59 - URN is a valid URI", () => {
        const schema = {
            properties: { id: { type: "string", format: "uri" } }
        };
        runSchemaTests(schema, [
            { description: "URN => valid", data: { id: "urn:isbn:978-3-531-18621-4" }, valid: true },
            { description: "HTTP URL => valid", data: { id: "http://example.com" }, valid: true }
        ]);
    });

    describe("ajv#312 - hostname with numeric subdomain label", () => {
        const schema = { type: "string", format: "hostname" };
        runSchemaTests(schema, [
            { description: "numeric subdomain label => valid", data: "lead-routing-qa.lvuucj.0001.use1.cache.amazonaws.com", valid: true },
            { description: "simple hostname => valid", data: "example.com", valid: true }
        ]);
    });
});

describe("Compliance: $ref", () => {

    describe("ajv#2197 - items with anyOf and $ref semantics", () => {
        const schema = {
            type: "object",
            properties: {
                names: {
                    type: "array",
                    items: {
                        anyOf: [
                            { type: "string" },
                            { type: "number" }
                        ]
                    }
                }
            }
        };
        runSchemaTests(schema, [
            { description: "array of strings => valid", data: { names: ["hello", "world"] }, valid: true },
            { description: "array of numbers => valid", data: { names: [1, 2, 3] }, valid: true },
            { description: "mixed string and number => valid", data: { names: ["hello", 1] }, valid: true },
            { description: "array with boolean => invalid", data: { names: [true] }, valid: false }
        ]);
    });
});

describe("Compliance: additionalProperties interaction", () => {

    describe("ajv#789 - additionalProperties does NOT consider if/then/else properties", () => {
        const schema = {
            type: "object",
            properties: {
                recurrentType: { enum: ["oneTime", "daily"] }
            },
            if: { properties: { recurrentType: { const: "oneTime" } } },
            then: {
                properties: { onceAt: { type: "string" } },
                required: ["onceAt"]
            },
            else: {
                properties: { recursEvery: { type: "integer", minimum: 1 } },
                required: ["recursEvery"]
            },
            additionalProperties: false
        };
        runSchemaTests(schema, [
            { description: "onceAt is additional (only in then, not properties) => invalid", data: { recurrentType: "oneTime", onceAt: "2016-05-18T16:00:00Z" }, valid: false },
            { description: "only recurrentType with then requiring onceAt => invalid", data: { recurrentType: "oneTime" }, valid: false }
        ]);
    });
});

describe("Compliance: unevaluatedProperties (draft 2019-09+)", () => {

    describe("ajv#1625 - patternProperties with true schema counts as evaluated", () => {
        const schema = {
            type: "object",
            patternProperties: { "^x-": true },
            unevaluatedProperties: false
        };
        runSchemaTests(schema, [
            { description: "property matching pattern => valid", data: { "x-internal": false }, valid: true },
            { description: "property not matching pattern => invalid", data: { foo: "bar" }, valid: false }
        ], "draft2020-12");
    });

    describe("ajv#2559 - unevaluatedProperties with oneOf and $ref", () => {
        const schema = {
            type: "object",
            $ref: "#/$defs/parent",
            oneOf: [
                {
                    type: "object",
                    required: ["propFrom1stOneOf"],
                    properties: { propFrom1stOneOf: true }
                },
                {
                    type: "object",
                    required: ["propFrom2ndOneOf"],
                    properties: { propFrom2ndOneOf: true }
                }
            ],
            unevaluatedProperties: false,
            $defs: {
                parent: {
                    type: "object",
                    properties: { propFromParent: true }
                }
            }
        };
        runSchemaTests(schema, [
            { description: "propFromParent + 1st oneOf => valid", data: { propFromParent: true, propFrom1stOneOf: true }, valid: true },
            { description: "propFromParent + 2nd oneOf => valid", data: { propFromParent: true, propFrom2ndOneOf: true }, valid: true },
            { description: "extra unknown property => invalid", data: { propFromParent: true, propFrom1stOneOf: true, extra: 1 }, valid: false }
        ], "draft2020-12");
    });

    describe("ajv#2483 - unevaluatedProperties with dependentSchemas", () => {
        const schema = {
            type: "object",
            properties: {
                name: { type: "string" },
                link: { type: "boolean" }
            },
            required: ["name"],
            unevaluatedProperties: false,
            dependentSchemas: {
                link: {
                    if: { properties: { link: { const: true } } },
                    then: {
                        properties: { originalId: { type: "string" } },
                        required: ["originalId"]
                    }
                }
            }
        };
        runSchemaTests(schema, [
            { description: "only name => valid", data: { name: "test" }, valid: true },
            { description: "link=true but missing originalId => invalid", data: { name: "test", link: true }, valid: false },
            { description: "link=true with originalId => valid", data: { name: "test", link: true, originalId: "abc" }, valid: true },
            { description: "link=false => valid", data: { name: "test", link: false }, valid: true }
        ], "draft2020-12");
    });

    describe("ajv#1892 - oneOf with unevaluatedProperties:false", () => {
        const schema = {
            type: "object",
            properties: {
                type: { enum: ["collection", "library"] }
            },
            required: ["translatorID"],
            unevaluatedProperties: false,
            oneOf: [
                {
                    properties: {
                        translatorID: { const: "f895aa0d-f28e-47fe-b247-2ea77c6ed583" },
                        asciiBibLaTeX: { type: "boolean" }
                    }
                },
                {
                    properties: {
                        translatorID: { const: "0f238e69-043e-4882-93bf-342de007de19" }
                    }
                }
            ]
        };
        runSchemaTests(schema, [
            { description: "first oneOf with asciiBibLaTeX => valid", data: { type: "library", translatorID: "f895aa0d-f28e-47fe-b247-2ea77c6ed583", asciiBibLaTeX: false }, valid: true },
            { description: "second oneOf => valid", data: { type: "library", translatorID: "0f238e69-043e-4882-93bf-342de007de19" }, valid: true },
            { description: "first oneOf without optional prop => valid", data: { type: "collection", translatorID: "f895aa0d-f28e-47fe-b247-2ea77c6ed583" }, valid: true }
        ], "draft2020-12");
    });
});

describe("Compliance: oneOf with if/then/else:false", () => {

    describe("ajv#1237 - oneOf with if/then/else:false for discriminated records", () => {
        const schema = {
            type: "object",
            required: ["Records"],
            properties: {
                Records: {
                    type: "object",
                    additionalProperties: {
                        type: "object",
                        oneOf: [
                            {
                                if: {
                                    properties: {
                                        Recipients: { type: "array", items: { type: "string" }, minItems: 1 }
                                    },
                                    required: ["Recipients"]
                                },
                                then: { required: ["DetectionMethod"] },
                                else: false
                            },
                            {
                                if: {
                                    properties: { Data: { type: "string" } },
                                    required: ["Data"]
                                },
                                then: { required: ["ObjectId"] },
                                else: false
                            },
                            {
                                if: {
                                    properties: { TimeOfClick: { type: "string" } },
                                    required: ["TimeOfClick"]
                                },
                                then: { required: ["UserId"] },
                                else: false
                            }
                        ]
                    }
                }
            }
        };
        runSchemaTests(schema, [
            { description: "Recipients with DetectionMethod => first branch", data: { Records: { "1": { Recipients: ["user@test.com"], DetectionMethod: "Method 1" } } }, valid: true },
            { description: "Data with ObjectId => second branch", data: { Records: { "2": { Data: "{somedata: data}", ObjectId: "user@org.com" } } }, valid: true },
            { description: "TimeOfClick with UserId => third branch", data: { Records: { "3": { TimeOfClick: "2020-06-01T21:15:10", UserId: "user@org.com" } } }, valid: true },
            { description: "empty Recipients fails if (minItems:1), else:false => fails", data: { Records: { "1": { Recipients: [], DetectionMethod: "Method 1" } } }, valid: false }
        ]);
    });
});

describe("Compliance: recursive $ref", () => {

    describe("ajv#1940 - recursive $ref with $id resolves to correct scope", () => {
        const schema = {
            $schema: "http://json-schema.org/draft-07/schema",
            $id: "http://test.com/schema/root",
            type: "object",
            required: ["asyncapi"],
            properties: {
                asyncapi: { type: "string" },
                ref: { $ref: "http://test.com/schema/test" }
            },
            definitions: {
                "http://test.com/schema/test": {
                    $schema: "http://json-schema.org/draft-07/schema",
                    $id: "http://test.com/schema/test",
                    additionalProperties: false,
                    properties: {
                        testprop: { $ref: "#" }
                    }
                }
            }
        };
        runSchemaTests(schema, [
            { description: "recursive ref nested valid", data: { asyncapi: "test", ref: { testprop: { testprop: {} } } }, valid: true },
            { description: "simple valid without ref", data: { asyncapi: "test" }, valid: true },
            { description: "ref with additional property rejected", data: { asyncapi: "test", ref: { testprop: {}, bad: 1 } }, valid: false },
            { description: "non-object value passes (test schema has no type constraint)", data: { asyncapi: "test", ref: { testprop: "test" } }, valid: true }
        ]);
    });
});
