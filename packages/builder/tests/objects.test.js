import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, BOOLEAN, NUMBER, STRING, VALUE
} from '@boer/core';
import { catalog } from '@boer/validate';
import { allocators } from '@boer/builder';

const cat = catalog();
const { object } = allocators(cat);
const { validate } = cat;

describe('object: schema builder', () => {
    test('returns a number', () => {
        let type = object({ a: STRING });
        expect(typeof type).toBe('number');
    });

    test('throws on null field type', () => {
        expect(() => object({ a: null })).toThrow();
    });

    test('throws on non-number/non-object field type', () => {
        expect(() => object({ a: 'string' })).toThrow();
        expect(() => object({ a: true })).toThrow();
        expect(() => object({ a: undefined })).toThrow();
    });

    test('accepts nested object literals (auto-registers)', () => {
        let type = object({
            name: STRING,
            address: {
                street: STRING,
                city: STRING
            }
        });
        expect(typeof type).toBe('number');
        expect(validate({ name: 'Alice', address: { street: '123 Main', city: 'NY' } }, type)).toBe(true);
    });

    test('accepts pre-registered object types', () => {
        let Address = object({ street: STRING, city: STRING });
        let Person = object({ name: STRING, address: Address });
        expect(validate({ name: 'Bob', address: { street: '456 Oak', city: 'LA' } }, Person)).toBe(true);
    });
});

describe('validate: objects', () => {
    test('basic object with all field types', () => {
        let schema = object({
            s: STRING,
            n: NUMBER,
            b: BOOLEAN
        });
        expect(validate({ s: 'hello', n: 42, b: true }, schema)).toBe(true);
        expect(validate({ s: 'hello', n: 42, b: 'true' }, schema)).toBe(false);
    });

    test('rejects non-objects', () => {
        let schema = object({ a: STRING });
        expect(validate('string', schema)).toBe(false);
        expect(validate(42, schema)).toBe(false);
        expect(validate(true, schema)).toBe(false);
        expect(validate(null, schema)).toBe(false);
        expect(validate(undefined, schema)).toBe(false);
        expect(validate([], schema)).toBe(false);
    });

    test('missing fields fail without UNDEFINED flag', () => {
        let schema = object({ a: STRING, b: NUMBER });
        expect(validate({ a: 'hello' }, schema)).toBe(false);
        expect(validate({}, schema)).toBe(false);
    });

    test('missing fields pass with UNDEFINED flag', () => {
        let schema = object({ a: STRING, b: NUMBER | UNDEFINED });
        expect(validate({ a: 'hello' }, schema)).toBe(true);
        expect(validate({ a: 'hello', b: 42 }, schema)).toBe(true);
    });

    test('null fields fail without NULL flag', () => {
        let schema = object({ a: STRING, b: NUMBER });
        expect(validate({ a: 'hello', b: null }, schema)).toBe(false);
    });

    test('null fields pass with NULL flag', () => {
        let schema = object({ a: STRING, b: NUMBER | NULL });
        expect(validate({ a: 'hello', b: null }, schema)).toBe(true);
        expect(validate({ a: 'hello', b: 42 }, schema)).toBe(true);
    });

    test('extra fields are silently ignored', () => {
        let schema = object({ a: STRING });
        expect(validate({ a: 'hello', extra: 999, another: true }, schema)).toBe(true);
    });

    test('nested objects inline', () => {
        let schema = object({
            user: {
                name: STRING,
                age: NUMBER
            }
        });
        expect(validate({ user: { name: 'Alice', age: 30 } }, schema)).toBe(true);
        expect(validate({ user: { name: 'Alice', age: '30' } }, schema)).toBe(false);
        expect(validate({ user: null }, schema)).toBe(false);
        expect(validate({ user: 'Alice' }, schema)).toBe(false);
    });

    test('deeply nested objects inline', () => {
        let schema = object({
            a: {
                b: {
                    c: {
                        d: NUMBER
                    }
                }
            }
        });
        expect(validate({ a: { b: { c: { d: 42 } } } }, schema)).toBe(true);
        expect(validate({ a: { b: { c: { d: '42' } } } }, schema)).toBe(false);
        expect(validate({ a: { b: { c: null } } }, schema)).toBe(false);
    });

    test('object with nullable nested object', () => {
        let Inner = object({ x: NUMBER });
        let Outer = object({ inner: Inner | NULL });
        // Inner is a complex typedef (COMPLEX bit set + KIND index).
        // NULL sets the NULLABLE bit (1 << 30). OR-ing them together works
        // because NULLABLE is independent of COMPLEX and the KIND index.
        expect(validate({ inner: { x: 5 } }, Outer)).toBe(true);
        expect(validate({ inner: null }, Outer)).toBe(true);
        expect(validate({ inner: { x: 'wrong' } }, Outer)).toBe(false);
        expect(validate({ inner: 'string' }, Outer)).toBe(false);
    });

    test('nullable registered object field', () => {
        let Point = object({ x: NUMBER, y: NUMBER });
        let Schema = object({ origin: Point | NULL | UNDEFINED });
        expect(validate({ origin: { x: 1, y: 2 } }, Schema)).toBe(true);
        expect(validate({ origin: null }, Schema)).toBe(true);
        expect(validate({}, Schema)).toBe(true);
        expect(validate({ origin: { x: 1, y: '2' } }, Schema)).toBe(false);
        expect(validate({ origin: 'point' }, Schema)).toBe(false);
    });

    test('object with type-union fields', () => {
        let schema = object({
            id: STRING | NUMBER,
            label: STRING | NULL,
            active: BOOLEAN | UNDEFINED
        });
        // active has UNDEFINED flag, so missing is OK
        expect(validate({ id: 'abc', label: 'hello' }, schema)).toBe(true);
        expect(validate({ id: 'abc', label: 'hello', active: true }, schema)).toBe(true);
        expect(validate({ id: 123, label: null, active: undefined }, schema)).toBe(true);
        expect(validate({ id: 123, label: null }, schema)).toBe(true);
        expect(validate({ id: true, label: 'hello', active: true }, schema)).toBe(false); // id wrong
    });
});

describe('object: field with all types allowed', () => {
    test('VALUE | NULL | UNDEFINED accepts everything', () => {
        let schema = object({ any: VALUE | NULL | UNDEFINED });
        expect(validate({ any: 'string' }, schema)).toBe(true);
        expect(validate({ any: 42 }, schema)).toBe(true);
        expect(validate({ any: true }, schema)).toBe(true);
        expect(validate({ any: null }, schema)).toBe(true);
        expect(validate({ any: undefined }, schema)).toBe(true);
        expect(validate({}, schema)).toBe(true);  // any is undefined
        // But not objects/arrays
        expect(validate({ any: {} }, schema)).toBe(false);
        expect(validate({ any: [] }, schema)).toBe(false);
    });
});

describe('object: empty object', () => {
    test('empty schema matches any object', () => {
        let schema = object({});
        expect(validate({}, schema)).toBe(true);
        expect(validate({ extra: true }, schema)).toBe(true);
        expect(validate(null, schema)).toBe(false);
        expect(validate([], schema)).toBe(false);
    });
});

describe('object: many fields', () => {
    test('object with 20 fields', () => {
        /** @type {!IObject<string,number>} */
        let def = {};
        /** @type {!IObject<string,number>} */
        let obj = {};
        for (let i = 0; i < 20; i++) {
            def['field' + i] = NUMBER;
            obj['field' + i] = i;
        }
        let schema = object(def);
        expect(validate(obj, schema)).toBe(true);
        //@ts-ignore
        obj.field10 = 'wrong';
        expect(validate(obj, schema)).toBe(false);
    });
});
