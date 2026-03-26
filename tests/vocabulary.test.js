/**
 * Vocabulary stripping tests.
 *
 * JSON Schema draft2020-12 (and draft2019-09) split their keyword set into
 * named vocabularies. A custom metaschema can declare a subset of those
 * vocabularies via `$vocabulary`. Any vocabulary NOT declared is stripped
 * from schemas that use the custom metaschema — its keywords are deleted
 * before compilation, so they have no effect on validation.
 *
 * These tests exercise the stripping logic in walkSchema() for all of the
 * vocabularies we track (applicator, validation, unevaluated, meta-data,
 * content, format) as well as the correct nested-resource scoping rule:
 * a sub-schema that declares its own `$schema` restarts the strip-set from
 * scratch and is independently governed by *its* metaschema's vocabulary.
 */
import { describe, test, expect } from 'bun:test';
import { CompoundSchema } from '../src/internal/schema.js';
import { compile } from '../src/internal/ast.js';
import { catalog } from '../src/internal/catalog.js';

const cat = catalog();
const { validate } = cat;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compiles `schema` (which references `metaschema.$id` via its `$schema` key)
 * after registering the metaschema so vocabulary stripping can look it up.
 * Returns the compiled root schema pointer ready for validate().
 *
 * @param {object} metaschema
 * @param {object} schema
 * @returns {number}
 */
function compileWithMeta(metaschema, schema) {
    const compound = new CompoundSchema('draft2020-12');
    compound.add(structuredClone(metaschema), metaschema.$id);
    const ref = compound.add(structuredClone(schema));
    const ast = compound.bundle(ref);
    const compiled = compile(cat, ast);
    return compiled[0].schema;
}

/**
 * Same as compileWithMeta but for draft2019-09.
 *
 * @param {object} metaschema
 * @param {object} schema
 * @returns {number}
 */
function compileWithMeta2019(metaschema, schema) {
    const compound = new CompoundSchema('draft2019-09');
    compound.add(structuredClone(metaschema), metaschema.$id);
    const ref = compound.add(structuredClone(schema));
    const ast = compound.bundle(ref);
    const compiled = compile(cat, ast);
    return compiled[0].schema;
}

// ─── Metaschema fixtures ───────────────────────────────────────────────────────

// 2020-12 metaschemas

/** Applicator + Core only — no validation keywords. */
const META_2020_NO_VALIDATION = {
    $id: 'urn:test:vocab:2020:no-validation',
    $vocabulary: {
        'https://json-schema.org/draft/2020-12/vocab/core': true,
        'https://json-schema.org/draft/2020-12/vocab/applicator': true,
    },
};

/** Validation + Core only — no applicator keywords. */
const META_2020_NO_APPLICATOR = {
    $id: 'urn:test:vocab:2020:no-applicator',
    $vocabulary: {
        'https://json-schema.org/draft/2020-12/vocab/core': true,
        'https://json-schema.org/draft/2020-12/vocab/validation': true,
    },
};

/** Applicator + Validation + Core only — no unevaluated keywords. */
const META_2020_NO_UNEVALUATED = {
    $id: 'urn:test:vocab:2020:no-unevaluated',
    $vocabulary: {
        'https://json-schema.org/draft/2020-12/vocab/core': true,
        'https://json-schema.org/draft/2020-12/vocab/applicator': true,
        'https://json-schema.org/draft/2020-12/vocab/validation': true,
    },
};

/** Core only — almost all keywords stripped. */
const META_2020_CORE_ONLY = {
    $id: 'urn:test:vocab:2020:core-only',
    $vocabulary: {
        'https://json-schema.org/draft/2020-12/vocab/core': true,
    },
};

// 2019-09 metaschemas

/** Applicator + Core only (2019-09 vocab URIs) — no validation keywords. */
const META_2019_NO_VALIDATION = {
    $id: 'urn:test:vocab:2019:no-validation',
    $vocabulary: {
        'https://json-schema.org/draft/2019-09/vocab/core': true,
        'https://json-schema.org/draft/2019-09/vocab/applicator': true,
    },
};

/** Validation + Core only (2019-09 vocab URIs) — no applicator keywords. */
const META_2019_NO_APPLICATOR = {
    $id: 'urn:test:vocab:2019:no-applicator',
    $vocabulary: {
        'https://json-schema.org/draft/2019-09/vocab/core': true,
        'https://json-schema.org/draft/2019-09/vocab/validation': true,
    },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('vocabulary.test.js', () => {

    // ── 1. Validation vocabulary absent (draft2020-12) ──────────────────────
    describe('draft2020-12: validation vocabulary absent', () => {
        test('minimum is stripped — values below the threshold are valid', () => {
            const root = compileWithMeta(META_2020_NO_VALIDATION, {
                $schema: META_2020_NO_VALIDATION.$id,
                minimum: 10,
            });
            // minimum stripped → no constraint → any number passes
            expect(validate(5, root)).toBe(true);
            expect(validate(0, root)).toBe(true);
            expect(validate(-100, root)).toBe(true);
        });

        test('type is stripped — any data type is valid', () => {
            const root = compileWithMeta(META_2020_NO_VALIDATION, {
                $schema: META_2020_NO_VALIDATION.$id,
                type: 'number',
            });
            // type stripped → accepts anything
            expect(validate('hello', root)).toBe(true);
            expect(validate(42, root)).toBe(true);
            expect(validate(null, root)).toBe(true);
            expect(validate({ a: 1 }, root)).toBe(true);
        });

        test('enum is stripped — values outside the enum are valid', () => {
            const root = compileWithMeta(META_2020_NO_VALIDATION, {
                $schema: META_2020_NO_VALIDATION.$id,
                enum: [1, 2, 3],
            });
            // enum stripped → no constraint
            expect(validate(99, root)).toBe(true);
            expect(validate('not in enum', root)).toBe(true);
        });

        test('required is stripped — missing required properties are valid', () => {
            const root = compileWithMeta(META_2020_NO_VALIDATION, {
                $schema: META_2020_NO_VALIDATION.$id,
                properties: { foo: { minimum: 5 } },
                required: ['foo'],
            });
            // required stripped; properties still present (applicator present) but
            // the property schema { minimum: 5 } also gets minimum stripped
            expect(validate({}, root)).toBe(true);           // missing foo — valid
            expect(validate({ foo: 1 }, root)).toBe(true);   // foo: 1 < 5, but minimum stripped
            expect(validate({ foo: 100 }, root)).toBe(true); // foo: 100 — valid
        });

        test('applicator keywords still work — properties structure is enforced', () => {
            const root = compileWithMeta(META_2020_NO_VALIDATION, {
                $schema: META_2020_NO_VALIDATION.$id,
                properties: {
                    badProperty: false,  // false schema — always invalid if present
                },
            });
            // applicator present → properties compiled → badProperty: false enforced
            expect(validate({ badProperty: 'x' }, root)).toBe(false);
            expect(validate({}, root)).toBe(true);
            expect(validate({ other: 1 }, root)).toBe(true);
        });

        test('maxLength is stripped — strings of any length are valid', () => {
            const root = compileWithMeta(META_2020_NO_VALIDATION, {
                $schema: META_2020_NO_VALIDATION.$id,
                maxLength: 3,
            });
            expect(validate('toolongstring', root)).toBe(true);
            expect(validate('ok', root)).toBe(true);
        });

        test('minimum stripping also applies to nested property schemas', () => {
            const root = compileWithMeta(META_2020_NO_VALIDATION, {
                $schema: META_2020_NO_VALIDATION.$id,
                properties: {
                    count: { minimum: 0 },
                    score: { maximum: 100, minimum: 0 },
                },
            });
            // nested schemas inside properties also get minimum/maximum stripped
            expect(validate({ count: -5 }, root)).toBe(true);
            expect(validate({ score: 999 }, root)).toBe(true);
        });
    });

    // ── 2. Applicator vocabulary absent (draft2020-12) ──────────────────────
    describe('draft2020-12: applicator vocabulary absent', () => {
        test('properties is stripped — any object structure is valid', () => {
            const root = compileWithMeta(META_2020_NO_APPLICATOR, {
                $schema: META_2020_NO_APPLICATOR.$id,
                properties: {
                    badProperty: false,   // would reject badProperty if applied
                },
                type: 'object',
            });
            // properties stripped → structure unconstrained, but type still applies
            expect(validate({ badProperty: 'x' }, root)).toBe(true);
            expect(validate({}, root)).toBe(true);
            expect(validate('string', root)).toBe(false);  // type: object still enforced
        });

        test('allOf is stripped — intersection constraints are ignored', () => {
            const root = compileWithMeta(META_2020_NO_APPLICATOR, {
                $schema: META_2020_NO_APPLICATOR.$id,
                type: 'number',
                allOf: [
                    { minimum: 100 },   // would require >= 100 if applied
                ],
            });
            // allOf stripped → only type: number enforced
            expect(validate(5, root)).toBe(true);    // below allOf.minimum — but allOf stripped
            expect(validate(200, root)).toBe(true);
            expect(validate('x', root)).toBe(false); // type: number still enforced
        });

        test('anyOf is stripped — union constraints are ignored', () => {
            const root = compileWithMeta(META_2020_NO_APPLICATOR, {
                $schema: META_2020_NO_APPLICATOR.$id,
                anyOf: [
                    { type: 'string' },
                    { type: 'number', minimum: 10 },
                ],
            });
            // anyOf stripped → no constraint → anything is valid
            expect(validate(true, root)).toBe(true);
            expect(validate(null, root)).toBe(true);
            expect(validate('hello', root)).toBe(true);
        });

        test('not is stripped — negation constraints are ignored', () => {
            const root = compileWithMeta(META_2020_NO_APPLICATOR, {
                $schema: META_2020_NO_APPLICATOR.$id,
                not: { type: 'string' },  // would reject strings if applied
            });
            // not stripped → no constraint
            expect(validate('hello', root)).toBe(true);
            expect(validate(42, root)).toBe(true);
        });

        test('validation keywords still work — type and minimum enforced', () => {
            const root = compileWithMeta(META_2020_NO_APPLICATOR, {
                $schema: META_2020_NO_APPLICATOR.$id,
                type: 'number',
                minimum: 5,
            });
            expect(validate(10, root)).toBe(true);
            expect(validate(3, root)).toBe(false);   // minimum still enforced
            expect(validate('x', root)).toBe(false); // type still enforced
        });
    });

    // ── 3. Unevaluated vocabulary absent (draft2020-12) ─────────────────────
    describe('draft2020-12: unevaluated vocabulary absent', () => {
        test('unevaluatedProperties is stripped — extra properties are valid', () => {
            const root = compileWithMeta(META_2020_NO_UNEVALUATED, {
                $schema: META_2020_NO_UNEVALUATED.$id,
                properties: { foo: true },
                unevaluatedProperties: false,
            });
            // unevaluatedProperties stripped → extra properties allowed
            expect(validate({ foo: 1, extra: 'x' }, root)).toBe(true);
            expect(validate({ foo: 1 }, root)).toBe(true);
        });

        test('unevaluatedItems is stripped — extra array items are valid', () => {
            const root = compileWithMeta(META_2020_NO_UNEVALUATED, {
                $schema: META_2020_NO_UNEVALUATED.$id,
                prefixItems: [{ type: 'number' }],
                unevaluatedItems: false,
            });
            // unevaluatedItems stripped → extra items beyond prefixItems allowed
            expect(validate([1, 'extra', true], root)).toBe(true);
            expect(validate([1], root)).toBe(true);
        });

        test('applicator and validation still work correctly', () => {
            const root = compileWithMeta(META_2020_NO_UNEVALUATED, {
                $schema: META_2020_NO_UNEVALUATED.$id,
                properties: { foo: { type: 'number', minimum: 0 } },
                required: ['foo'],
            });
            expect(validate({ foo: 5 }, root)).toBe(true);
            expect(validate({ foo: -1 }, root)).toBe(false); // minimum: 0 enforced
            expect(validate({}, root)).toBe(false);           // required: ['foo'] enforced
        });
    });

    // ── 4. Core-only metaschema (draft2020-12) ───────────────────────────────
    describe('draft2020-12: core-only metaschema', () => {
        test('type, minimum and properties are all stripped', () => {
            const root = compileWithMeta(META_2020_CORE_ONLY, {
                $schema: META_2020_CORE_ONLY.$id,
                type: 'string',
                minimum: 0,
                properties: { foo: false },
            });
            // all vocabulary keywords stripped → empty schema → accepts anything
            expect(validate('hello', root)).toBe(true);
            expect(validate(42, root)).toBe(true);
            expect(validate({ foo: 'x' }, root)).toBe(true);  // properties stripped
            expect(validate(null, root)).toBe(true);
        });

        test('$ref still resolves (core keywords intact)', () => {
            const compound = new CompoundSchema('draft2020-12');
            const meta = META_2020_CORE_ONLY;
            compound.add(structuredClone(meta), meta.$id);
            const ref = compound.add(structuredClone({
                $id: 'urn:test:core-only-ref-root',
                $schema: meta.$id,
                $defs: {
                    // This inner schema has NO $schema, so it inherits stripKeys.
                    // But $defs itself is a core keyword — it's never stripped.
                    myDef: { minimum: 5, type: 'number' },
                },
                $ref: '#/$defs/myDef',
            }));
            const ast = compound.bundle(ref);
            const compiled = compile(cat, ast);
            const root = compiled[0].schema;
            // $ref resolves correctly (core); minimum/type stripped from myDef
            expect(validate(1, root)).toBe(true);   // minimum stripped in myDef
            expect(validate('x', root)).toBe(true); // type stripped in myDef
        });
    });

    // ── 5. Nested resource with its own $schema (override) ───────────────────
    describe('nested schema resource overrides outer strip-set', () => {
        test('inner resource with full vocab restores validation keywords', () => {
            // Outer schema uses core-only metaschema → strips validation.
            // Inner schema resource declares a full metaschema → validation works.
            const compound = new CompoundSchema('draft2020-12');
            compound.add(structuredClone(META_2020_CORE_ONLY), META_2020_CORE_ONLY.$id);

            // Register a minimal "full validation" metaschema so the inner schema
            // can point to it and get its validation keywords preserved.
            const metaFull = {
                $id: 'urn:test:vocab:full',
                $vocabulary: {
                    'https://json-schema.org/draft/2020-12/vocab/core': true,
                    'https://json-schema.org/draft/2020-12/vocab/applicator': true,
                    'https://json-schema.org/draft/2020-12/vocab/validation': true,
                    'https://json-schema.org/draft/2020-12/vocab/unevaluated': true,
                    'https://json-schema.org/draft/2020-12/vocab/meta-data': false,
                    'https://json-schema.org/draft/2020-12/vocab/format-annotation': false,
                    'https://json-schema.org/draft/2020-12/vocab/content': false,
                },
            };
            compound.add(structuredClone(metaFull), metaFull.$id);

            const ref = compound.add(structuredClone({
                $id: 'urn:test:outer',
                $schema: META_2020_CORE_ONLY.$id,
                minimum: 100,       // stripped in outer resource
                $defs: {
                    inner: {
                        $id: 'urn:test:inner',
                        $schema: metaFull.$id,  // new resource: full vocab
                        minimum: 5,             // NOT stripped — inner has full vocab
                    },
                },
                $ref: 'urn:test:inner',
            }));

            const ast = compound.bundle(ref);
            const compiled = compile(cat, ast);
            const root = compiled[0].schema;

            // outer minimum: 100 stripped, resolves to inner via $ref
            // inner minimum: 5 kept → values < 5 invalid
            expect(validate(3, root)).toBe(false);  // inner minimum: 5 applies
            expect(validate(6, root)).toBe(true);
            expect(validate(150, root)).toBe(true);
        });

        test('inner resource with same limited metaschema also strips its keywords', () => {
            const compound = new CompoundSchema('draft2020-12');
            compound.add(structuredClone(META_2020_NO_VALIDATION), META_2020_NO_VALIDATION.$id);

            const ref = compound.add(structuredClone({
                $id: 'urn:test:outer2',
                $schema: META_2020_NO_VALIDATION.$id,
                minimum: 50,   // stripped
                $defs: {
                    inner: {
                        $id: 'urn:test:inner2',
                        $schema: META_2020_NO_VALIDATION.$id,  // same restricted meta
                        minimum: 10,  // also stripped in inner
                    },
                },
                $ref: 'urn:test:inner2',
            }));

            const ast = compound.bundle(ref);
            const compiled = compile(cat, ast);
            const root = compiled[0].schema;

            // both minimums stripped → any number valid
            expect(validate(1, root)).toBe(true);
            expect(validate(-99, root)).toBe(true);
        });
    });

    // ── 6. Draft 2019-09 vocabulary stripping ────────────────────────────────
    describe('draft2019-09: validation vocabulary absent', () => {
        test('minimum is stripped — values below threshold are valid', () => {
            const root = compileWithMeta2019(META_2019_NO_VALIDATION, {
                $schema: META_2019_NO_VALIDATION.$id,
                minimum: 10,
            });
            expect(validate(1, root)).toBe(true);
            expect(validate(0, root)).toBe(true);
        });

        test('type is stripped — any data type is valid', () => {
            const root = compileWithMeta2019(META_2019_NO_VALIDATION, {
                $schema: META_2019_NO_VALIDATION.$id,
                type: 'integer',
            });
            expect(validate('hello', root)).toBe(true);
            expect(validate(3.14, root)).toBe(true);
        });

        test('applicator still works — properties structure enforced', () => {
            const root = compileWithMeta2019(META_2019_NO_VALIDATION, {
                $schema: META_2019_NO_VALIDATION.$id,
                properties: {
                    forbidden: false,
                },
            });
            expect(validate({ forbidden: 1 }, root)).toBe(false);
            expect(validate({}, root)).toBe(true);
            expect(validate({ other: 'x' }, root)).toBe(true);
        });

        test('required is stripped — missing required properties are valid', () => {
            const root = compileWithMeta2019(META_2019_NO_VALIDATION, {
                $schema: META_2019_NO_VALIDATION.$id,
                properties: { name: true },
                required: ['name'],
            });
            // required stripped → {} is valid
            expect(validate({}, root)).toBe(true);
        });
    });

    describe('draft2019-09: applicator vocabulary absent', () => {
        test('properties and allOf are stripped, type still enforced', () => {
            const root = compileWithMeta2019(META_2019_NO_APPLICATOR, {
                $schema: META_2019_NO_APPLICATOR.$id,
                type: 'number',
                properties: { bad: false },
                allOf: [{ minimum: 100 }],
            });
            // properties and allOf stripped; type: number kept
            expect(validate(5, root)).toBe(true);    // allOf stripped
            expect(validate({ bad: 1 }, root)).toBe(false); // type: number rejects object
            expect(validate('x', root)).toBe(false); // type enforced
        });

        test('2019-09 applicator URI is correctly recognized (no cross-draft leakage)', () => {
            // This test verifies that the vocab group check uses the right 2019-09 URIs.
            // META_2019_NO_APPLICATOR declares 2019-09/vocab/core and 2019-09/vocab/validation.
            // The applicator group has uris [..., '2019-09/vocab/applicator'], which is NOT
            // in the vocab map → applicator keywords get stripped correctly.
            const root = compileWithMeta2019(META_2019_NO_APPLICATOR, {
                $schema: META_2019_NO_APPLICATOR.$id,
                minimum: 3,
                not: { type: 'boolean' },  // applicator — stripped
            });
            expect(validate(5, root)).toBe(true);
            expect(validate(1, root)).toBe(false);   // minimum: 3 enforced
            expect(validate(true, root)).toBe(true); // not stripped → booleans allowed
        });
    });

    // ── 7. Metaschema not in registry — assume full vocabulary ───────────────
    describe('unknown $schema — assume full vocabulary (no stripping)', () => {
        test('unknown $schema URI is treated as full vocabulary', () => {
            // The $schema URI is not registered in uriRegistry → no stripping
            const compound = new CompoundSchema('draft2020-12');
            const ref = compound.add(structuredClone({
                $schema: 'https://example.com/unknown-meta',
                minimum: 5,
                type: 'number',
            }));
            const ast = compound.bundle(ref);
            const compiled = compile(cat, ast);
            const root = compiled[0].schema;
            // minimum and type are NOT stripped → enforced normally
            expect(validate(10, root)).toBe(true);
            expect(validate(2, root)).toBe(false);   // minimum: 5 enforced
            expect(validate('x', root)).toBe(false); // type enforced
        });
    });
});
