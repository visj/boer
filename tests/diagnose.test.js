import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, BOOLEAN, NUMBER,
    STRING, BIGINT, DATE, URI, registry
} from 'uvd/core';

const { t, diagnose } = registry();

describe('explain: primitives', () => {
    test('no errors for matching type', () => {
        expect(diagnose('hello', STRING)).toEqual([]);
        expect(diagnose(42, NUMBER)).toEqual([]);
        expect(diagnose(true, BOOLEAN)).toEqual([]);
        expect(diagnose(BigInt(1), BIGINT)).toEqual([]);
        expect(diagnose(new Date(), DATE)).toEqual([]);
        expect(diagnose(new URL('https://vilhelm.se'), URI)).toEqual([]);
    });

    test('error for mismatched type', () => {
        let errs = diagnose(42, STRING);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('');
        expect(errs[0].message).toContain('string');
        expect(errs[0].message).toContain('number');
    });

    test('error for null on non-nullable', () => {
        let errs = diagnose(null, STRING);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('null');
    });

    test('error for undefined on non-optional', () => {
        let errs = diagnose(undefined, STRING);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('undefined');
    });

    test('no error for null on nullable', () => {
        expect(diagnose(null, STRING | NULL)).toEqual([]);
    });

    test('no error for undefined on optional', () => {
        expect(diagnose(undefined, STRING | UNDEFINED)).toEqual([]);
    });
});

describe('explain: type unions', () => {
    test('no error when value matches any type in union', () => {
        expect(diagnose('hello', STRING | NUMBER)).toEqual([]);
        expect(diagnose(42, STRING | NUMBER)).toEqual([]);
    });

    test('error mentions all expected types', () => {
        let errs = diagnose(true, STRING | NUMBER);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('string');
        expect(errs[0].message).toContain('number');
    });

    test('error for wrong type in triple union', () => {
        let errs = diagnose([], STRING | NUMBER | BOOLEAN);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('string');
        expect(errs[0].message).toContain('number');
        expect(errs[0].message).toContain('boolean');
    });
});

describe('explain: objects', () => {
    test('no errors for valid object', () => {
        let schema = t.object({ name: STRING, age: NUMBER });
        expect(diagnose({ name: 'Alice', age: 30 }, schema)).toEqual([]);
    });

    test('error with field path for wrong type', () => {
        let schema = t.object({ name: STRING, age: NUMBER });
        let errs = diagnose({ name: 'Alice', age: '30' }, schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('age');
        expect(errs[0].message).toContain('number');
    });

    test('multiple field errors', () => {
        let schema = t.object({ a: STRING, b: NUMBER, c: BOOLEAN });
        let errs = diagnose({ a: 42, b: 'wrong', c: 'wrong' }, schema);
        expect(errs.length).toBe(3);
        expect(errs.map(e => e.path).sort()).toEqual(['a', 'b', 'c']);
    });

    test('error for null field without NULL', () => {
        let schema = t.object({ name: STRING });
        let errs = diagnose({ name: null }, schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('name');
        expect(errs[0].message).toContain('null');
    });

    test('error for missing field without UNDEFINED', () => {
        let schema = t.object({ name: STRING, age: NUMBER });
        let errs = diagnose({ name: 'Alice' }, schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('age');
        expect(errs[0].message).toContain('undefined');
    });

    test('no error for null field with NULL', () => {
        let schema = t.object({ name: STRING | NULL });
        expect(diagnose({ name: null }, schema)).toEqual([]);
    });

    test('no error for missing field with UNDEFINED', () => {
        let schema = t.object({ name: STRING | UNDEFINED });
        expect(diagnose({}, schema)).toEqual([]);
    });

    test('error for non-object', () => {
        let schema = t.object({ a: STRING });
        let errs = diagnose('string', schema);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('object');
    });

    test('error for array instead of object', () => {
        let schema = t.object({ a: STRING });
        let errs = diagnose([], schema);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('object');
    });

    test('nested object errors have dot paths', () => {
        let schema = t.object({
            user: {
                name: STRING,
                address: {
                    city: STRING
                }
            }
        });
        let errs = diagnose({ user: { name: 'Alice', address: { city: 42 } } }, schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('user.address.city');
    });

    test('deeply nested missing field', () => {
        let schema = t.object({ a: { b: { c: NUMBER } } });
        let errs = diagnose({ a: { b: {} } }, schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('a.b.c');
        expect(errs[0].message).toContain('undefined');
    });
});

describe('explain: arrays', () => {
    test('no errors for valid array', () => {
        expect(diagnose([1, 2, 3], t.array(NUMBER))).toEqual([]);
    });

    test('error for non-array', () => {
        let errs = diagnose('not-array', t.array(NUMBER));
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('array');
    });

    test('error for null array without NULL', () => {
        let errs = diagnose(null, t.array(NUMBER));
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('null');
    });

    test('no error for null array with NULL', () => {
        expect(diagnose(null, t.array(NUMBER) | NULL)).toEqual([]);
    });

    test('element error has bracket path', () => {
        let errs = diagnose([1, 'two', 3], t.array(NUMBER));
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('[1]');
    });

    test('multiple element errors', () => {
        let errs = diagnose([1, 'two', true], t.array(NUMBER));
        expect(errs.length).toBe(2);
        expect(errs[0].path).toBe('[1]');
        expect(errs[1].path).toBe('[2]');
    });

    test('null element error when element not nullable', () => {
        let errs = diagnose([1, null, 3], t.array(NUMBER));
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('[1]');
        expect(errs[0].message).toContain('null');
    });

    test('no error for null element when nullable', () => {
        expect(diagnose([1, null, 3], t.array(NUMBER | NULL))).toEqual([]);
    });

    test('nested array errors have nested paths', () => {
        let errs = diagnose([[1, 2], [3, 'four']], t.array(t.array(NUMBER)));
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('[1][1]');
    });

    test('array of objects errors have combined paths', () => {
        let Item = t.object({ name: STRING, val: NUMBER });
        let errs = diagnose([
            { name: 'ok', val: 1 },
            { name: 'bad', val: 'wrong' }
        ], t.array(Item));
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('[1].val');
    });
});

describe('explain: unions', () => {
    let ShapeUnion = t.union('type', {
        circle: t.object({ type: STRING, radius: NUMBER }),
        rect: t.object({ type: STRING, w: NUMBER, h: NUMBER })
    });

    test('no errors for valid variant', () => {
        expect(diagnose({ type: 'circle', radius: 5 }, ShapeUnion)).toEqual([]);
    });

    test('error for missing discriminator', () => {
        let errs = diagnose({ radius: 5 }, ShapeUnion);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('discriminator');
    });

    test('error for unknown discriminator value', () => {
        let errs = diagnose({ type: 'triangle' }, ShapeUnion);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('triangle');
    });

    test('error for non-object union input', () => {
        let errs = diagnose('circle', ShapeUnion);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('object');
    });

    test('error for wrong field type inside matched variant', () => {
        let errs = diagnose({ type: 'circle', radius: 'five' }, ShapeUnion);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('radius');
    });

    test('null union error when not nullable', () => {
        let errs = diagnose(null, ShapeUnion);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('null');
    });

    test('no error for null union when nullable', () => {
        expect(diagnose(null, ShapeUnion | NULL)).toEqual([]);
    });

    test('array of unions explains each bad element', () => {
        let errs = diagnose([
            { type: 'circle', radius: 5 },
            { type: 'circle', radius: 'wrong' },
            { type: 'unknown' }
        ], t.array(ShapeUnion));
        expect(errs.length).toBe(2);
        // First error: wrong field type in [1]
        expect(errs[0].path).toBe('[1].radius');
        // Second error: unknown discriminator in [2]
        expect(errs[1].path).toBe('[2].type');
    });
});

describe('explain: complex nested scenarios', () => {
    test('deeply nested object in array in object', () => {
        let Schema = t.object({
            users: t.array(t.object({
                name: STRING,
                tags: t.array(STRING)
            }))
        });
        let errs = diagnose({
            users: [
                { name: 'Alice', tags: ['a', 'b'] },
                { name: 'Bob', tags: ['c', 42] }
            ]
        }, Schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('users[1].tags[1]');
    });

    test('nullable array of nullable union objects', () => {
        let MsgUnion = t.union('kind', {
            text: t.object({ kind: STRING, body: STRING }),
            img: t.object({ kind: STRING, src: STRING })
        });

        let Schema = t.object({
            messages: t.array(MsgUnion | NULL) | NULL
        });

        // Valid
        expect(diagnose({ messages: null }, Schema)).toEqual([]);
        expect(diagnose({ messages: [null, { kind: 'text', body: 'hi' }] }, Schema)).toEqual([]);

        // Invalid element
        let errs = diagnose({ messages: [{ kind: 'text', body: 42 }] }, Schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('messages[0].body');
    });

    test('error count accumulates across multiple fields and elements', () => {
        let Schema = t.object({
            a: STRING,
            b: NUMBER,
            c: t.array(BOOLEAN)
        });
        let errs = diagnose({ a: 42, b: 'wrong', c: [true, 'x', 'y'] }, Schema);
        expect(errs.length).toBe(4); // a wrong, b wrong, c[1] wrong, c[2] wrong
    });
});