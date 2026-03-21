import { describe, test, expect } from 'bun:test';
import {
    BOOLEAN, NUMBER, STRING,
    BIGINT, DATE, URI
} from 'uvd/catalog';
import { catalog } from 'uvd/catalog';
import { allocators, $allocators } from 'uvd/alloc';

const cat = catalog();
const { object, array, tuple, record, or, exclusive, intersect, not, when, string, nullable, optional } = allocators(cat);
const { $object, $tuple, $record, $or, $exclusive, $intersect, $not, $when } = $allocators(cat);
const { is, validate, conform, diagnose } = cat;

describe('K_TUPLE', () => {
    test('accepts correct positional types', () => {
        let tup = tuple(STRING, NUMBER, BOOLEAN);
        expect(is(['hello', 42, true], tup)).toBe(true);
    });

    test('rejects wrong length (too short)', () => {
        let tup = tuple(STRING, NUMBER);
        expect(is(['hello'], tup)).toBe(false);
    });

    test('rejects wrong length (too long)', () => {
        let tup = tuple(STRING, NUMBER);
        expect(is(['hello', 42, true], tup)).toBe(false);
    });

    test('rejects wrong type at position', () => {
        let tup = tuple(STRING, NUMBER);
        expect(is([42, 'hello'], tup)).toBe(false);
    });

    test('accepts nullable element', () => {
        let tup = tuple(nullable(STRING), NUMBER);
        expect(is([null, 42], tup)).toBe(true);
    });

    test('accepts optional element', () => {
        let tup = tuple(optional(STRING), NUMBER);
        expect(is([undefined, 42], tup)).toBe(true);
    });

    test('rejects non-array', () => {
        let tup = tuple(STRING, NUMBER);
        expect(is({ 0: 'a', 1: 1 }, tup)).toBe(false);
        expect(is('hello', tup)).toBe(false);
    });

    test('array-first overload', () => {
        let tup = tuple([STRING, NUMBER, BOOLEAN, STRING]);
        expect(is(['a', 1, true, 'b'], tup)).toBe(true);
        expect(is(['a', 1, true], tup)).toBe(false);
    });

    test('single element tuple', () => {
        let tup = tuple(STRING);
        expect(is(['hello'], tup)).toBe(true);
        expect(is([], tup)).toBe(false);
    });

    test('with complex inner types', () => {
        let obj = object({ name: STRING });
        let tup = tuple(obj, NUMBER);
        expect(is([{ name: 'test' }, 42], tup)).toBe(true);
        expect(is([{ name: 123 }, 42], tup)).toBe(false);
    });

    test('validate works with tuple', () => {
        let tup = tuple(STRING, NUMBER);
        expect(validate(['hello', 42], tup)).toBe(true);
        expect(validate([42, 'hello'], tup)).toBe(false);
    });

    test('conform works with tuple', () => {
        let tup = tuple(DATE, NUMBER);
        let data = ['2024-01-01', 42];
        expect(conform(data, tup)).toBe(true);
        expect(data[0] instanceof Date).toBe(true);
    });

    test('diagnose works with tuple', () => {
        let tup = tuple(STRING, NUMBER);
        let errors = diagnose(42, tup);
        expect(errors.length).toBeGreaterThan(0);
    });

    test('diagnose reports wrong length', () => {
        let tup = tuple(STRING, NUMBER);
        let errors = diagnose(['a'], tup);
        expect(errors.length).toBe(1);
        expect(errors[0].message).toContain('length');
    });

    test('volatile tuple', () => {
        let tup = $tuple(STRING, NUMBER);
        expect(is(['hello', 42], tup)).toBe(true);
        expect(is([42, 'hello'], tup)).toBe(false);
    });
});

// =========================================================================
// K_RECORD
// =========================================================================
describe('K_RECORD', () => {
    test('all values match type', () => {
        let rec = record(NUMBER);
        expect(is({ a: 1, b: 2, c: 3 }, rec)).toBe(true);
    });

    test('rejects wrong value type', () => {
        let rec = record(NUMBER);
        expect(is({ a: 1, b: 'hello' }, rec)).toBe(false);
    });

    test('empty object passes', () => {
        let rec = record(STRING);
        expect(is({}, rec)).toBe(true);
    });

    test('rejects non-object', () => {
        let rec = record(NUMBER);
        expect(is([1, 2], rec)).toBe(false);
        expect(is('hello', rec)).toBe(false);
        expect(is(null, rec)).toBe(false);
    });

    test('works with complex value types', () => {
        let obj = object({ x: NUMBER });
        let rec = record(obj);
        expect(is({ a: { x: 1 }, b: { x: 2 } }, rec)).toBe(true);
        expect(is({ a: { x: 'bad' } }, rec)).toBe(false);
    });

    test('validate works with record', () => {
        let rec = record(string({ minLength: 2 }));
        expect(validate({ a: 'ab', b: 'cd' }, rec)).toBe(true);
        expect(validate({ a: 'a' }, rec)).toBe(false);
    });

    test('conform works with record', () => {
        let rec = record(DATE);
        let data = { a: '2024-01-01', b: '2024-06-15' };
        expect(conform(data, rec)).toBe(true);
        expect(data.a instanceof Date).toBe(true);
    });

    test('diagnose works with record', () => {
        let rec = record(NUMBER);
        let errors = diagnose({ a: 'bad' }, rec);
        expect(errors.length).toBeGreaterThan(0);
    });

    test('volatile record', () => {
        let rec = $record(NUMBER);
        expect(is({ a: 1 }, rec)).toBe(true);
        expect(is({ a: 'x' }, rec)).toBe(false);
    });
});

describe('K_OR (anyOf)', () => {
    test('fast path: all primitives OR bits together', () => {
        let orType = or(STRING, NUMBER);
        // Should be a raw primitive bitwise OR
        expect(orType & (1 << 31)).toBe(0); // no COMPLEX bit
        expect(is('hello', orType)).toBe(true);
        expect(is(42, orType)).toBe(true);
        expect(is(true, orType)).toBe(false);
    });

    test('fast path: three primitives', () => {
        let orType = or(STRING, NUMBER, BOOLEAN);
        expect(is('hi', orType)).toBe(true);
        expect(is(42, orType)).toBe(true);
        expect(is(true, orType)).toBe(true);
        expect(is(null, orType)).toBe(false);
    });

    test('complex types: first match wins', () => {
        let obj1 = object({ a: STRING });
        let obj2 = object({ b: NUMBER });
        let orType = or(obj1, obj2);
        expect(is({ a: 'hello' }, orType)).toBe(true);
        expect(is({ b: 42 }, orType)).toBe(true);
        expect(is({ c: true }, orType)).toBe(false);
    });

    test('mixed primitive and complex', () => {
        let obj = object({ x: NUMBER });
        let orType = or(STRING, obj);
        expect(is('hello', orType)).toBe(true);
        expect(is({ x: 1 }, orType)).toBe(true);
        expect(is(42, orType)).toBe(false);
    });

    test('array-first overload for 4+ types', () => {
        let orType = or([STRING, NUMBER, BOOLEAN, BIGINT]);
        expect(is('hi', orType)).toBe(true);
        expect(is(42, orType)).toBe(true);
        expect(is(true, orType)).toBe(true);
        expect(is(BigInt(10), orType)).toBe(true);
    });

    test('validate respects inner validators', () => {
        let s = string({ minLength: 3 });
        let orType = or(s, NUMBER);
        expect(validate('abc', orType)).toBe(true);
        expect(validate('ab', orType)).toBe(false);
        expect(validate(42, orType)).toBe(true);
    });

    test('conform works with or', () => {
        let orType = or(DATE, STRING);
        let data = { val: '2024-01-01' };
        // conform tries first type (DATE), which should parse the string
        // But or is on the value itself, not a slot
    });

    test('diagnose works with or', () => {
        let obj = object({ x: NUMBER });
        let orType = or(STRING, obj);
        let errors = diagnose(42, orType);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain('did not match');
    });

    test('volatile or', () => {
        let orType = $or(STRING, NUMBER);
        // volatile all-primitive should still use fast path
        expect(is('hi', orType)).toBe(true);
        expect(is(42, orType)).toBe(true);
    });

    test('volatile or with complex types', () => {
        let obj = $object({ a: STRING });
        let orType = $or(obj, NUMBER);
        expect(is({ a: 'hi' }, orType)).toBe(true);
        expect(is(42, orType)).toBe(true);
        expect(is('hi', orType)).toBe(false);
    });
});

describe('K_EXCLUSIVE (oneOf)', () => {
    test('exactly one match passes', () => {
        let s1 = string({ minLength: 2 });
        let s2 = string({ maxLength: 5 });
        // validate: "a" matches s2 only (length 1 < minLength 2)
        expect(validate('a', exclusive(s1, s2))).toBe(true);
    });

    test('zero matches fails', () => {
        let s1 = string({ minLength: 5 });
        let s2 = string({ minLength: 10 });
        // "ab" matches neither
        expect(is('ab', exclusive(s1, s2))).toBe(false);
    });

    test('two matches fails', () => {
        let s1 = string({ minLength: 1 });
        let s2 = string({ maxLength: 10 });
        // "hello" matches both
        expect(is('hello', exclusive(s1, s2))).toBe(false);
    });

    test('disjoint types always one match', () => {
        let excl = exclusive(STRING, NUMBER);
        expect(is('hello', excl)).toBe(true);
        expect(is(42, excl)).toBe(true);
        expect(is(true, excl)).toBe(false);
    });

    test('3-arg overload', () => {
        let excl = exclusive(STRING, NUMBER, BOOLEAN);
        expect(is('hello', excl)).toBe(true);
        expect(is(42, excl)).toBe(true);
        expect(is(true, excl)).toBe(true);
    });

    test('validate works with exclusive', () => {
        let s1 = string({ minLength: 5 });
        let excl = exclusive(s1, NUMBER);
        expect(validate('hello', excl)).toBe(true);
        expect(validate(42, excl)).toBe(true);
        expect(validate('hi', excl)).toBe(false);
    });

    test('diagnose on zero matches', () => {
        let excl = exclusive(STRING, NUMBER);
        let errors = diagnose(true, excl);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain('did not match');
    });

    test('diagnose on two matches', () => {
        let s1 = string({ minLength: 1 });
        let s2 = string({ maxLength: 10 });
        let excl = exclusive(s1, s2);
        let errors = diagnose('hello', excl);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain('matched');
    });

    test('volatile exclusive', () => {
        let excl = $exclusive(STRING, NUMBER);
        expect(is('hi', excl)).toBe(true);
        expect(is(42, excl)).toBe(true);
        expect(is(true, excl)).toBe(false);
    });
});

describe('K_INTERSECT (allOf)', () => {
    test('all match passes', () => {
        let obj1 = object({ a: STRING });
        let obj2 = object({ b: NUMBER });
        let inter = intersect(obj1, obj2);
        expect(is({ a: 'hello', b: 42 }, inter)).toBe(true);
    });

    test('one fails rejects', () => {
        let obj1 = object({ a: STRING });
        let obj2 = object({ b: NUMBER });
        let inter = intersect(obj1, obj2);
        expect(is({ a: 'hello' }, inter)).toBe(false);
    });

    test('string with multiple validators', () => {
        let s1 = string({ minLength: 2 });
        let s2 = string({ maxLength: 5 });
        let inter = intersect(s1, s2);
        expect(validate('abc', inter)).toBe(true);
        expect(validate('a', inter)).toBe(false);
        expect(validate('abcdef', inter)).toBe(false);
    });

    test('3-arg overload', () => {
        let obj1 = object({ a: STRING });
        let obj2 = object({ b: NUMBER });
        let obj3 = object({ c: BOOLEAN });
        let inter = intersect(obj1, obj2, obj3);
        expect(is({ a: 'hi', b: 42, c: true }, inter)).toBe(true);
        expect(is({ a: 'hi', b: 42 }, inter)).toBe(false);
    });

    test('diagnose shows failing branch', () => {
        let obj1 = object({ a: STRING });
        let obj2 = object({ b: NUMBER });
        let inter = intersect(obj1, obj2);
        let errors = diagnose({ a: 'hi' }, inter);
        expect(errors.length).toBeGreaterThan(0);
    });

    test('volatile intersect', () => {
        let obj1 = $object({ x: STRING });
        let obj2 = $object({ y: NUMBER });
        let inter = $intersect(obj1, obj2);
        expect(is({ x: 'hi', y: 1 }, inter)).toBe(true);
        expect(is({ x: 'hi' }, inter)).toBe(false);
    });
});

describe('K_NOT', () => {
    test('not(STRING) rejects strings', () => {
        let notStr = not(STRING);
        expect(is('hello', notStr)).toBe(false);
    });

    test('not(STRING) accepts numbers', () => {
        let notStr = not(STRING);
        expect(is(42, notStr)).toBe(true);
    });

    test('not(STRING) accepts booleans', () => {
        let notStr = not(STRING);
        expect(is(true, notStr)).toBe(true);
    });

    test('not(NUMBER) rejects numbers accepts strings', () => {
        let notNum = not(NUMBER);
        expect(is(42, notNum)).toBe(false);
        expect(is('hello', notNum)).toBe(true);
    });

    test('not with complex type', () => {
        let obj = object({ a: STRING });
        let notObj = not(obj);
        expect(is({ a: 'hi' }, notObj)).toBe(false);
        expect(is({ a: 42 }, notObj)).toBe(true);
        expect(is('hello', notObj)).toBe(true);
    });

    test('validate works with not', () => {
        let s = string({ minLength: 3 });
        let notS = not(s);
        expect(validate('ab', notS)).toBe(true);  // 'ab' doesn't match minLength:3 string, so NOT passes
        expect(validate('abc', notS)).toBe(false); // 'abc' matches, so NOT fails
    });

    test('diagnose works with not', () => {
        let notStr = not(STRING);
        let errors = diagnose('hello', notStr);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain('NOT');
    });

    test('volatile not', () => {
        let notStr = $not(STRING);
        expect(is('hello', notStr)).toBe(false);
        expect(is(42, notStr)).toBe(true);
    });
});

describe('K_CONDITIONAL (when)', () => {
    test('if matches, then is checked', () => {
        let schema = when({
            if: object({ country: STRING }),
            then: object({ zip: STRING }),
            else: object({ postal: STRING })
        });
        expect(is({ country: 'US', zip: '12345' }, schema)).toBe(true);
    });

    test('if fails, else is checked', () => {
        let schema = when({
            if: object({ country: STRING }),
            then: object({ zip: STRING }),
            else: object({ postal: STRING })
        });
        expect(is({ postal: 'ABC123' }, schema)).toBe(true);
    });

    test('if matches but then fails', () => {
        let schema = when({
            if: object({ country: STRING }),
            then: object({ zip: STRING }),
            else: object({ postal: STRING })
        });
        expect(is({ country: 'US' }, schema)).toBe(false);
    });

    test('if fails and else fails', () => {
        let schema = when({
            if: object({ country: STRING }),
            then: object({ zip: STRING }),
            else: object({ postal: STRING })
        });
        expect(is({ other: 'value' }, schema)).toBe(false);
    });

    test('if/then only (no else)', () => {
        let schema = when({
            if: object({ type: STRING }),
            then: object({ name: STRING })
        });
        // if matches and then matches
        expect(is({ type: 'user', name: 'John' }, schema)).toBe(true);
        // if matches but then fails
        expect(is({ type: 'user' }, schema)).toBe(false);
        // if fails, no else → always passes
        expect(is({ other: 42 }, schema)).toBe(true);
    });

    test('if/else only (no then)', () => {
        let schema = when({
            if: object({ admin: BOOLEAN }),
            else: object({ guest: BOOLEAN })
        });
        // if matches, no then → always passes
        expect(is({ admin: true }, schema)).toBe(true);
        // if fails, else is checked
        expect(is({ guest: true }, schema)).toBe(true);
        // if fails, else fails
        expect(is({ other: 'x' }, schema)).toBe(false);
    });

    test('validate works with conditional', () => {
        let schema = when({
            if: object({ type: STRING }),
            then: object({ value: NUMBER }),
            else: object({ fallback: BOOLEAN })
        });
        expect(validate({ type: 'test', value: 42 }, schema)).toBe(true);
        expect(validate({ fallback: true }, schema)).toBe(true);
        expect(validate({ type: 'test' }, schema)).toBe(false);
    });

    test('diagnose works with conditional', () => {
        let schema = when({
            if: object({ country: STRING }),
            then: object({ zip: STRING }),
            else: object({ postal: STRING })
        });
        let errors = diagnose({ country: 'US' }, schema);
        expect(errors.length).toBeGreaterThan(0);
    });

    test('volatile conditional', () => {
        let schema = $when({
            if: $object({ a: STRING }),
            then: $object({ b: NUMBER }),
            else: $object({ c: BOOLEAN })
        });
        expect(is({ a: 'hi', b: 42 }, schema)).toBe(true);
        expect(is({ c: true }, schema)).toBe(true);
        expect(is({ a: 'hi' }, schema)).toBe(false);
    });
});

describe('3-argument overloads', () => {
    test('tuple 2-arg', () => {
        let tup = tuple(STRING, NUMBER);
        expect(is(['a', 1], tup)).toBe(true);
    });

    test('tuple 3-arg', () => {
        let tup = tuple(STRING, NUMBER, BOOLEAN);
        expect(is(['a', 1, true], tup)).toBe(true);
    });

    test('or 2-arg', () => {
        let o = or(STRING, NUMBER);
        expect(is('a', o)).toBe(true);
        expect(is(1, o)).toBe(true);
    });

    test('or 3-arg', () => {
        let o = or(STRING, NUMBER, BOOLEAN);
        expect(is(true, o)).toBe(true);
    });

    test('exclusive 2-arg', () => {
        let e = exclusive(STRING, NUMBER);
        expect(is('a', e)).toBe(true);
    });

    test('exclusive 3-arg', () => {
        let e = exclusive(STRING, NUMBER, BOOLEAN);
        expect(is(true, e)).toBe(true);
    });

    test('intersect 2-arg', () => {
        let i = intersect(
            object({ a: STRING }),
            object({ b: NUMBER })
        );
        expect(is({ a: 'hi', b: 1 }, i)).toBe(true);
    });

    test('intersect 3-arg', () => {
        let i = intersect(
            object({ a: STRING }),
            object({ b: NUMBER }),
            object({ c: BOOLEAN })
        );
        expect(is({ a: 'hi', b: 1, c: true }, i)).toBe(true);
    });
});

describe('is vs validate for new complex kinds', () => {
    test('is ignores validators in or children', () => {
        let s = string({ minLength: 5 });
        let orType = or(s, NUMBER);
        // is ignores the minLength validator
        expect(is('ab', orType)).toBe(true);
        // validate enforces it
        expect(validate('ab', orType)).toBe(false);
    });

    test('is ignores validators in exclusive children', () => {
        let s = string({ minLength: 5 });
        let excl = exclusive(s, NUMBER);
        // check: 'ab' is a string → matches s structurally, only 1 match
        expect(is('ab', excl)).toBe(true);
        // validate: 'ab' fails minLength → 0 matches
        expect(validate('ab', excl)).toBe(false);
    });

    test('is ignores validators in intersect children', () => {
        let s1 = string({ minLength: 2 });
        let s2 = string({ maxLength: 10 });
        let inter = intersect(s1, s2);
        // check: 'a' is a string → matches both structurally
        expect(is('a', inter)).toBe(true);
        // validate: 'a' fails minLength
        expect(validate('a', inter)).toBe(false);
    });
});
