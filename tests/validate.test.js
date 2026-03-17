import { describe, test, expect } from 'bun:test';
import {
    BOOLEAN, NUMBER, STRING, BIGINT, DATE, URI,
    nullable, optional, registry
} from '../';

const { t, v, check, validate } = registry();

describe('validate: primitive builders — no args', () => {
    test('t.string() returns STRING constant', () => {
        expect(t.string()).toBe(STRING);
    });
    test('t.number() returns NUMBER constant', () => {
        expect(t.number()).toBe(NUMBER);
    });
    test('t.boolean() returns BOOLEAN constant', () => {
        expect(t.boolean()).toBe(BOOLEAN);
    });
    test('t.bigint() returns BIGINT constant', () => {
        expect(t.bigint()).toBe(BIGINT);
    });
    test('t.date() returns DATE constant', () => {
        expect(t.date()).toBe(DATE);
    });
    test('t.uri() returns URI constant', () => {
        expect(t.uri()).toBe(URI);
    });
});

describe('validate: primitive builders — with validators', () => {
    test('t.string({minLength}) returns a COMPLEX typedef', () => {
        let td = t.string({ minLength: 5 });
        expect(td >>> 31).toBe(1);
    });
    test('t.number({minimum}) returns a COMPLEX typedef', () => {
        let td = t.number({ minimum: 0 });
        expect(td >>> 31).toBe(1);
    });
});

describe('validate: check() ignores validators', () => {
    test('check passes structural type even if validator would fail', () => {
        let td = t.string({ minLength: 5 });
        expect(check('hi', td)).toBe(true);
        expect(check('hello world', td)).toBe(true);
        expect(check(42, td)).toBe(false);
    });
    test('check passes number even if below minimum', () => {
        let td = t.number({ minimum: 10 });
        expect(check(5, td)).toBe(true);
        expect(check('not a number', td)).toBe(false);
    });
});

describe('validate: string validators', () => {
    test('minLength', () => {
        let td = t.string({ minLength: 3 });
        expect(validate('abc', td)).toBe(true);
        expect(validate('abcd', td)).toBe(true);
        expect(validate('ab', td)).toBe(false);
        expect(validate('', td)).toBe(false);
    });
    test('maxLength', () => {
        let td = t.string({ maxLength: 5 });
        expect(validate('hello', td)).toBe(true);
        expect(validate('hi', td)).toBe(true);
        expect(validate('toolong', td)).toBe(false);
    });
    test('minLength + maxLength combined', () => {
        let td = t.string({ minLength: 2, maxLength: 5 });
        expect(validate('ab', td)).toBe(true);
        expect(validate('hello', td)).toBe(true);
        expect(validate('a', td)).toBe(false);
        expect(validate('toolong', td)).toBe(false);
    });
    test('pattern', () => {
        let td = t.string({ pattern: /^[a-z]+$/ });
        expect(validate('abc', td)).toBe(true);
        expect(validate('ABC', td)).toBe(false);
        expect(validate('abc123', td)).toBe(false);
    });
    test('minLength + pattern combined', () => {
        let td = t.string({ minLength: 2, pattern: /^[a-z]+$/ });
        expect(validate('ab', td)).toBe(true);
        expect(validate('a', td)).toBe(false);
        expect(validate('AB', td)).toBe(false);
    });
    test('wrong type fails validate', () => {
        let td = t.string({ minLength: 1 });
        expect(validate(42, td)).toBe(false);
        expect(validate(null, td)).toBe(false);
        expect(validate(undefined, td)).toBe(false);
    });
});

describe('validate: number validators', () => {
    test('minimum', () => {
        let td = t.number({ minimum: 0 });
        expect(validate(0, td)).toBe(true);
        expect(validate(10, td)).toBe(true);
        expect(validate(-1, td)).toBe(false);
    });
    test('maximum', () => {
        let td = t.number({ maximum: 100 });
        expect(validate(100, td)).toBe(true);
        expect(validate(50, td)).toBe(true);
        expect(validate(101, td)).toBe(false);
    });
    test('minimum + maximum range', () => {
        let td = t.number({ minimum: 1, maximum: 10 });
        expect(validate(1, td)).toBe(true);
        expect(validate(5, td)).toBe(true);
        expect(validate(10, td)).toBe(true);
        expect(validate(0, td)).toBe(false);
        expect(validate(11, td)).toBe(false);
    });
    test('exclusiveMinimum', () => {
        let td = t.number({ exclusiveMinimum: 0 });
        expect(validate(1, td)).toBe(true);
        expect(validate(0, td)).toBe(false);
    });
    test('exclusiveMaximum', () => {
        let td = t.number({ exclusiveMaximum: 10 });
        expect(validate(9, td)).toBe(true);
        expect(validate(10, td)).toBe(false);
    });
    test('multipleOf', () => {
        let td = t.number({ multipleOf: 3 });
        expect(validate(9, td)).toBe(true);
        expect(validate(6, td)).toBe(true);
        expect(validate(0, td)).toBe(true);
        expect(validate(7, td)).toBe(false);
    });
    test('wrong type fails validate', () => {
        let td = t.number({ minimum: 0 });
        expect(validate('hello', td)).toBe(false);
        expect(validate(null, td)).toBe(false);
    });
});

describe('validate: array validators', () => {
    test('minItems', () => {
        let td = t.array(STRING, { minItems: 2 });
        expect(validate(['a', 'b'], td)).toBe(true);
        expect(validate(['a', 'b', 'c'], td)).toBe(true);
        expect(validate(['a'], td)).toBe(false);
        expect(validate([], td)).toBe(false);
    });
    test('maxItems', () => {
        let td = t.array(STRING, { maxItems: 3 });
        expect(validate(['a', 'b', 'c'], td)).toBe(true);
        expect(validate(['a'], td)).toBe(true);
        expect(validate(['a', 'b', 'c', 'd'], td)).toBe(false);
    });
    test('uniqueItems', () => {
        let td = t.array(NUMBER, { uniqueItems: true });
        expect(validate([1, 2, 3], td)).toBe(true);
        expect(validate([1, 2, 2], td)).toBe(false);
    });
    test('check ignores array validators', () => {
        let td = t.array(STRING, { minItems: 5 });
        expect(check(['a'], td)).toBe(true);
        expect(check([], td)).toBe(true);
    });
    test('array element type still checked', () => {
        let td = t.array(STRING, { minItems: 1 });
        expect(validate([42], td)).toBe(false);
    });
});

describe('validate: object validators', () => {
    test('minProperties', () => {
        let td = t.object({ name: STRING, age: NUMBER }, { minProperties: 2 });
        expect(validate({ name: 'Alice', age: 30 }, td)).toBe(true);
    });
    test('maxProperties', () => {
        let td = t.object({ name: STRING, age: NUMBER }, { maxProperties: 3 });
        expect(validate({ name: 'Alice', age: 30 }, td)).toBe(true);
    });
    test('check ignores object validators', () => {
        let td = t.object({ name: STRING }, { minProperties: 5 });
        expect(check({ name: 'Alice' }, td)).toBe(true);
    });
});

describe('validate: nested recursive validation', () => {
    test('validates object fields with prim validators', () => {
        let schema = t.object({
            name: t.string({ minLength: 1 }),
            age: t.number({ minimum: 0, maximum: 150 }),
        });
        expect(validate({ name: 'Alice', age: 30 }, schema)).toBe(true);
        expect(validate({ name: '', age: 30 }, schema)).toBe(false);
        expect(validate({ name: 'Bob', age: -1 }, schema)).toBe(false);
    });
    test('validates arrays of validated types', () => {
        let schema = t.array(t.string({ minLength: 2 }));
        expect(validate(['ab', 'cd'], schema)).toBe(true);
        expect(validate(['ab', 'c'], schema)).toBe(false);
    });
    test('validates deeply nested', () => {
        let schema = t.object({
            users: t.array(t.object({
                name: t.string({ minLength: 1 }),
            }), { minItems: 1 }),
        });
        expect(validate({ users: [{ name: 'Alice' }] }, schema)).toBe(true);
        expect(validate({ users: [] }, schema)).toBe(false);
        expect(validate({ users: [{ name: '' }] }, schema)).toBe(false);
    });
});

describe('validate: nullable/optional validated types', () => {
    test('nullable validated string', () => {
        let td = nullable(t.string({ minLength: 3 }));
        expect(validate(null, td)).toBe(true);
        expect(validate('abc', td)).toBe(true);
        expect(validate('ab', td)).toBe(false);
    });
    test('optional validated number', () => {
        let td = optional(t.number({ minimum: 0 }));
        expect(validate(undefined, td)).toBe(true);
        expect(validate(5, td)).toBe(true);
        expect(validate(-1, td)).toBe(false);
    });
});

describe('validate: plain primitives (no validators)', () => {
    test('validate works like check for plain primitives', () => {
        expect(validate('hello', STRING)).toBe(true);
        expect(validate(42, NUMBER)).toBe(true);
        expect(validate(true, BOOLEAN)).toBe(true);
        expect(validate(42, STRING)).toBe(false);
    });
    test('validate works for plain complex types', () => {
        let schema = t.object({ name: STRING });
        expect(validate({ name: 'Alice' }, schema)).toBe(true);
        expect(validate({ name: 42 }, schema)).toBe(false);
    });
});

describe('validate: volatile validated types', () => {
    test('v.string with validators works', () => {
        let td = v.string({ minLength: 3 });
        expect(validate('abc', td)).toBe(true);
        expect(validate('ab', td)).toBe(false);
    });
    test('v.array with validators works', () => {
        let td = v.array(STRING, { minItems: 1 });
        expect(validate(['a'], td)).toBe(true);
        expect(validate([], td)).toBe(false);
    });
});
