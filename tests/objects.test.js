import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, BOOLEAN, NUMBER,
    STRING, BIGINT, DATE, URI, PRIMITIVE, catalog
} from 'uvd/catalog';

const { t, is, conform } = catalog();

describe('object: schema builder', () => {
    test('returns a number', () => {
        let type = t.object({ a: STRING });
        expect(typeof type).toBe('number');
    });

    test('throws on null field type', () => {
        expect(() => t.object({ a: null })).toThrow();
    });

    test('throws on non-number/non-object field type', () => {
        expect(() => t.object({ a: 'string' })).toThrow();
        expect(() => t.object({ a: true })).toThrow();
        expect(() => t.object({ a: undefined })).toThrow();
    });

    test('accepts nested object literals (auto-registers)', () => {
        let type = t.object({
            name: STRING,
            address: {
                street: STRING,
                city: STRING
            }
        });
        expect(typeof type).toBe('number');
        expect(is({ name: 'Alice', address: { street: '123 Main', city: 'NY' } }, type)).toBe(true);
    });

    test('accepts pre-registered object types', () => {
        let Address = t.object({ street: STRING, city: STRING });
        let Person = t.object({ name: STRING, address: Address });
        expect(is({ name: 'Bob', address: { street: '456 Oak', city: 'LA' } }, Person)).toBe(true);
    });
});

describe('validate: objects', () => {
    test('basic object with all field types', () => {
        let schema = t.object({
            s: STRING,
            n: NUMBER,
            b: BOOLEAN
        });
        expect(is({ s: 'hello', n: 42, b: true }, schema)).toBe(true);
        expect(is({ s: 'hello', n: 42, b: 'true' }, schema)).toBe(false);
    });

    test('rejects non-objects', () => {
        let schema = t.object({ a: STRING });
        expect(is('string', schema)).toBe(false);
        expect(is(42, schema)).toBe(false);
        expect(is(true, schema)).toBe(false);
        expect(is(null, schema)).toBe(false);
        expect(is(undefined, schema)).toBe(false);
        expect(is([], schema)).toBe(false);
    });

    test('missing fields fail without UNDEFINED flag', () => {
        let schema = t.object({ a: STRING, b: NUMBER });
        expect(is({ a: 'hello' }, schema)).toBe(false);
        expect(is({}, schema)).toBe(false);
    });

    test('missing fields pass with UNDEFINED flag', () => {
        let schema = t.object({ a: STRING, b: NUMBER | UNDEFINED });
        expect(is({ a: 'hello' }, schema)).toBe(true);
        expect(is({ a: 'hello', b: 42 }, schema)).toBe(true);
    });

    test('null fields fail without NULL flag', () => {
        let schema = t.object({ a: STRING, b: NUMBER });
        expect(is({ a: 'hello', b: null }, schema)).toBe(false);
    });

    test('null fields pass with NULL flag', () => {
        let schema = t.object({ a: STRING, b: NUMBER | NULL });
        expect(is({ a: 'hello', b: null }, schema)).toBe(true);
        expect(is({ a: 'hello', b: 42 }, schema)).toBe(true);
    });

    test('extra fields are silently ignored', () => {
        let schema = t.object({ a: STRING });
        expect(is({ a: 'hello', extra: 999, another: true }, schema)).toBe(true);
    });

    test('nested objects inline', () => {
        let schema = t.object({
            user: {
                name: STRING,
                age: NUMBER
            }
        });
        expect(is({ user: { name: 'Alice', age: 30 } }, schema)).toBe(true);
        expect(is({ user: { name: 'Alice', age: '30' } }, schema)).toBe(false);
        expect(is({ user: null }, schema)).toBe(false);
        expect(is({ user: 'Alice' }, schema)).toBe(false);
    });

    test('deeply nested objects inline', () => {
        let schema = t.object({
            a: {
                b: {
                    c: {
                        d: NUMBER
                    }
                }
            }
        });
        expect(is({ a: { b: { c: { d: 42 } } } }, schema)).toBe(true);
        expect(is({ a: { b: { c: { d: '42' } } } }, schema)).toBe(false);
        expect(is({ a: { b: { c: null } } }, schema)).toBe(false);
    });

    test('object with nullable nested object', () => {
        let Inner = t.object({ x: NUMBER });
        let Outer = t.object({ inner: Inner | NULL });
        // Inner is a complex typedef (COMPLEX bit set + KIND index).
        // NULL sets the NULLABLE bit (1 << 30). OR-ing them together works
        // because NULLABLE is independent of COMPLEX and the KIND index.
        expect(is({ inner: { x: 5 } }, Outer)).toBe(true);
        expect(is({ inner: null }, Outer)).toBe(true);
        expect(is({ inner: { x: 'wrong' } }, Outer)).toBe(false);
        expect(is({ inner: 'string' }, Outer)).toBe(false);
    });

    test('nullable registered object field', () => {
        let Point = t.object({ x: NUMBER, y: NUMBER });
        let Schema = t.object({ origin: Point | NULL | UNDEFINED });
        expect(is({ origin: { x: 1, y: 2 } }, Schema)).toBe(true);
        expect(is({ origin: null }, Schema)).toBe(true);
        expect(is({}, Schema)).toBe(true);
        expect(is({ origin: { x: 1, y: '2' } }, Schema)).toBe(false);
        expect(is({ origin: 'point' }, Schema)).toBe(false);
    });

    test('object with type-union fields', () => {
        let schema = t.object({
            id: STRING | NUMBER,
            label: STRING | NULL,
            active: BOOLEAN | UNDEFINED
        });
        // active has UNDEFINED flag, so missing is OK
        expect(is({ id: 'abc', label: 'hello' }, schema)).toBe(true);
        expect(is({ id: 'abc', label: 'hello', active: true }, schema)).toBe(true);
        expect(is({ id: 123, label: null, active: undefined }, schema)).toBe(true);
        expect(is({ id: 123, label: null }, schema)).toBe(true);
        expect(is({ id: true, label: 'hello', active: true }, schema)).toBe(false); // id wrong
    });
});

describe('parse: objects', () => {
    test('basic parse leaves native types alone', () => {
        let schema = t.object({ s: STRING, n: NUMBER, b: BOOLEAN });
        let obj = { s: 'hello', n: 42, b: true };
        expect(conform(obj, schema)).toBe(true);
        expect(obj).toEqual({ s: 'hello', n: 42, b: true });
    });

    test('parse casts Date fields from strings', () => {
        let schema = t.object({ created: DATE });
        let obj = { created: '2024-06-15T12:00:00Z' };
        expect(conform(obj, schema)).toBe(true);
        expect(obj.created).toBeInstanceOf(Date);
    });

    test('parse casts URI fields from strings', () => {
        let schema = t.object({ url: URI });
        let obj = { url: 'https://vilhelm.se/page' };
        expect(conform(obj, schema)).toBe(true);
        expect(obj.url).toBeInstanceOf(URL);
    });

    test('parse casts BigInt fields from strings', () => {
        let schema = t.object({ big: BIGINT });
        let obj = { big: '99999999999999999' };
        expect(conform(obj, schema)).toBe(true);
        expect(typeof obj.big).toBe('bigint');
    });

    test('parse rejects wrong native types', () => {
        let schema = t.object({ s: STRING, n: NUMBER });
        expect(conform({ s: 42, n: 42 }, schema)).toBe(false);
        expect(conform({ s: 'ok', n: '42' }, schema)).toBe(false);
    });

    test('parse handles nullable fields', () => {
        let schema = t.object({ a: STRING, b: NUMBER | NULL });
        expect(conform({ a: 'hello', b: null }, schema)).toBe(true);
        expect(conform({ a: 'hello', b: 42 }, schema)).toBe(true);
        expect(conform({ a: 'hello', b: 'nope' }, schema)).toBe(false);
    });

    test('parse nested object with rich types', () => {
        let schema = t.object({
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
        let schema = t.object({ any: PRIMITIVE | NULL | UNDEFINED });
        expect(is({ any: 'string' }, schema)).toBe(true);
        expect(is({ any: 42 }, schema)).toBe(true);
        expect(is({ any: true }, schema)).toBe(true);
        expect(is({ any: BigInt(1) }, schema)).toBe(true);
        expect(is({ any: new Date() }, schema)).toBe(true);
        expect(is({ any: new URL('https://vilhelm.se') }, schema)).toBe(true);
        expect(is({ any: null }, schema)).toBe(true);
        expect(is({ any: undefined }, schema)).toBe(true);
        expect(is({}, schema)).toBe(true);  // any is undefined
        // But not objects/arrays
        expect(is({ any: {} }, schema)).toBe(false);
        expect(is({ any: [] }, schema)).toBe(false);
    });
});

describe('object: empty object', () => {
    test('empty schema matches any object', () => {
        let schema = t.object({});
        expect(is({}, schema)).toBe(true);
        expect(is({ extra: true }, schema)).toBe(true);
        expect(is(null, schema)).toBe(false);
        expect(is([], schema)).toBe(false);
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
        let schema = t.object(def);
        expect(is(obj, schema)).toBe(true);
        //@ts-ignore
        obj.field10 = 'wrong';
        expect(is(obj, schema)).toBe(false);
    });
});