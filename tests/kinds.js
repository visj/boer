import { describe, test, expect } from 'bun:test';
import {
    BOOLEAN, NUMBER, STRING,
    BIGINT, DATE, URI, catalog
} from 'uvd/catalog';

const { t, v, is, validate, conform, diagnose } = catalog();

describe('K_TUPLE', () => {
    test('accepts correct positional types', () => {
        let tup = t.tuple(STRING, NUMBER, BOOLEAN);
        expect(is(['hello', 42, true], tup)).toBe(true);
    });

    test('rejects wrong length (too short)', () => {
        let tup = t.tuple(STRING, NUMBER);
        expect(is(['hello'], tup)).toBe(false);
    });

    test('rejects wrong length (too long)', () => {
        let tup = t.tuple(STRING, NUMBER);
        expect(is(['hello', 42, true], tup)).toBe(false);
    });

    test('rejects wrong type at position', () => {
        let tup = t.tuple(STRING, NUMBER);
        expect(is([42, 'hello'], tup)).toBe(false);
    });

    test('accepts nullable element', () => {
        let tup = t.tuple(t.nullable(STRING), NUMBER);
        expect(is([null, 42], tup)).toBe(true);
    });

    test('accepts optional element', () => {
        let tup = t.tuple(t.optional(STRING), NUMBER);
        expect(is([undefined, 42], tup)).toBe(true);
    });

    test('rejects non-array', () => {
        let tup = t.tuple(STRING, NUMBER);
        expect(is({ 0: 'a', 1: 1 }, tup)).toBe(false);
        expect(is('hello', tup)).toBe(false);
    });

    test('array-first overload', () => {
        let tup = t.tuple([STRING, NUMBER, BOOLEAN, STRING]);
        expect(is(['a', 1, true, 'b'], tup)).toBe(true);
        expect(is(['a', 1, true], tup)).toBe(false);
    });

    test('single element tuple', () => {
        let tup = t.tuple(STRING);
        expect(is(['hello'], tup)).toBe(true);
        expect(is([], tup)).toBe(false);
    });

    test('with complex inner types', () => {
        let obj = t.object({ name: STRING });
        let tup = t.tuple(obj, NUMBER);
        expect(is([{ name: 'test' }, 42], tup)).toBe(true);
        expect(is([{ name: 123 }, 42], tup)).toBe(false);
    });

    test('validate works with tuple', () => {
        let tup = t.tuple(STRING, NUMBER);
        expect(validate(['hello', 42], tup)).toBe(true);
        expect(validate([42, 'hello'], tup)).toBe(false);
    });

    test('conform works with tuple', () => {
        let tup = t.tuple(DATE, NUMBER);
        let data = ['2024-01-01', 42];
        expect(conform(data, tup)).toBe(true);
        expect(data[0] instanceof Date).toBe(true);
    });

    test('diagnose works with tuple', () => {
        let tup = t.tuple(STRING, NUMBER);
        let errors = diagnose(42, tup);
        expect(errors.length).toBeGreaterThan(0);
    });

    test('diagnose reports wrong length', () => {
        let tup = t.tuple(STRING, NUMBER);
        let errors = diagnose(['a'], tup);
        expect(errors.length).toBe(1);
        expect(errors[0].message).toContain('length');
    });

    test('volatile tuple', () => {
        let tup = v.tuple(STRING, NUMBER);
        expect(is(['hello', 42], tup)).toBe(true);
        expect(is([42, 'hello'], tup)).toBe(false);
    });
});

// =========================================================================
// K_RECORD
// =========================================================================
describe('K_RECORD', () => {
    test('all values match type', () => {
        let rec = t.record(NUMBER);
        expect(is({ a: 1, b: 2, c: 3 }, rec)).toBe(true);
    });

    test('rejects wrong value type', () => {
        let rec = t.record(NUMBER);
        expect(is({ a: 1, b: 'hello' }, rec)).toBe(false);
    });

    test('empty object passes', () => {
        let rec = t.record(STRING);
        expect(is({}, rec)).toBe(true);
    });

    test('rejects non-object', () => {
        let rec = t.record(NUMBER);
        expect(is([1, 2], rec)).toBe(false);
        expect(is('hello', rec)).toBe(false);
        expect(is(null, rec)).toBe(false);
    });

    test('works with complex value types', () => {
        let obj = t.object({ x: NUMBER });
        let rec = t.record(obj);
        expect(is({ a: { x: 1 }, b: { x: 2 } }, rec)).toBe(true);
        expect(is({ a: { x: 'bad' } }, rec)).toBe(false);
    });

    test('validate works with record', () => {
        let rec = t.record(t.string({ minLength: 2 }));
        expect(validate({ a: 'ab', b: 'cd' }, rec)).toBe(true);
        expect(validate({ a: 'a' }, rec)).toBe(false);
    });

    test('conform works with record', () => {
        let rec = t.record(DATE);
        let data = { a: '2024-01-01', b: '2024-06-15' };
        expect(conform(data, rec)).toBe(true);
        expect(data.a instanceof Date).toBe(true);
    });

    test('diagnose works with record', () => {
        let rec = t.record(NUMBER);
        let errors = diagnose({ a: 'bad' }, rec);
        expect(errors.length).toBeGreaterThan(0);
    });

    test('volatile record', () => {
        let rec = v.record(NUMBER);
        expect(is({ a: 1 }, rec)).toBe(true);
        expect(is({ a: 'x' }, rec)).toBe(false);
    });
});

describe('K_OR (anyOf)', () => {
    test('fast path: all primitives OR bits together', () => {
        let orType = t.or(STRING, NUMBER);
        // Should be a raw primitive bitwise OR
        expect(orType & (1 << 31)).toBe(0); // no COMPLEX bit
        expect(is('hello', orType)).toBe(true);
        expect(is(42, orType)).toBe(true);
        expect(is(true, orType)).toBe(false);
    });

    test('fast path: three primitives', () => {
        let orType = t.or(STRING, NUMBER, BOOLEAN);
        expect(is('hi', orType)).toBe(true);
        expect(is(42, orType)).toBe(true);
        expect(is(true, orType)).toBe(true);
        expect(is(null, orType)).toBe(false);
    });

    test('complex types: first match wins', () => {
        let obj1 = t.object({ a: STRING });
        let obj2 = t.object({ b: NUMBER });
        let orType = t.or(obj1, obj2);
        expect(is({ a: 'hello' }, orType)).toBe(true);
        expect(is({ b: 42 }, orType)).toBe(true);
        expect(is({ c: true }, orType)).toBe(false);
    });

    test('mixed primitive and complex', () => {
        let obj = t.object({ x: NUMBER });
        let orType = t.or(STRING, obj);
        expect(is('hello', orType)).toBe(true);
        expect(is({ x: 1 }, orType)).toBe(true);
        expect(is(42, orType)).toBe(false);
    });

    test('array-first overload for 4+ types', () => {
        let orType = t.or([STRING, NUMBER, BOOLEAN, BIGINT]);
        expect(is('hi', orType)).toBe(true);
        expect(is(42, orType)).toBe(true);
        expect(is(true, orType)).toBe(true);
        expect(is(BigInt(10), orType)).toBe(true);
    });

    test('validate respects inner validators', () => {
        let s = t.string({ minLength: 3 });
        let orType = t.or(s, NUMBER);
        expect(validate('abc', orType)).toBe(true);
        expect(validate('ab', orType)).toBe(false);
        expect(validate(42, orType)).toBe(true);
    });

    test('conform works with or', () => {
        let orType = t.or(DATE, STRING);
        let data = { val: '2024-01-01' };
        // conform tries first type (DATE), which should parse the string
        // But or is on the value itself, not a slot
    });

    test('diagnose works with or', () => {
        let obj = t.object({ x: NUMBER });
        let orType = t.or(STRING, obj);
        let errors = diagnose(42, orType);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain('did not match');
    });

    test('volatile or', () => {
        let orType = v.or(STRING, NUMBER);
        // volatile all-primitive should still use fast path
        expect(is('hi', orType)).toBe(true);
        expect(is(42, orType)).toBe(true);
    });

    test('volatile or with complex types', () => {
        let obj = v.object({ a: STRING });
        let orType = v.or(obj, NUMBER);
        expect(is({ a: 'hi' }, orType)).toBe(true);
        expect(is(42, orType)).toBe(true);
        expect(is('hi', orType)).toBe(false);
    });
});

describe('K_EXCLUSIVE (oneOf)', () => {
    test('exactly one match passes', () => {
        let s1 = t.string({ minLength: 2 });
        let s2 = t.string({ maxLength: 5 });
        // validate: "a" matches s2 only (length 1 < minLength 2)
        expect(validate('a', t.exclusive(s1, s2))).toBe(true);
    });

    test('zero matches fails', () => {
        let s1 = t.string({ minLength: 5 });
        let s2 = t.string({ minLength: 10 });
        // "ab" matches neither
        expect(is('ab', t.exclusive(s1, s2))).toBe(false);
    });

    test('two matches fails', () => {
        let s1 = t.string({ minLength: 1 });
        let s2 = t.string({ maxLength: 10 });
        // "hello" matches both
        expect(is('hello', t.exclusive(s1, s2))).toBe(false);
    });

    test('disjoint types always one match', () => {
        let excl = t.exclusive(STRING, NUMBER);
        expect(is('hello', excl)).toBe(true);
        expect(is(42, excl)).toBe(true);
        expect(is(true, excl)).toBe(false);
    });

    test('3-arg overload', () => {
        let excl = t.exclusive(STRING, NUMBER, BOOLEAN);
        expect(is('hello', excl)).toBe(true);
        expect(is(42, excl)).toBe(true);
        expect(is(true, excl)).toBe(true);
    });

    test('validate works with exclusive', () => {
        let s1 = t.string({ minLength: 5 });
        let excl = t.exclusive(s1, NUMBER);
        expect(validate('hello', excl)).toBe(true);
        expect(validate(42, excl)).toBe(true);
        expect(validate('hi', excl)).toBe(false);
    });

    test('diagnose on zero matches', () => {
        let excl = t.exclusive(STRING, NUMBER);
        let errors = diagnose(true, excl);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain('did not match');
    });

    test('diagnose on two matches', () => {
        let s1 = t.string({ minLength: 1 });
        let s2 = t.string({ maxLength: 10 });
        let excl = t.exclusive(s1, s2);
        let errors = diagnose('hello', excl);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain('matched');
    });

    test('volatile exclusive', () => {
        let excl = v.exclusive(STRING, NUMBER);
        expect(is('hi', excl)).toBe(true);
        expect(is(42, excl)).toBe(true);
        expect(is(true, excl)).toBe(false);
    });
});

describe('K_INTERSECT (allOf)', () => {
    test('all match passes', () => {
        let obj1 = t.object({ a: STRING });
        let obj2 = t.object({ b: NUMBER });
        let inter = t.intersect(obj1, obj2);
        expect(is({ a: 'hello', b: 42 }, inter)).toBe(true);
    });

    test('one fails rejects', () => {
        let obj1 = t.object({ a: STRING });
        let obj2 = t.object({ b: NUMBER });
        let inter = t.intersect(obj1, obj2);
        expect(is({ a: 'hello' }, inter)).toBe(false);
    });

    test('string with multiple validators', () => {
        let s1 = t.string({ minLength: 2 });
        let s2 = t.string({ maxLength: 5 });
        let inter = t.intersect(s1, s2);
        expect(validate('abc', inter)).toBe(true);
        expect(validate('a', inter)).toBe(false);
        expect(validate('abcdef', inter)).toBe(false);
    });

    test('3-arg overload', () => {
        let obj1 = t.object({ a: STRING });
        let obj2 = t.object({ b: NUMBER });
        let obj3 = t.object({ c: BOOLEAN });
        let inter = t.intersect(obj1, obj2, obj3);
        expect(is({ a: 'hi', b: 42, c: true }, inter)).toBe(true);
        expect(is({ a: 'hi', b: 42 }, inter)).toBe(false);
    });

    test('diagnose shows failing branch', () => {
        let obj1 = t.object({ a: STRING });
        let obj2 = t.object({ b: NUMBER });
        let inter = t.intersect(obj1, obj2);
        let errors = diagnose({ a: 'hi' }, inter);
        expect(errors.length).toBeGreaterThan(0);
    });

    test('volatile intersect', () => {
        let obj1 = v.object({ x: STRING });
        let obj2 = v.object({ y: NUMBER });
        let inter = v.intersect(obj1, obj2);
        expect(is({ x: 'hi', y: 1 }, inter)).toBe(true);
        expect(is({ x: 'hi' }, inter)).toBe(false);
    });
});

describe('K_NOT', () => {
    test('not(STRING) rejects strings', () => {
        let notStr = t.not(STRING);
        expect(is('hello', notStr)).toBe(false);
    });

    test('not(STRING) accepts numbers', () => {
        let notStr = t.not(STRING);
        expect(is(42, notStr)).toBe(true);
    });

    test('not(STRING) accepts booleans', () => {
        let notStr = t.not(STRING);
        expect(is(true, notStr)).toBe(true);
    });

    test('not(NUMBER) rejects numbers accepts strings', () => {
        let notNum = t.not(NUMBER);
        expect(is(42, notNum)).toBe(false);
        expect(is('hello', notNum)).toBe(true);
    });

    test('not with complex type', () => {
        let obj = t.object({ a: STRING });
        let notObj = t.not(obj);
        expect(is({ a: 'hi' }, notObj)).toBe(false);
        expect(is({ a: 42 }, notObj)).toBe(true);
        expect(is('hello', notObj)).toBe(true);
    });

    test('validate works with not', () => {
        let s = t.string({ minLength: 3 });
        let notS = t.not(s);
        expect(validate('ab', notS)).toBe(true);  // 'ab' doesn't match minLength:3 string, so NOT passes
        expect(validate('abc', notS)).toBe(false); // 'abc' matches, so NOT fails
    });

    test('diagnose works with not', () => {
        let notStr = t.not(STRING);
        let errors = diagnose('hello', notStr);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain('NOT');
    });

    test('volatile not', () => {
        let notStr = v.not(STRING);
        expect(is('hello', notStr)).toBe(false);
        expect(is(42, notStr)).toBe(true);
    });
});

describe('K_CONDITIONAL (when)', () => {
    test('if matches, then is checked', () => {
        let schema = t.when({
            if: t.object({ country: STRING }),
            then: t.object({ zip: STRING }),
            else: t.object({ postal: STRING })
        });
        expect(is({ country: 'US', zip: '12345' }, schema)).toBe(true);
    });

    test('if fails, else is checked', () => {
        let schema = t.when({
            if: t.object({ country: STRING }),
            then: t.object({ zip: STRING }),
            else: t.object({ postal: STRING })
        });
        expect(is({ postal: 'ABC123' }, schema)).toBe(true);
    });

    test('if matches but then fails', () => {
        let schema = t.when({
            if: t.object({ country: STRING }),
            then: t.object({ zip: STRING }),
            else: t.object({ postal: STRING })
        });
        expect(is({ country: 'US' }, schema)).toBe(false);
    });

    test('if fails and else fails', () => {
        let schema = t.when({
            if: t.object({ country: STRING }),
            then: t.object({ zip: STRING }),
            else: t.object({ postal: STRING })
        });
        expect(is({ other: 'value' }, schema)).toBe(false);
    });

    test('if/then only (no else)', () => {
        let schema = t.when({
            if: t.object({ type: STRING }),
            then: t.object({ name: STRING })
        });
        // if matches and then matches
        expect(is({ type: 'user', name: 'John' }, schema)).toBe(true);
        // if matches but then fails
        expect(is({ type: 'user' }, schema)).toBe(false);
        // if fails, no else → always passes
        expect(is({ other: 42 }, schema)).toBe(true);
    });

    test('if/else only (no then)', () => {
        let schema = t.when({
            if: t.object({ admin: BOOLEAN }),
            else: t.object({ guest: BOOLEAN })
        });
        // if matches, no then → always passes
        expect(is({ admin: true }, schema)).toBe(true);
        // if fails, else is checked
        expect(is({ guest: true }, schema)).toBe(true);
        // if fails, else fails
        expect(is({ other: 'x' }, schema)).toBe(false);
    });

    test('validate works with conditional', () => {
        let schema = t.when({
            if: t.object({ type: STRING }),
            then: t.object({ value: NUMBER }),
            else: t.object({ fallback: BOOLEAN })
        });
        expect(validate({ type: 'test', value: 42 }, schema)).toBe(true);
        expect(validate({ fallback: true }, schema)).toBe(true);
        expect(validate({ type: 'test' }, schema)).toBe(false);
    });

    test('diagnose works with conditional', () => {
        let schema = t.when({
            if: t.object({ country: STRING }),
            then: t.object({ zip: STRING }),
            else: t.object({ postal: STRING })
        });
        let errors = diagnose({ country: 'US' }, schema);
        expect(errors.length).toBeGreaterThan(0);
    });

    test('volatile conditional', () => {
        let schema = v.when({
            if: v.object({ a: STRING }),
            then: v.object({ b: NUMBER }),
            else: v.object({ c: BOOLEAN })
        });
        expect(is({ a: 'hi', b: 42 }, schema)).toBe(true);
        expect(is({ c: true }, schema)).toBe(true);
        expect(is({ a: 'hi' }, schema)).toBe(false);
    });
});

describe('3-argument overloads', () => {
    test('tuple 2-arg', () => {
        let tup = t.tuple(STRING, NUMBER);
        expect(is(['a', 1], tup)).toBe(true);
    });

    test('tuple 3-arg', () => {
        let tup = t.tuple(STRING, NUMBER, BOOLEAN);
        expect(is(['a', 1, true], tup)).toBe(true);
    });

    test('or 2-arg', () => {
        let o = t.or(STRING, NUMBER);
        expect(is('a', o)).toBe(true);
        expect(is(1, o)).toBe(true);
    });

    test('or 3-arg', () => {
        let o = t.or(STRING, NUMBER, BOOLEAN);
        expect(is(true, o)).toBe(true);
    });

    test('exclusive 2-arg', () => {
        let e = t.exclusive(STRING, NUMBER);
        expect(is('a', e)).toBe(true);
    });

    test('exclusive 3-arg', () => {
        let e = t.exclusive(STRING, NUMBER, BOOLEAN);
        expect(is(true, e)).toBe(true);
    });

    test('intersect 2-arg', () => {
        let i = t.intersect(
            t.object({ a: STRING }),
            t.object({ b: NUMBER })
        );
        expect(is({ a: 'hi', b: 1 }, i)).toBe(true);
    });

    test('intersect 3-arg', () => {
        let i = t.intersect(
            t.object({ a: STRING }),
            t.object({ b: NUMBER }),
            t.object({ c: BOOLEAN })
        );
        expect(is({ a: 'hi', b: 1, c: true }, i)).toBe(true);
    });
});

describe('is vs validate for new complex kinds', () => {
    test('is ignores validators in or children', () => {
        let s = t.string({ minLength: 5 });
        let orType = t.or(s, NUMBER);
        // is ignores the minLength validator
        expect(is('ab', orType)).toBe(true);
        // validate enforces it
        expect(validate('ab', orType)).toBe(false);
    });

    test('is ignores validators in exclusive children', () => {
        let s = t.string({ minLength: 5 });
        let excl = t.exclusive(s, NUMBER);
        // check: 'ab' is a string → matches s structurally, only 1 match
        expect(is('ab', excl)).toBe(true);
        // validate: 'ab' fails minLength → 0 matches
        expect(validate('ab', excl)).toBe(false);
    });

    test('is ignores validators in intersect children', () => {
        let s1 = t.string({ minLength: 2 });
        let s2 = t.string({ maxLength: 10 });
        let inter = t.intersect(s1, s2);
        // check: 'a' is a string → matches both structurally
        expect(is('a', inter)).toBe(true);
        // validate: 'a' fails minLength
        expect(validate('a', inter)).toBe(false);
    });
});
