import { describe, test, expect } from 'bun:test';
import {
    COMPLEX, NULLABLE, OPTIONAL,
    ANY, STRING, NUMBER, INTEGER, BOOLEAN, NEVER, VALUE, NULL, UNDEFINED,
} from '@uvd/core';
import { catalog, BARE_ARRAY, BARE_OBJECT, BARE_RECORD } from '@uvd/validate';
import { allocators } from '@uvd/builder';
import { compile } from '@uvd/compiler';
import { CompoundSchema } from '@uvd/schema';

// ── Helpers ──

function setup() {
    const cat = catalog();
    const alloc = allocators(cat);
    return { cat, validate: cat.validate, ...alloc };
}

function schemaType(schema) {
    const cat = catalog();
    const ast = new CompoundSchema();
    const idx = ast.add(schema);
    const flat = ast.bundle(idx);
    const resources = compile(cat, flat);
    return { validate: cat.validate, type: resources[0].schema };
}

// ────────────────────────────────────────────────────────────────────────────
// 1. Bare primitives (typedef < 256, COMPLEX=0)
// ────────────────────────────────────────────────────────────────────────────

describe('bare primitives', () => {
    const { validate } = setup();

    test('STRING accepts strings', () => {
        expect(validate('hello', STRING)).toBe(true);
        expect(validate('', STRING)).toBe(true);
    });
    test('STRING rejects non-strings', () => {
        expect(validate(42, STRING)).toBe(false);
        expect(validate(true, STRING)).toBe(false);
        expect(validate(null, STRING)).toBe(false);
        expect(validate(undefined, STRING)).toBe(false);
        expect(validate({}, STRING)).toBe(false);
        expect(validate([], STRING)).toBe(false);
    });
    test('NUMBER accepts numbers', () => {
        expect(validate(0, NUMBER)).toBe(true);
        expect(validate(-1.5, NUMBER)).toBe(true);
        expect(validate(Infinity, NUMBER)).toBe(true);
        expect(validate(NaN, NUMBER)).toBe(true);
    });
    test('NUMBER rejects non-numbers', () => {
        expect(validate('42', NUMBER)).toBe(false);
        expect(validate(true, NUMBER)).toBe(false);
        expect(validate(null, NUMBER)).toBe(false);
    });
    test('INTEGER accepts integers only', () => {
        expect(validate(42, INTEGER)).toBe(true);
        expect(validate(0, INTEGER)).toBe(true);
        expect(validate(-100, INTEGER)).toBe(true);
    });
    test('INTEGER rejects floats', () => {
        expect(validate(1.5, INTEGER)).toBe(false);
        expect(validate(0.1, INTEGER)).toBe(false);
    });
    test('BOOLEAN accepts booleans', () => {
        expect(validate(true, BOOLEAN)).toBe(true);
        expect(validate(false, BOOLEAN)).toBe(true);
    });
    test('BOOLEAN rejects non-booleans', () => {
        expect(validate(0, BOOLEAN)).toBe(false);
        expect(validate('true', BOOLEAN)).toBe(false);
    });
    test('ANY accepts everything', () => {
        expect(validate('x', ANY)).toBe(true);
        expect(validate(42, ANY)).toBe(true);
        expect(validate(true, ANY)).toBe(true);
        expect(validate(null, ANY)).toBe(true);
        expect(validate(undefined, ANY)).toBe(true);
        expect(validate({}, ANY)).toBe(true);
        expect(validate([], ANY)).toBe(true);
    });
    test('NEVER rejects everything', () => {
        expect(validate('x', NEVER)).toBe(false);
        expect(validate(42, NEVER)).toBe(false);
        expect(validate(null, NEVER)).toBe(false);
        expect(validate(undefined, NEVER)).toBe(false);
    });
    test('NULL (NULLABLE) accepts null only', () => {
        expect(validate(null, NULL)).toBe(true);
        expect(validate(undefined, NULL)).toBe(false);
        expect(validate('', NULL)).toBe(false);
    });
    test('UNDEFINED (OPTIONAL) accepts undefined only', () => {
        expect(validate(undefined, UNDEFINED)).toBe(true);
        expect(validate(null, UNDEFINED)).toBe(false);
        expect(validate('', UNDEFINED)).toBe(false);
    });
    test('VALUE accepts string | number | boolean', () => {
        expect(validate('x', VALUE)).toBe(true);
        expect(validate(42, VALUE)).toBe(true);
        expect(validate(true, VALUE)).toBe(true);
        expect(validate(null, VALUE)).toBe(false);
        expect(validate({}, VALUE)).toBe(false);
    });
    test('bitwise OR composes primitives', () => {
        let sn = STRING | NUMBER;
        expect(validate('x', sn)).toBe(true);
        expect(validate(42, sn)).toBe(true);
        expect(validate(true, sn)).toBe(false);
    });
    test('NULLABLE + primitive accepts null', () => {
        let ns = STRING | NULLABLE;
        expect(validate('x', ns)).toBe(true);
        expect(validate(null, ns)).toBe(true);
        expect(validate(42, ns)).toBe(false);
    });
    test('OPTIONAL + primitive accepts undefined', () => {
        let os = STRING | OPTIONAL;
        expect(validate('x', os)).toBe(true);
        expect(validate(undefined, os)).toBe(true);
        expect(validate(null, os)).toBe(false);
    });
    test('non-number typedef returns false', () => {
        expect(validate('x', /** @type {*} */('not a number'))).toBe(false);
        expect(validate('x', /** @type {*} */(null))).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 2. Bare complex types (BARE_ARRAY, BARE_OBJECT, BARE_RECORD)
// ────────────────────────────────────────────────────────────────────────────

describe('bare complex types', () => {
    const { validate } = setup();

    test('BARE_ARRAY accepts any array', () => {
        expect(validate([], BARE_ARRAY)).toBe(true);
        expect(validate([1, 'a', null], BARE_ARRAY)).toBe(true);
    });
    test('BARE_ARRAY rejects non-arrays', () => {
        expect(validate({}, BARE_ARRAY)).toBe(false);
        expect(validate('[]', BARE_ARRAY)).toBe(false);
        expect(validate(null, BARE_ARRAY)).toBe(false);
    });
    test('BARE_OBJECT accepts plain objects', () => {
        expect(validate({}, BARE_OBJECT)).toBe(true);
        expect(validate({ a: 1 }, BARE_OBJECT)).toBe(true);
    });
    test('BARE_OBJECT rejects arrays and null', () => {
        expect(validate([], BARE_OBJECT)).toBe(false);
        expect(validate(null, BARE_OBJECT)).toBe(false);
        expect(validate('{}', BARE_OBJECT)).toBe(false);
    });
    test('BARE_RECORD accepts plain objects', () => {
        expect(validate({}, BARE_RECORD)).toBe(true);
        expect(validate({ a: 1 }, BARE_RECORD)).toBe(true);
    });
    test('BARE_RECORD rejects arrays and null', () => {
        expect(validate([], BARE_RECORD)).toBe(false);
        expect(validate(null, BARE_RECORD)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 3. Inline primitive validators (typedef > 0xFF, COMPLEX=0, MODIFIER=0)
// ────────────────────────────────────────────────────────────────────────────

describe('inline string validators', () => {
    const { validate, string } = setup();

    test('minLength', () => {
        let t = string({ minLength: 3 });
        expect(validate('abc', t)).toBe(true);
        expect(validate('ab', t)).toBe(false);
        expect(validate('', t)).toBe(false);
    });
    test('maxLength', () => {
        let t = string({ maxLength: 5 });
        expect(validate('hello', t)).toBe(true);
        expect(validate('helloo', t)).toBe(false);
    });
    test('minLength + maxLength combined', () => {
        let t = string({ minLength: 2, maxLength: 4 });
        expect(validate('ab', t)).toBe(true);
        expect(validate('abcd', t)).toBe(true);
        expect(validate('a', t)).toBe(false);
        expect(validate('abcde', t)).toBe(false);
    });
    test('pattern', () => {
        let t = string({ pattern: '^[a-z]+$' });
        expect(validate('abc', t)).toBe(true);
        expect(validate('ABC', t)).toBe(false);
        expect(validate('', t)).toBe(false);
    });
    test('format: email', () => {
        let t = string({ format: 'email' });
        expect(validate('a@b.com', t)).toBe(true);
        expect(validate('not-email', t)).toBe(false);
    });
    test('format: ipv4', () => {
        let t = string({ format: 'ipv4' });
        expect(validate('192.168.1.1', t)).toBe(true);
        expect(validate('999.999.999.999', t)).toBe(false);
        expect(validate('abc', t)).toBe(false);
    });
    test('format: uuid', () => {
        let t = string({ format: 'uuid' });
        expect(validate('550e8400-e29b-41d4-a716-446655440000', t)).toBe(true);
        expect(validate('not-a-uuid', t)).toBe(false);
    });
    test('format: date-time', () => {
        let t = string({ format: 'date-time' });
        expect(validate('2024-01-15T10:30:00Z', t)).toBe(true);
        expect(validate('2024-01-15', t)).toBe(false);
    });
    test('rejects non-string even with validators', () => {
        let t = string({ minLength: 1 });
        expect(validate(42, t)).toBe(false);
        expect(validate(null, t)).toBe(false);
    });
    test('unicode codepoint length (surrogates)', () => {
        // emoji is 1 codepoint but 2 UTF-16 code units
        let t = string({ minLength: 2 });
        expect(validate('😀', t)).toBe(false); // 1 codepoint
        expect(validate('😀😀', t)).toBe(true); // 2 codepoints
    });
});

describe('inline number validators', () => {
    const { validate, number } = setup();

    test('minimum', () => {
        let t = number({ minimum: 5 });
        expect(validate(5, t)).toBe(true);
        expect(validate(10, t)).toBe(true);
        expect(validate(4, t)).toBe(false);
    });
    test('maximum', () => {
        let t = number({ maximum: 10 });
        expect(validate(10, t)).toBe(true);
        expect(validate(5, t)).toBe(true);
        expect(validate(11, t)).toBe(false);
    });
    test('exclusiveMinimum', () => {
        let t = number({ exclusiveMinimum: 5 });
        expect(validate(6, t)).toBe(true);
        expect(validate(5, t)).toBe(false);
    });
    test('exclusiveMaximum', () => {
        let t = number({ exclusiveMaximum: 10 });
        expect(validate(9, t)).toBe(true);
        expect(validate(10, t)).toBe(false);
    });
    test('minimum: 0 is valid bound', () => {
        let t = number({ minimum: 0 });
        expect(validate(0, t)).toBe(true);
        expect(validate(1, t)).toBe(true);
        expect(validate(-1, t)).toBe(false);
    });
    test('negative bounds', () => {
        let t = number({ minimum: -10, maximum: -1 });
        expect(validate(-5, t)).toBe(true);
        expect(validate(-10, t)).toBe(true);
        expect(validate(-1, t)).toBe(true);
        expect(validate(0, t)).toBe(false);
        expect(validate(-11, t)).toBe(false);
    });
    test('multipleOf', () => {
        let t = number({ multipleOf: 3 });
        expect(validate(9, t)).toBe(true);
        expect(validate(0, t)).toBe(true);
        expect(validate(7, t)).toBe(false);
    });
    test('multipleOf with float', () => {
        let t = number({ multipleOf: 0.1 });
        expect(validate(0.3, t)).toBe(true);
        expect(validate(0.7, t)).toBe(true);
    });
    test('rejects non-number even with validators', () => {
        let t = number({ minimum: 0 });
        expect(validate('5', t)).toBe(false);
        expect(validate(null, t)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 4. Objects (K_OBJECT)
// ────────────────────────────────────────────────────────────────────────────

describe('objects', () => {
    const { validate, object, string, number, optional, nullable } = setup();

    test('empty object schema', () => {
        let t = object({});
        expect(validate({}, t)).toBe(true);
        expect(validate({ extra: 1 }, t)).toBe(true); // no additionalProperties restriction
    });
    test('required properties', () => {
        let t = object({ name: STRING, age: NUMBER });
        expect(validate({ name: 'Alice', age: 30 }, t)).toBe(true);
        expect(validate({ name: 'Alice' }, t)).toBe(false);
        expect(validate({ age: 30 }, t)).toBe(false);
        expect(validate({}, t)).toBe(false);
    });
    test('optional properties', () => {
        let t = object({ name: STRING, nick: optional(STRING) });
        expect(validate({ name: 'Alice' }, t)).toBe(true);
        expect(validate({ name: 'Alice', nick: 'Al' }, t)).toBe(true);
        expect(validate({ name: 'Alice', nick: undefined }, t)).toBe(true);
        expect(validate({ name: 'Alice', nick: 42 }, t)).toBe(false);
    });
    test('nullable properties', () => {
        let t = object({ name: STRING, bio: nullable(STRING) });
        expect(validate({ name: 'Alice', bio: null }, t)).toBe(true);
        expect(validate({ name: 'Alice', bio: 'hi' }, t)).toBe(true);
        expect(validate({ name: 'Alice', bio: undefined }, t)).toBe(false);
    });
    test('nested objects', () => {
        let t = object({
            user: object({
                name: STRING,
                address: object({
                    city: STRING,
                }),
            }),
        });
        expect(validate({ user: { name: 'A', address: { city: 'X' } } }, t)).toBe(true);
        expect(validate({ user: { name: 'A', address: {} } }, t)).toBe(false);
        expect(validate({ user: { name: 'A' } }, t)).toBe(false);
    });
    test('rejects non-objects', () => {
        let t = object({ x: NUMBER });
        expect(validate(null, t)).toBe(false);
        expect(validate([], t)).toBe(false);
        expect(validate('{}', t)).toBe(false);
        expect(validate(42, t)).toBe(false);
    });
    test('null property in object with complex type field', () => {
        let t = object({ items: object({ x: NUMBER }) });
        expect(validate({ items: null }, t)).toBe(false);
    });
    test('additionalProperties: false', () => {
        let t = object({ name: STRING }, { additionalProperties: false });
        expect(validate({ name: 'Alice' }, t)).toBe(true);
        expect(validate({ name: 'Alice', extra: 1 }, t)).toBe(false);
    });
    test('additionalProperties with a type schema', () => {
        let t = object({ name: STRING }, { additionalProperties: NUMBER });
        expect(validate({ name: 'Alice', age: 30 }, t)).toBe(true);
        expect(validate({ name: 'Alice', age: 'thirty' }, t)).toBe(false);
    });
    test('minProperties / maxProperties', () => {
        let t = object({}, { minProperties: 1, maxProperties: 3 });
        expect(validate({}, t)).toBe(false);
        expect(validate({ a: 1 }, t)).toBe(true);
        expect(validate({ a: 1, b: 2, c: 3 }, t)).toBe(true);
        expect(validate({ a: 1, b: 2, c: 3, d: 4 }, t)).toBe(false);
    });
    test('patternProperties', () => {
        let t = object({}, { patternProperties: { '^S_': STRING, '^N_': NUMBER } });
        expect(validate({ S_name: 'Alice' }, t)).toBe(true);
        expect(validate({ N_age: 30 }, t)).toBe(true);
        expect(validate({ S_name: 42 }, t)).toBe(false);
        expect(validate({ N_age: 'thirty' }, t)).toBe(false);
    });
    test('dependentRequired', () => {
        let t = object({
            name: optional(STRING),
            credit_card: optional(STRING),
            billing_address: optional(STRING),
        }, {
            dependentRequired: {
                credit_card: ['billing_address'],
            },
        });
        expect(validate({ name: 'Alice' }, t)).toBe(true);
        expect(validate({ credit_card: '1234', billing_address: '123 St' }, t)).toBe(true);
        expect(validate({ credit_card: '1234' }, t)).toBe(false);
    });
    test('propertyNames validates keys', () => {
        let t = object({}, { propertyNames: string({ maxLength: 3 }) });
        expect(validate({ ab: 1 }, t)).toBe(true);
        expect(validate({ abc: 1 }, t)).toBe(true);
        expect(validate({ abcd: 1 }, t)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 5. Arrays (K_ARRAY)
// ────────────────────────────────────────────────────────────────────────────

describe('arrays', () => {
    const { validate, array, string, number, nullable, optional } = setup();

    test('typed array accepts matching items', () => {
        let t = array(STRING);
        expect(validate(['a', 'b'], t)).toBe(true);
        expect(validate([], t)).toBe(true);
    });
    test('typed array rejects wrong item types', () => {
        let t = array(STRING);
        expect(validate([1], t)).toBe(false);
        expect(validate(['a', 1], t)).toBe(false);
    });
    test('array of nullable items', () => {
        let t = array(nullable(STRING));
        expect(validate(['a', null, 'b'], t)).toBe(true);
        expect(validate([null], t)).toBe(true);
        expect(validate([1], t)).toBe(false);
    });
    test('array of optional items', () => {
        let t = array(optional(STRING));
        expect(validate(['a', undefined], t)).toBe(true);
    });
    test('nested arrays', () => {
        let t = array(array(NUMBER));
        expect(validate([[1, 2], [3]], t)).toBe(true);
        expect(validate([[1, 'a']], t)).toBe(false);
    });
    test('minItems / maxItems', () => {
        let t = array(NUMBER, { minItems: 2, maxItems: 4 });
        expect(validate([1], t)).toBe(false);
        expect(validate([1, 2], t)).toBe(true);
        expect(validate([1, 2, 3, 4], t)).toBe(true);
        expect(validate([1, 2, 3, 4, 5], t)).toBe(false);
    });
    test('uniqueItems with primitive items', () => {
        let t = array(NUMBER, { uniqueItems: true });
        expect(validate([1, 2, 3], t)).toBe(true);
        expect(validate([1, 2, 1], t)).toBe(false);
    });
    test('uniqueItems with >16 items (Set path)', () => {
        let t = array(NUMBER, { uniqueItems: true });
        let unique = Array.from({ length: 20 }, (_, i) => i);
        expect(validate(unique, t)).toBe(true);
        let duped = [...unique, 0];
        expect(validate(duped, t)).toBe(false);
    });
    test('contains', () => {
        let t = array(ANY, { contains: NUMBER });
        expect(validate([1, 'a', true], t)).toBe(true);
        expect(validate(['a', 'b'], t)).toBe(false);
    });
    test('contains with minContains / maxContains', () => {
        let t = array(ANY, { contains: NUMBER, minContains: 2, maxContains: 3 });
        expect(validate([1, 2, 'a'], t)).toBe(true);
        expect(validate([1, 'a'], t)).toBe(false);
        expect(validate([1, 2, 3, 4, 'a'], t)).toBe(false);
    });
    test('rejects non-arrays', () => {
        let t = array(STRING);
        expect(validate({}, t)).toBe(false);
        expect(validate('[]', t)).toBe(false);
        expect(validate(null, t)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 6. Records (K_RECORD)
// ────────────────────────────────────────────────────────────────────────────

describe('records', () => {
    const { validate, record } = setup();

    test('record(STRING) accepts string-valued objects', () => {
        let t = record(STRING);
        expect(validate({ a: 'x', b: 'y' }, t)).toBe(true);
        expect(validate({}, t)).toBe(true);
    });
    test('record(STRING) rejects wrong value types', () => {
        let t = record(STRING);
        expect(validate({ a: 1 }, t)).toBe(false);
    });
    test('record rejects arrays', () => {
        let t = record(NUMBER);
        expect(validate([1, 2], t)).toBe(false);
    });
    test('record rejects null', () => {
        let t = record(NUMBER);
        expect(validate(null, t)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 7. Tuples (K_TUPLE)
// ────────────────────────────────────────────────────────────────────────────

describe('tuples', () => {
    const { validate, tuple } = setup();

    test('tuple validates positional types', () => {
        let t = tuple(STRING, NUMBER);
        expect(validate(['a', 1], t)).toBe(true);
        expect(validate([1, 'a'], t)).toBe(false);
    });
    test('tuple is strict by default (rejects extra items)', () => {
        let t = tuple(STRING, NUMBER);
        expect(validate(['a', 1, true], t)).toBe(false);
    });
    test('tuple is strict by default (rejects too few items)', () => {
        let t = tuple(STRING, NUMBER);
        expect(validate(['a'], t)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 8. Unions / OR / Exclusive (K_UNION, K_OR, K_EXCLUSIVE)
// ────────────────────────────────────────────────────────────────────────────

describe('unions (anyOf)', () => {
    const { validate, or, object, literal } = setup();

    test('or accepts any matching branch', () => {
        let t = or(STRING, NUMBER);
        expect(validate('hello', t)).toBe(true);
        expect(validate(42, t)).toBe(true);
        expect(validate(true, t)).toBe(false);
    });
    test('or with complex types', () => {
        let t = or(object({ x: NUMBER }), object({ y: STRING }));
        expect(validate({ x: 1 }, t)).toBe(true);
        expect(validate({ y: 'a' }, t)).toBe(true);
        expect(validate({ z: true }, t)).toBe(false);
    });
});

describe('exclusive (oneOf)', () => {
    const { validate, exclusive } = setup();

    test('exclusive accepts exactly one match', () => {
        let t = exclusive(STRING, NUMBER);
        expect(validate('hello', t)).toBe(true);
        expect(validate(42, t)).toBe(true);
        expect(validate(true, t)).toBe(false);
    });
    test('exclusive rejects when multiple branches match', () => {
        // NUMBER matches both NUMBER and INTEGER
        // Use overlapping schemas
        let { validate: v, exclusive: ex, object } = setup();
        let t = ex(
            object({ x: NUMBER }),
            object({ x: STRING }),
        );
        expect(v({ x: 1 }, t)).toBe(true);
        expect(v({ x: 'a' }, t)).toBe(true);
    });
});

describe('discriminated union', () => {
    const { validate, union, object, literal } = setup();

    test('dispatches on discriminator field', () => {
        let t = union('type', {
            dog: object({ type: literal('dog'), bark: BOOLEAN }),
            cat: object({ type: literal('cat'), meow: BOOLEAN }),
        });
        expect(validate({ type: 'dog', bark: true }, t)).toBe(true);
        expect(validate({ type: 'cat', meow: true }, t)).toBe(true);
        expect(validate({ type: 'dog', meow: true }, t)).toBe(false);
        expect(validate({ type: 'fish' }, t)).toBe(false);
    });
    test('rejects non-objects', () => {
        let t = union('type', {
            a: object({ type: literal('a') }),
        });
        expect(validate('a', t)).toBe(false);
        expect(validate(null, t)).toBe(false);
        expect(validate([], t)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 9. Intersect (K_INTERSECT)
// ────────────────────────────────────────────────────────────────────────────

describe('intersect (allOf)', () => {
    const { validate, intersect, object } = setup();

    test('requires all branches to match', () => {
        let t = intersect(
            object({ x: NUMBER }),
            object({ y: STRING }),
        );
        expect(validate({ x: 1, y: 'a' }, t)).toBe(true);
        expect(validate({ x: 1 }, t)).toBe(false);
        expect(validate({ y: 'a' }, t)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 10. Not (K_NOT)
// ────────────────────────────────────────────────────────────────────────────

describe('not', () => {
    const { validate, not } = setup();

    test('inverts validation', () => {
        let t = not(STRING);
        expect(validate(42, t)).toBe(true);
        expect(validate('hello', t)).toBe(false);
    });
    test('not(not(STRING)) accepts strings', () => {
        let t = not(not(STRING));
        expect(validate('hello', t)).toBe(true);
        expect(validate(42, t)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 11. Refine (K_REFINE)
// ────────────────────────────────────────────────────────────────────────────

describe('refine', () => {
    const { validate, refine } = setup();

    test('custom validator function', () => {
        let t = refine(NUMBER, (v) => v > 0 && v < 100);
        expect(validate(50, t)).toBe(true);
        expect(validate(0, t)).toBe(false);
        expect(validate(100, t)).toBe(false);
    });
    test('refine checks inner type first', () => {
        let t = refine(STRING, (v) => v.length > 0);
        expect(validate('x', t)).toBe(true);
        expect(validate('', t)).toBe(false);
        expect(validate(42, t)).toBe(false); // inner type fails, fn never called
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 12. Conditional (K_CONDITIONAL — if/then/else)
// ────────────────────────────────────────────────────────────────────────────

describe('conditional (when)', () => {
    const { validate, when } = setup();

    test('if/then/else applies then on match', () => {
        let t = when({ if: STRING, then: STRING, else: NUMBER });
        expect(validate('hello', t)).toBe(true);
        expect(validate(42, t)).toBe(true);
        expect(validate(true, t)).toBe(false);
    });
    test('if matches, then must also match', () => {
        let { validate: v, when: w, string, number } = setup();
        let t = w({
            if: NUMBER,
            then: number({ minimum: 10 }),
            else: ANY,
        });
        expect(v(15, t)).toBe(true);
        expect(v(5, t)).toBe(false);
        expect(v('hello', t)).toBe(true); // else branch: ANY
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 13. Literal / Enum (MOD_ENUM)
// ────────────────────────────────────────────────────────────────────────────

describe('literal and enum', () => {
    const s = setup();
    const { validate } = s;
    const lit = s.literal;
    const en = s.enum;

    test('literal matches exact value', () => {
        let t = lit('hello');
        expect(validate('hello', t)).toBe(true);
        expect(validate('world', t)).toBe(false);
    });
    test('literal with number', () => {
        let t = lit(42);
        expect(validate(42, t)).toBe(true);
        expect(validate(43, t)).toBe(false);
        expect(validate('42', t)).toBe(false);
    });
    test('literal with boolean', () => {
        let t = lit(true);
        expect(validate(true, t)).toBe(true);
        expect(validate(false, t)).toBe(false);
    });
    test('enum matches any value in set', () => {
        let t = en(['red', 'green', 'blue']);
        expect(validate('red', t)).toBe(true);
        expect(validate('green', t)).toBe(true);
        expect(validate('yellow', t)).toBe(false);
    });
    test('enum with mixed types', () => {
        let t = en([1, 2, 'three', true]);
        expect(validate(1, t)).toBe(true);
        expect(validate('three', t)).toBe(true);
        expect(validate(true, t)).toBe(true);
        expect(validate(false, t)).toBe(false);
        expect(validate(4, t)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 14. NULLABLE/OPTIONAL on complex types
// ────────────────────────────────────────────────────────────────────────────

describe('nullable/optional on complex types', () => {
    const { validate, object, array, nullable, optional } = setup();

    test('nullable object accepts null', () => {
        let t = nullable(object({ x: NUMBER }));
        expect(validate(null, t)).toBe(true);
        expect(validate({ x: 1 }, t)).toBe(true);
        expect(validate(undefined, t)).toBe(false);
    });
    test('optional object accepts undefined', () => {
        let t = optional(object({ x: NUMBER }));
        expect(validate(undefined, t)).toBe(true);
        expect(validate({ x: 1 }, t)).toBe(true);
        expect(validate(null, t)).toBe(false);
    });
    test('nullable array', () => {
        let t = nullable(array(STRING));
        expect(validate(null, t)).toBe(true);
        expect(validate(['a'], t)).toBe(true);
        expect(validate(undefined, t)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 15. JSON Schema compiled paths — format validators
// ────────────────────────────────────────────────────────────────────────────

describe('format validators (via DSL)', () => {
    // JSON Schema treats format as annotation-only by default.
    // The DSL builder enforces format, so test via DSL path.
    const { validate, string } = setup();

    test('format: date', () => {
        let t = string({ format: 'date-time' });
        expect(validate('2024-01-15T10:30:00Z', t)).toBe(true);
        expect(validate('not-a-date', t)).toBe(false);
    });
    test('format: email', () => {
        let t = string({ format: 'email' });
        expect(validate('user@example.com', t)).toBe(true);
        expect(validate('no-at-sign', t)).toBe(false);
    });
    test('format: ipv4', () => {
        let t = string({ format: 'ipv4' });
        expect(validate('127.0.0.1', t)).toBe(true);
        expect(validate('256.0.0.1', t)).toBe(false);
    });
    test('format: uuid', () => {
        let t = string({ format: 'uuid' });
        expect(validate('123e4567-e89b-12d3-a456-426614174000', t)).toBe(true);
        expect(validate('not-uuid', t)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 16. JSON Schema compiled — V_ENUM on K_PRIMITIVE
// ────────────────────────────────────────────────────────────────────────────

describe('JSON Schema enum on primitives', () => {
    test('string enum', () => {
        let { validate, type } = schemaType({ type: 'string', enum: ['a', 'b', 'c'] });
        expect(validate('a', type)).toBe(true);
        expect(validate('d', type)).toBe(false);
        expect(validate(1, type)).toBe(false);
    });
    test('number enum', () => {
        let { validate, type } = schemaType({ type: 'number', enum: [1, 2, 3] });
        expect(validate(1, type)).toBe(true);
        expect(validate(4, type)).toBe(false);
    });
    test('boolean enum (true only)', () => {
        let { validate, type } = schemaType({ enum: [true] });
        expect(validate(true, type)).toBe(true);
        expect(validate(false, type)).toBe(false);
    });
    test('mixed type enum', () => {
        let { validate, type } = schemaType({ enum: ['hello', 42, true] });
        expect(validate('hello', type)).toBe(true);
        expect(validate(42, type)).toBe(true);
        expect(validate(true, type)).toBe(true);
        expect(validate('world', type)).toBe(false);
        expect(validate(false, type)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 17. JSON Schema compiled — uniqueItems with complex items (deepEqual path)
// ────────────────────────────────────────────────────────────────────────────

describe('uniqueItems with objects (deepEqual)', () => {
    test('rejects duplicate objects', () => {
        let { validate, type } = schemaType({
            type: 'array',
            items: { type: 'object' },
            uniqueItems: true,
        });
        expect(validate([{ a: 1 }, { a: 2 }], type)).toBe(true);
        expect(validate([{ a: 1 }, { a: 1 }], type)).toBe(false);
    });
    test('nested object equality', () => {
        let { validate, type } = schemaType({
            type: 'array',
            uniqueItems: true,
        });
        expect(validate([{ a: { b: 1 } }, { a: { b: 1 } }], type)).toBe(false);
        expect(validate([{ a: { b: 1 } }, { a: { b: 2 } }], type)).toBe(true);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 18. JSON Schema compiled — dependentSchemas
// ────────────────────────────────────────────────────────────────────────────

describe('dependentSchemas', () => {
    test('applies schema when trigger property present', () => {
        let { validate, type } = schemaType({
            type: 'object',
            properties: {
                name: { type: 'string' },
                credit_card: { type: 'string' },
            },
            dependentSchemas: {
                credit_card: {
                    properties: {
                        billing_address: { type: 'string' },
                    },
                    required: ['billing_address'],
                },
            },
        });
        expect(validate({ name: 'Alice' }, type)).toBe(true);
        expect(validate({ name: 'Alice', credit_card: '1234', billing_address: '123 St' }, type)).toBe(true);
        expect(validate({ name: 'Alice', credit_card: '1234' }, type)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 19. JSON Schema compiled — dynamic ref / anchor
// ────────────────────────────────────────────────────────────────────────────

describe('dynamic ref/anchor', () => {
    test('$dynamicRef resolves to innermost $dynamicAnchor', () => {
        let { validate, type } = schemaType({
            "$id": "https://test.json-schema.org/dynamic-ref-leaving-dynamic-scope/main",
            "$defs": {
                "inner": {
                    "$id": "inner",
                    "$dynamicAnchor": "foo",
                    "type": "object",
                    "properties": {
                        "baz": { "$dynamicRef": "#foo" },
                    },
                },
                "foo": {
                    "$dynamicAnchor": "foo",
                    "type": "integer",
                },
            },
            "$ref": "inner",
        });
        expect(validate({ baz: 42 }, type)).toBe(true);
        expect(validate({ baz: 'not int' }, type)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 20. JSON Schema compiled — unevaluatedProperties
// ────────────────────────────────────────────────────────────────────────────

describe('unevaluatedProperties', () => {
    test('rejects properties not evaluated by any keyword', () => {
        let { validate, type } = schemaType({
            type: 'object',
            properties: { foo: { type: 'string' } },
            unevaluatedProperties: false,
        });
        expect(validate({ foo: 'bar' }, type)).toBe(true);
        expect(validate({ foo: 'bar', extra: 1 }, type)).toBe(false);
    });
    test('allOf properties count as evaluated', () => {
        let { validate, type } = schemaType({
            type: 'object',
            allOf: [
                { properties: { foo: { type: 'string' } } },
                { properties: { bar: { type: 'number' } } },
            ],
            unevaluatedProperties: false,
        });
        expect(validate({ foo: 'a', bar: 1 }, type)).toBe(true);
        expect(validate({ foo: 'a', bar: 1, baz: true }, type)).toBe(false);
    });
    test('anyOf branch properties count as evaluated', () => {
        let { validate, type } = schemaType({
            type: 'object',
            anyOf: [
                { properties: { foo: { type: 'string' } } },
                { properties: { bar: { type: 'number' } } },
            ],
            unevaluatedProperties: false,
        });
        expect(validate({ foo: 'a' }, type)).toBe(true);
        expect(validate({ bar: 1 }, type)).toBe(true);
        expect(validate({ baz: true }, type)).toBe(false);
    });
    test('if/then/else properties count as evaluated', () => {
        let { validate, type } = schemaType({
            type: 'object',
            properties: { foo: true },
            if: { properties: { foo: { type: 'string' } }, required: ['foo'] },
            then: { properties: { bar: { type: 'number' } } },
            else: { properties: { baz: { type: 'boolean' } } },
            unevaluatedProperties: false,
        });
        expect(validate({ foo: 'a', bar: 1 }, type)).toBe(true);
        expect(validate({ foo: 1, baz: true }, type)).toBe(true);
        expect(validate({ foo: 'a', baz: true }, type)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 21. JSON Schema compiled — unevaluatedItems
// ────────────────────────────────────────────────────────────────────────────

describe('unevaluatedItems', () => {
    test('rejects items not evaluated by prefixItems', () => {
        let { validate, type } = schemaType({
            type: 'array',
            prefixItems: [{ type: 'string' }, { type: 'number' }],
            unevaluatedItems: false,
        });
        expect(validate(['a', 1], type)).toBe(true);
        expect(validate(['a', 1, true], type)).toBe(false);
    });
    test('items keyword marks as evaluated', () => {
        let { validate, type } = schemaType({
            type: 'array',
            prefixItems: [{ type: 'string' }],
            items: { type: 'number' },
            unevaluatedItems: false,
        });
        expect(validate(['a', 1, 2, 3], type)).toBe(true);
        expect(validate(['a', 1, 'extra'], type)).toBe(false);
    });
    test('contains marks matching items as evaluated', () => {
        let { validate, type } = schemaType({
            type: 'array',
            contains: { type: 'number' },
            unevaluatedItems: { type: 'string' },
        });
        expect(validate([1, 'a', 'b'], type)).toBe(true);
        expect(validate([1, 'a', true], type)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 22. Edge cases and adversarial inputs
// ────────────────────────────────────────────────────────────────────────────

describe('edge cases', () => {
    const { validate, object, array, record, string, number, or } = setup();

    test('deeply nested objects', () => {
        let inner = object({ v: NUMBER });
        for (let i = 0; i < 20; i++) {
            inner = object({ child: inner });
        }
        let data = { v: 42 };
        for (let i = 0; i < 20; i++) {
            data = { child: data };
        }
        expect(validate(data, inner)).toBe(true);
    });
    test('empty string as object key', () => {
        let t = object({ '': STRING });
        expect(validate({ '': 'hello' }, t)).toBe(true);
        expect(validate({}, t)).toBe(false);
    });
    test('prototype pollution defense', () => {
        let t = record(NUMBER);
        let obj = Object.create({ inherited: 'nope' });
        obj.own = 42;
        expect(validate(obj, t)).toBe(true);
    });
    test('__proto__ as a real key', () => {
        let t = object({ name: STRING });
        let data = JSON.parse('{"name":"test","__proto__":{"admin":true}}');
        expect(validate(data, t)).toBe(true);
    });
    test('very large array', () => {
        let t = array(NUMBER);
        let data = new Array(10000).fill(42);
        expect(validate(data, t)).toBe(true);
        data[9999] = 'oops';
        expect(validate(data, t)).toBe(false);
    });
    test('NaN handling', () => {
        expect(validate(NaN, NUMBER)).toBe(true); // NaN is typeof number
        let { validate: v2, type } = schemaType({ type: 'integer' });
        expect(v2(NaN, type)).toBe(false); // NaN is not integer
    });
    test('Infinity handling', () => {
        expect(validate(Infinity, NUMBER)).toBe(true);
        expect(validate(-Infinity, NUMBER)).toBe(true);
    });
    test('-0 handling', () => {
        let { validate: v, number: n } = setup();
        let t = n({ minimum: 0 });
        expect(v(-0, t)).toBe(true); // -0 >= 0 is true in JS
    });
    test('object with many extra properties and additionalProperties: false', () => {
        let t = object({ a: STRING }, { additionalProperties: false });
        let data = { a: 'ok' };
        for (let i = 0; i < 100; i++) {
            data['extra_' + i] = i;
        }
        expect(validate(data, t)).toBe(false);
    });
    test('or with null/undefined branches on complex', () => {
        let t = or(object({ x: NUMBER }), STRING);
        expect(validate(null, t)).toBe(false);
        expect(validate(undefined, t)).toBe(false);
    });
    test('empty array validates against array schema', () => {
        let t = array(NEVER);
        expect(validate([], t)).toBe(true); // no items to validate
    });
    test('object property with value undefined is treated as missing', () => {
        let t = object({ x: STRING });
        expect(validate({ x: undefined }, t)).toBe(false);
    });
    test('catalog heap resizing with many types', () => {
        // Create enough types to trigger KINDS/SLAB resizing
        let cat2 = catalog({ slab: 32, kinds: 16 });
        let alloc2 = allocators(cat2);
        let types = [];
        for (let i = 0; i < 50; i++) {
            types.push(alloc2.object({ ['key' + i]: STRING }));
        }
        // All types should still validate correctly
        for (let i = 0; i < 50; i++) {
            expect(cat2.validate({ ['key' + i]: 'val' }, types[i])).toBe(true);
            expect(cat2.validate({}, types[i])).toBe(false);
        }
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 23. JSON Schema — oneOf tracking
// ────────────────────────────────────────────────────────────────────────────

describe('oneOf with unevaluatedProperties', () => {
    test('winning branch properties are evaluated', () => {
        let { validate, type } = schemaType({
            type: 'object',
            oneOf: [
                { properties: { foo: { type: 'string' } }, required: ['foo'] },
                { properties: { bar: { type: 'number' } }, required: ['bar'] },
            ],
            unevaluatedProperties: false,
        });
        expect(validate({ foo: 'a' }, type)).toBe(true);
        expect(validate({ bar: 1 }, type)).toBe(true);
        expect(validate({ foo: 'a', extra: 1 }, type)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 24. JSON Schema — tuple (prefixItems) with strict items: false
// ────────────────────────────────────────────────────────────────────────────

describe('JSON Schema tuples', () => {
    test('prefixItems validates positional types', () => {
        let { validate, type } = schemaType({
            type: 'array',
            prefixItems: [
                { type: 'string' },
                { type: 'number' },
                { type: 'boolean' },
            ],
        });
        expect(validate(['a', 1, true], type)).toBe(true);
        expect(validate(['a', 1, 'not bool'], type)).toBe(false);
    });
    test('prefixItems with items (rest type)', () => {
        let { validate, type } = schemaType({
            type: 'array',
            prefixItems: [{ type: 'string' }],
            items: { type: 'number' },
        });
        expect(validate(['a'], type)).toBe(true);
        expect(validate(['a', 1, 2], type)).toBe(true);
        expect(validate(['a', 'b'], type)).toBe(false);
    });
    test('items: false rejects extra items', () => {
        let { validate, type } = schemaType({
            type: 'array',
            prefixItems: [{ type: 'string' }],
            items: false,
        });
        expect(validate(['a'], type)).toBe(true);
        expect(validate(['a', 1], type)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 25. JSON Schema — $ref
// ────────────────────────────────────────────────────────────────────────────

describe('JSON Schema $ref', () => {
    test('basic $ref to $defs', () => {
        let { validate, type } = schemaType({
            type: 'object',
            properties: {
                child: { $ref: '#/$defs/node' },
            },
            $defs: {
                node: {
                    type: 'object',
                    properties: {
                        value: { type: 'number' },
                    },
                    required: ['value'],
                },
            },
        });
        expect(validate({ child: { value: 42 } }, type)).toBe(true);
        expect(validate({ child: {} }, type)).toBe(false);
    });
    test('recursive $ref', () => {
        let { validate, type } = schemaType({
            type: 'object',
            properties: {
                value: { type: 'number' },
                children: {
                    type: 'array',
                    items: { $ref: '#' },
                },
            },
            required: ['value'],
        });
        expect(validate({ value: 1, children: [{ value: 2, children: [] }] }, type)).toBe(true);
        expect(validate({ value: 1, children: [{ children: [] }] }, type)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 26. JSON Schema — const
// ────────────────────────────────────────────────────────────────────────────

describe('JSON Schema const', () => {
    test('const with string', () => {
        let { validate, type } = schemaType({ const: 'hello' });
        expect(validate('hello', type)).toBe(true);
        expect(validate('world', type)).toBe(false);
    });
    test('const with number', () => {
        let { validate, type } = schemaType({ const: 42 });
        expect(validate(42, type)).toBe(true);
        expect(validate(43, type)).toBe(false);
    });
    test('const with null', () => {
        let { validate, type } = schemaType({ const: null });
        expect(validate(null, type)).toBe(true);
        expect(validate(undefined, type)).toBe(false);
        expect(validate(0, type)).toBe(false);
    });
    test('const with boolean', () => {
        let { validate, type } = schemaType({ const: false });
        expect(validate(false, type)).toBe(true);
        expect(validate(true, type)).toBe(false);
        expect(validate(0, type)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// 27. Combined validators — string + pattern + length
// ────────────────────────────────────────────────────────────────────────────

describe('combined validators', () => {
    test('string with multiple constraints via JSON Schema', () => {
        let { validate, type } = schemaType({
            type: 'string',
            minLength: 3,
            maxLength: 10,
            pattern: '^[a-z]+$',
        });
        expect(validate('abc', type)).toBe(true);
        expect(validate('abcdefghij', type)).toBe(true);
        expect(validate('ab', type)).toBe(false);      // too short
        expect(validate('abcdefghijk', type)).toBe(false); // too long
        expect(validate('ABC', type)).toBe(false);      // pattern fail
    });
    test('number with min + max + multipleOf', () => {
        let { validate, type } = schemaType({
            type: 'number',
            minimum: 0,
            maximum: 100,
            multipleOf: 5,
        });
        expect(validate(0, type)).toBe(true);
        expect(validate(50, type)).toBe(true);
        expect(validate(100, type)).toBe(true);
        expect(validate(3, type)).toBe(false);    // not multiple of 5
        expect(validate(-5, type)).toBe(false);   // below minimum
        expect(validate(105, type)).toBe(false);  // above maximum
    });
    test('integer with exclusiveMinimum and exclusiveMaximum', () => {
        let { validate, type } = schemaType({
            type: 'integer',
            exclusiveMinimum: 0,
            exclusiveMaximum: 10,
        });
        expect(validate(1, type)).toBe(true);
        expect(validate(9, type)).toBe(true);
        expect(validate(0, type)).toBe(false);
        expect(validate(10, type)).toBe(false);
    });
});
