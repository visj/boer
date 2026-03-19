import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, BOOLEAN, NUMBER,
    STRING, DATE, URI, catalog
} from 'uvd/catalog';

const { t, is, conform, diagnose } = catalog();

describe('object: inline nesting', () => {
    test('single level inline nesting', () => {
        let schema = t.object({
            name: STRING,
            location: { lat: NUMBER, lng: NUMBER }
        });
        expect(is({ name: 'HQ', location: { lat: 37.7, lng: -122.4 } }, schema)).toBe(true);
        expect(is({ name: 'HQ', location: { lat: '37', lng: -122 } }, schema)).toBe(false);
    });

    test('two levels of inline nesting', () => {
        let schema = t.object({
            org: {
                team: {
                    lead: STRING,
                    size: NUMBER
                }
            }
        });
        expect(is({ org: { team: { lead: 'Alice', size: 5 } } }, schema)).toBe(true);
        expect(is({ org: { team: { lead: 'Alice' } } }, schema)).toBe(false);
    });

    test('three levels of inline nesting', () => {
        let schema = t.object({
            a: { b: { c: { d: STRING } } }
        });
        expect(is({ a: { b: { c: { d: 'deep' } } } }, schema)).toBe(true);
        expect(is({ a: { b: { c: { d: 42 } } } }, schema)).toBe(false);
    });

    test('inline nested combined with registered types', () => {
        let Point = t.object({ x: NUMBER, y: NUMBER });
        let schema = t.object({
            label: STRING,
            bounds: {
                topLeft: Point,
                bottomRight: Point
            }
        });
        let valid = {
            label: 'box',
            bounds: {
                topLeft: { x: 0, y: 0 },
                bottomRight: { x: 100, y: 100 }
            }
        };
        expect(is(valid, schema)).toBe(true);
        //@ts-ignore
        valid.bounds.topLeft.x = 'wrong';
        expect(is(valid, schema)).toBe(false);
    });

    test('inline nested with array fields', () => {
        let schema = t.object({
            config: {
                tags: t.array(STRING),
                limits: t.array(NUMBER | NULL)
            }
        });
        expect(is({ config: { tags: ['a'], limits: [1, null] } }, schema)).toBe(true);
        expect(is({ config: { tags: ['a'], limits: [1, 'x'] } }, schema)).toBe(false);
    });

    test('inline nested with union fields', () => {
        let ModeUnion = t.union('mode', {
            fast: t.object({ mode: STRING, turbo: BOOLEAN }),
            slow: t.object({ mode: STRING, delay: NUMBER })
        });
        let schema = t.object({
            settings: {
                primary: ModeUnion,
                fallback: ModeUnion | NULL
            }
        });
        let valid = {
            settings: {
                primary: { mode: 'fast', turbo: true },
                fallback: null
            }
        };
        expect(is(valid, schema)).toBe(true);
    });
});

describe('real-world: API response schema', () => {
    let PaginatedResponse = t.object({
        data: t.array(t.object({
            id: NUMBER,
            name: STRING,
            email: STRING | NULL,
            createdAt: DATE,
            role: STRING
        })),
        meta: {
            page: NUMBER,
            perPage: NUMBER,
            total: NUMBER,
            hasNext: BOOLEAN
        }
    });

    test('parse valid API response', () => {
        let response = {
            data: [
                { id: 1, name: 'Alice', email: 'a@b.com', createdAt: '2024-01-01', role: 'admin' },
                { id: 2, name: 'Bob', email: null, createdAt: '2024-06-15', role: 'user' }
            ],
            meta: { page: 1, perPage: 20, total: 2, hasNext: false }
        };
        expect(conform(response, PaginatedResponse)).toBe(true);
        expect(response.data[0].createdAt).toBeInstanceOf(Date);
        expect(response.data[1].createdAt).toBeInstanceOf(Date);
        expect(response.data[1].email).toBeNull();
    });

    test('explain invalid API response', () => {
        let response = {
            data: [
                { id: '1', name: 'Alice', email: 'a@b.com', createdAt: new Date(), role: 'admin' }
            ],
            meta: { page: 1, perPage: 20, total: 'many', hasNext: false }
        };
        let errs = diagnose(response, PaginatedResponse);
        // id is string instead of number, total is string instead of number
        expect(errs.length).toBeGreaterThanOrEqual(2);
    });
});

describe('real-world: event system', () => {
    let EventSchema = t.union('event', {
        user_signup: t.object({
            event: STRING,
            userId: NUMBER,
            email: STRING,
            timestamp: DATE
        }),
        page_view: t.object({
            event: STRING,
            userId: NUMBER | NULL,
            path: STRING,
            timestamp: DATE
        }),
        purchase: t.object({
            event: STRING,
            userId: NUMBER,
            amount: NUMBER,
            currency: STRING,
            items: t.array(t.object({
                sku: STRING,
                qty: NUMBER,
                price: NUMBER
            })),
            timestamp: DATE
        })
    });

    test('parse user_signup event', () => {
        let evt = { event: 'user_signup', userId: 1, email: 'a@b.com', timestamp: '2024-01-01T00:00:00Z' };
        expect(conform(evt, EventSchema)).toBe(true);
        expect(evt.timestamp).toBeInstanceOf(Date);
    });

    test('parse page_view with null userId', () => {
        let evt = { event: 'page_view', userId: null, path: '/home', timestamp: '2024-01-01' };
        expect(conform(evt, EventSchema)).toBe(true);
    });

    test('parse purchase with items', () => {
        let evt = {
            event: 'purchase',
            userId: 42,
            amount: 99.99,
            currency: 'USD',
            items: [
                { sku: 'ABC', qty: 2, price: 49.99 },
                { sku: 'DEF', qty: 1, price: 0.01 }
            ],
            timestamp: '2024-06-15'
        };
        expect(conform(evt, EventSchema)).toBe(true);
        expect(evt.timestamp).toBeInstanceOf(Date);
    });

    test('validate rejects unknown event type', () => {
        expect(is({ event: 'logout', userId: 1, timestamp: new Date() }, EventSchema)).toBe(false);
    });

    test('array of events', () => {
        let BatchSchema = t.array(EventSchema);
        let batch = [
            { event: 'page_view', userId: null, path: '/', timestamp: new Date() },
            { event: 'user_signup', userId: 1, email: 'x@y.com', timestamp: new Date() }
        ];
        expect(is(batch, BatchSchema)).toBe(true);
    });

    test('nullable array of events', () => {
        let type = t.array(EventSchema) | NULL;
        expect(is(null, type)).toBe(true);
        expect(is([], type)).toBe(true);
    });
});

describe('real-world: config schema', () => {
    let Credentials = t.object({ user: STRING, password: STRING });

    let ConfigSchema = t.object({
        database: {
            host: STRING,
            port: NUMBER,
            name: STRING,
            credentials: Credentials | NULL
        },
        cache: {
            enabled: BOOLEAN,
            ttl: NUMBER | UNDEFINED,
            maxSize: NUMBER | UNDEFINED
        },
        features: t.array(STRING) | UNDEFINED,
        debug: BOOLEAN | UNDEFINED
    });

    test('validate full config', () => {
        let cfg = {
            database: {
                host: 'localhost',
                port: 5432,
                name: 'mydb',
                credentials: { user: 'admin', password: 'secret' }
            },
            cache: { enabled: true, ttl: 60, maxSize: 1000 },
            features: ['feature-a', 'feature-b'],
            debug: true
        };
        expect(is(cfg, ConfigSchema)).toBe(true);
    });

    test('validate minimal config', () => {
        let cfg = {
            database: {
                host: 'localhost',
                port: 5432,
                name: 'mydb',
                credentials: null
            },
            cache: { enabled: false }
        };
        expect(is(cfg, ConfigSchema)).toBe(true);
    });

    test('parse config with optional fields missing', () => {
        let cfg = {
            database: {
                host: 'localhost',
                port: 5432,
                name: 'mydb',
                credentials: null
            },
            cache: { enabled: false }
        };
        expect(conform(cfg, ConfigSchema)).toBe(true);
    });
});

describe('cross-function: validate vs parse vs cast consistency', () => {
    test('all three agree on valid data', () => {
        let schema = t.object({ name: STRING, age: NUMBER });
        let data = { name: 'Alice', age: 30 };
        expect(is(data, schema)).toBe(true);
        expect(conform({ ...data }, schema)).toBe(true);
    });

    test('validate rejects what parse and cast accept (rich types)', () => {
        let schema = t.object({ ts: DATE });
        let data = { ts: '2024-01-01' };
        expect(is(data, schema)).toBe(false);  // string ≠ Date
        expect(conform({ ts: '2024-01-01' }, schema)).toBe(true);   // parse casts
    });

    test('validate and parse reject what cast accepts (native types)', () => {
        let schema = t.object({ n: NUMBER });
        let data = { n: '42' };
        expect(is(data, schema)).toBe(false);
        expect(conform({ n: '42' }, schema)).toBe(false);
    });

    test('all three agree on nullability', () => {
        let schema = t.object({ val: NUMBER | NULL });
        expect(is({ val: null }, schema)).toBe(true);
        expect(conform({ val: null }, schema)).toBe(true);

        let schema2 = t.object({ val: NUMBER });
        expect(is({ val: null }, schema2)).toBe(false);
        expect(conform({ val: null }, schema2)).toBe(false);
    });

    test('explain returns no errors iff validate returns true', () => {
        let schema = t.object({ a: STRING, b: NUMBER | NULL, c: BOOLEAN | UNDEFINED });

        let valid = { a: 'x', b: null };
        expect(is(valid, schema)).toBe(true);
        expect(diagnose(valid, schema)).toEqual([]);

        let invalid = { a: 42, b: 'wrong' };
        expect(is(invalid, schema)).toBe(false);
        expect(diagnose(invalid, schema).length).toBeGreaterThan(0);
    });
});

describe('mutation: parse mutates in place', () => {
    test('parse replaces date strings with Date objects', () => {
        let schema = t.object({ d: DATE });
        let obj = { d: '2024-01-01' };
        let original = obj.d;
        conform(obj, schema);
        expect(obj.d).toBeInstanceOf(Date);
        expect(obj.d).not.toBe(original);
    });

    test('parse replaces URL strings with URL objects', () => {
        let schema = t.object({ u: URI });
        let obj = { u: 'https://vilhelm.se' };
        conform(obj, schema);
        expect(obj.u).toBeInstanceOf(URL);
    });

    test('parse mutates array elements', () => {
        let schema = t.array(DATE);
        let arr = ['2024-01-01', '2024-06-15'];
        conform(arr, schema);
        expect(arr[0]).toBeInstanceOf(Date);
        expect(arr[1]).toBeInstanceOf(Date);
    });

    test('validate never mutates', () => {
        let schema = t.object({ d: DATE });
        let obj = { d: '2024-01-01' };
        is(obj, schema);
        expect(typeof obj.d).toBe('string');
    });
});

describe('edge: adversarial inputs', () => {

    test('object with constructor key', () => {
        let schema = t.object({ constructor: STRING });
        expect(typeof schema).toBe('number');
        expect(is({ constructor: 'hello' }, schema)).toBe(true);
    });

    test('validate with NaN number', () => {
        expect(is(NaN, NUMBER)).toBe(true);
        expect(is(NaN, STRING)).toBe(false);
    });

    test('validate with -0', () => {
        expect(is(-0, NUMBER)).toBe(true);
    });

    test('validate with empty string', () => {
        expect(is('', STRING)).toBe(true);
        expect(is('', NUMBER)).toBe(false);
    });

    test('validate with very long string', () => {
        let long = 'x'.repeat(1000000);
        expect(is(long, STRING)).toBe(true);
    });

    test('nested null in object field', () => {
        let schema = t.object({ a: { b: STRING } });
        expect(is({ a: null }, schema)).toBe(false);
        expect(is({ a: undefined }, schema)).toBe(false);
    });

    test('array-like object rejected', () => {
        let schema = t.array(NUMBER);
        expect(is({ 0: 1, 1: 2, length: 2 }, schema)).toBe(false);
    });

    test('Date with invalid time', () => {
        let invalid = new Date('not-a-date');
        // new Date('invalid') creates a Date object, but with NaN time
        // validate checks instanceof Date, so it passes
        // todo is this really what we want it to do?
        // maybe validate should not accept NaN or invalid date
        expect(is(invalid, DATE)).toBe(true);
    });
});

describe('edge: shared keys across schemas', () => {
    test('schemas sharing field names work independently', () => {
        let A = t.object({ name: STRING, age: NUMBER });
        let B = t.object({ name: NUMBER, age: STRING }); // flipped types!

        expect(is({ name: 'Alice', age: 30 }, A)).toBe(true);
        expect(is({ name: 'Alice', age: 30 }, B)).toBe(false);

        expect(is({ name: 42, age: 'thirty' }, B)).toBe(true);
        expect(is({ name: 42, age: 'thirty' }, A)).toBe(false);
    });
});

describe('edge: multiple arrays registered', () => {
    test('different array types are independent', () => {
        let numArr = t.array(NUMBER);
        let strArr = t.array(STRING);
        let nullNumArr = t.array(NUMBER | NULL);

        expect(is([1, 2], numArr)).toBe(true);
        expect(is([1, 2], strArr)).toBe(false);

        expect(is(['a', 'b'], strArr)).toBe(true);
        expect(is(['a', 'b'], numArr)).toBe(false);

        expect(is([1, null], nullNumArr)).toBe(true);
        expect(is([1, null], numArr)).toBe(false);
    });
});