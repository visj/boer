import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, BOOLEAN, NUMBER,
    STRING, BIGINT, DATE, URI, VALUE,
    object, conform, check
} from '../';

describe('object: schema builder', () => {
    test('returns a number', () => {
        let t = object({ a: STRING });
        expect(typeof t).toBe('number');
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
        let t = object({
            name: STRING,
            address: {
                street: STRING,
                city: STRING
            }
        });
        expect(typeof t).toBe('number');
        expect(check({ name: 'Alice', address: { street: '123 Main', city: 'NY' } }, t)).toBe(true);
    });

    test('accepts pre-registered object types', () => {
        let Address = object({ street: STRING, city: STRING });
        let Person = object({ name: STRING, address: Address });
        expect(check({ name: 'Bob', address: { street: '456 Oak', city: 'LA' } }, Person)).toBe(true);
    });
});

describe('validate: objects', () => {
    test('basic object with all field types', () => {
        let schema = object({
            s: STRING,
            n: NUMBER,
            b: BOOLEAN
        });
        expect(check({ s: 'hello', n: 42, b: true }, schema)).toBe(true);
        expect(check({ s: 'hello', n: 42, b: 'true' }, schema)).toBe(false);
    });

    test('rejects non-objects', () => {
        let schema = object({ a: STRING });
        expect(check('string', schema)).toBe(false);
        expect(check(42, schema)).toBe(false);
        expect(check(true, schema)).toBe(false);
        expect(check(null, schema)).toBe(false);
        expect(check(undefined, schema)).toBe(false);
        expect(check([], schema)).toBe(false);
    });

    test('missing fields fail without UNDEFINED flag', () => {
        let schema = object({ a: STRING, b: NUMBER });
        expect(check({ a: 'hello' }, schema)).toBe(false);
        expect(check({}, schema)).toBe(false);
    });

    test('missing fields pass with UNDEFINED flag', () => {
        let schema = object({ a: STRING, b: NUMBER | UNDEFINED });
        expect(check({ a: 'hello' }, schema)).toBe(true);
        expect(check({ a: 'hello', b: 42 }, schema)).toBe(true);
    });

    test('null fields fail without NULL flag', () => {
        let schema = object({ a: STRING, b: NUMBER });
        expect(check({ a: 'hello', b: null }, schema)).toBe(false);
    });

    test('null fields pass with NULL flag', () => {
        let schema = object({ a: STRING, b: NUMBER | NULL });
        expect(check({ a: 'hello', b: null }, schema)).toBe(true);
        expect(check({ a: 'hello', b: 42 }, schema)).toBe(true);
    });

    test('extra fields are silently ignored', () => {
        let schema = object({ a: STRING });
        expect(check({ a: 'hello', extra: 999, another: true }, schema)).toBe(true);
    });

    test('nested objects inline', () => {
        let schema = object({
            user: {
                name: STRING,
                age: NUMBER
            }
        });
        expect(check({ user: { name: 'Alice', age: 30 } }, schema)).toBe(true);
        expect(check({ user: { name: 'Alice', age: '30' } }, schema)).toBe(false);
        expect(check({ user: null }, schema)).toBe(false);
        expect(check({ user: 'Alice' }, schema)).toBe(false);
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
        expect(check({ a: { b: { c: { d: 42 } } } }, schema)).toBe(true);
        expect(check({ a: { b: { c: { d: '42' } } } }, schema)).toBe(false);
        expect(check({ a: { b: { c: null } } }, schema)).toBe(false);
    });

    test('object with nullable nested object', () => {
        let Inner = object({ x: NUMBER });
        let Outer = object({ inner: Inner | NULL });
        // Inner is a registered object ID (small number in ID_MASK range).
        // NULL is a high bit (1 << 30). OR-ing them together gives a typedef
        // that has both the object ID and the NULL flag — this works correctly.
        expect(check({ inner: { x: 5 } }, Outer)).toBe(true);
        expect(check({ inner: null }, Outer)).toBe(true);
        expect(check({ inner: { x: 'wrong' } }, Outer)).toBe(false);
        expect(check({ inner: 'string' }, Outer)).toBe(false);
    });

    test('nullable registered object field', () => {
        let Point = object({ x: NUMBER, y: NUMBER });
        let Schema = object({ origin: Point | NULL | UNDEFINED });
        expect(check({ origin: { x: 1, y: 2 } }, Schema)).toBe(true);
        expect(check({ origin: null }, Schema)).toBe(true);
        expect(check({}, Schema)).toBe(true);
        expect(check({ origin: { x: 1, y: '2' } }, Schema)).toBe(false);
        expect(check({ origin: 'point' }, Schema)).toBe(false);
    });

    test('object with type-union fields', () => {
        let schema = object({
            id: STRING | NUMBER,
            label: STRING | NULL,
            active: BOOLEAN | UNDEFINED
        });
        // active has UNDEFINED flag, so missing is OK
        expect(check({ id: 'abc', label: 'hello' }, schema)).toBe(true);
        expect(check({ id: 'abc', label: 'hello', active: true }, schema)).toBe(true);
        expect(check({ id: 123, label: null, active: undefined }, schema)).toBe(true);
        expect(check({ id: 123, label: null }, schema)).toBe(true);
        expect(check({ id: true, label: 'hello', active: true }, schema)).toBe(false); // id wrong
    });
});

describe('parse: objects', () => {
    test('basic parse leaves native types alone', () => {
        let schema = object({ s: STRING, n: NUMBER, b: BOOLEAN });
        let obj = { s: 'hello', n: 42, b: true };
        expect(conform(obj, schema)).toBe(true);
        expect(obj).toEqual({ s: 'hello', n: 42, b: true });
    });

    test('parse casts Date fields from strings', () => {
        let schema = object({ created: DATE });
        let obj = { created: '2024-06-15T12:00:00Z' };
        expect(conform(obj, schema)).toBe(true);
        expect(obj.created).toBeInstanceOf(Date);
    });

    test('parse casts URI fields from strings', () => {
        let schema = object({ url: URI });
        let obj = { url: 'https://vilhelm.se/page' };
        expect(conform(obj, schema)).toBe(true);
        expect(obj.url).toBeInstanceOf(URL);
    });

    test('parse casts BigInt fields from strings', () => {
        let schema = object({ big: BIGINT });
        let obj = { big: '99999999999999999' };
        expect(conform(obj, schema)).toBe(true);
        expect(typeof obj.big).toBe('bigint');
    });

    test('parse rejects wrong native types', () => {
        let schema = object({ s: STRING, n: NUMBER });
        expect(conform({ s: 42, n: 42 }, schema)).toBe(false);
        expect(conform({ s: 'ok', n: '42' }, schema)).toBe(false);
    });

    test('parse handles nullable fields', () => {
        let schema = object({ a: STRING, b: NUMBER | NULL });
        expect(conform({ a: 'hello', b: null }, schema)).toBe(true);
        expect(conform({ a: 'hello', b: 42 }, schema)).toBe(true);
        expect(conform({ a: 'hello', b: 'nope' }, schema)).toBe(false);
    });

    test('parse nested object with rich types', () => {
        let schema = object({
            meta: {
                created: DATE,
                url: URI | NULL
            }
        });
        let obj = { meta: { created: '2024-01-01', url: 'https://vilhelm.se' } };
        expect(conform(obj, schema)).toBe(true);
        expect(obj.meta.created).toBeInstanceOf(Date);
        expect(obj.meta.url).toBeInstanceOf(URL);
    });
});

describe('object: field with all types allowed', () => {
    test('VALUE | NULL | UNDEFINED accepts everything', () => {
        let schema = object({ any: VALUE | NULL | UNDEFINED });
        expect(check({ any: 'string' }, schema)).toBe(true);
        expect(check({ any: 42 }, schema)).toBe(true);
        expect(check({ any: true }, schema)).toBe(true);
        expect(check({ any: BigInt(1) }, schema)).toBe(true);
        expect(check({ any: new Date() }, schema)).toBe(true);
        expect(check({ any: new URL('https://vilhelm.se') }, schema)).toBe(true);
        expect(check({ any: null }, schema)).toBe(true);
        expect(check({ any: undefined }, schema)).toBe(true);
        expect(check({}, schema)).toBe(true);  // any is undefined
        // But not objects/arrays
        expect(check({ any: {} }, schema)).toBe(false);
        expect(check({ any: [] }, schema)).toBe(false);
    });
});

describe('object: empty object', () => {
    test('empty schema matches any object', () => {
        let schema = object({});
        expect(check({}, schema)).toBe(true);
        expect(check({ extra: true }, schema)).toBe(true);
        expect(check(null, schema)).toBe(false);
        expect(check([], schema)).toBe(false);
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
        expect(check(obj, schema)).toBe(true);
        //@ts-ignore
        obj.field10 = 'wrong';
        expect(check(obj, schema)).toBe(false);
    });
});