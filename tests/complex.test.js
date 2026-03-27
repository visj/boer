import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, BOOLEAN, NUMBER, STRING,
} from 'uvd';
import { catalog, allocators, createConform, createDiagnose } from 'uvd/core';

const cat = catalog();
const { object, array, union } = allocators(cat);
const { validate } = cat;
const conform = createConform(cat);
const diagnose = createDiagnose(cat);

describe('object: inline nesting', () => {
    test('single level inline nesting', () => {
        let schema = object({
            name: STRING,
            location: { lat: NUMBER, lng: NUMBER }
        });
        expect(validate({ name: 'HQ', location: { lat: 37.7, lng: -122.4 } }, schema)).toBe(true);
        expect(validate({ name: 'HQ', location: { lat: '37', lng: -122 } }, schema)).toBe(false);
    });

    test('two levels of inline nesting', () => {
        let schema = object({
            org: {
                team: {
                    lead: STRING,
                    size: NUMBER
                }
            }
        });
        expect(validate({ org: { team: { lead: 'Alice', size: 5 } } }, schema)).toBe(true);
        expect(validate({ org: { team: { lead: 'Alice' } } }, schema)).toBe(false);
    });

    test('three levels of inline nesting', () => {
        let schema = object({
            a: { b: { c: { d: STRING } } }
        });
        expect(validate({ a: { b: { c: { d: 'deep' } } } }, schema)).toBe(true);
        expect(validate({ a: { b: { c: { d: 42 } } } }, schema)).toBe(false);
    });

    test('inline nested combined with registered types', () => {
        let Point = object({ x: NUMBER, y: NUMBER });
        let schema = object({
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
        expect(validate(valid, schema)).toBe(true);
        //@ts-ignore
        valid.bounds.topLeft.x = 'wrong';
        expect(validate(valid, schema)).toBe(false);
    });

    test('inline nested with array fields', () => {
        let schema = object({
            config: {
                tags: array(STRING),
                limits: array(NUMBER | NULL)
            }
        });
        expect(validate({ config: { tags: ['a'], limits: [1, null] } }, schema)).toBe(true);
        expect(validate({ config: { tags: ['a'], limits: [1, 'x'] } }, schema)).toBe(false);
    });

    test('inline nested with union fields', () => {
        let ModeUnion = union('mode', {
            fast: object({ mode: STRING, turbo: BOOLEAN }),
            slow: object({ mode: STRING, delay: NUMBER })
        });
        let schema = object({
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
        expect(validate(valid, schema)).toBe(true);
    });
});

describe('real-world: config schema', () => {
    let Credentials = object({ user: STRING, password: STRING });

    let ConfigSchema = object({
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
        features: array(STRING) | UNDEFINED,
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
        expect(validate(cfg, ConfigSchema)).toBe(true);
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
        expect(validate(cfg, ConfigSchema)).toBe(true);
    });

    test.skip('parse config with optional fields missing', () => {
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

describe.skip('cross-function: validate vs parse vs cast consistency', () => {
    test('all three agree on valid data', () => {
        let schema = object({ name: STRING, age: NUMBER });
        let data = { name: 'Alice', age: 30 };
        expect(validate(data, schema)).toBe(true);
        expect(conform({ ...data }, schema)).toBe(true);
    });

    test('validate and parse reject what cast accepts (native types)', () => {
        let schema = object({ n: NUMBER });
        let data = { n: '42' };
        expect(validate(data, schema)).toBe(false);
        expect(conform({ n: '42' }, schema)).toBe(false);
    });

    test('all three agree on nullability', () => {
        let schema = object({ val: NUMBER | NULL });
        expect(validate({ val: null }, schema)).toBe(true);
        expect(conform({ val: null }, schema)).toBe(true);

        let schema2 = object({ val: NUMBER });
        expect(validate({ val: null }, schema2)).toBe(false);
        expect(conform({ val: null }, schema2)).toBe(false);
    });

    test('explain returns no errors iff validate returns true', () => {
        let schema = object({ a: STRING, b: NUMBER | NULL, c: BOOLEAN | UNDEFINED });

        let valid = { a: 'x', b: null };
        expect(validate(valid, schema)).toBe(true);
        expect(diagnose(valid, schema)).toEqual([]);

        let invalid = { a: 42, b: 'wrong' };
        expect(validate(invalid, schema)).toBe(false);
        expect(diagnose(invalid, schema).length).toBeGreaterThan(0);
    });
});

describe('edge: adversarial inputs', () => {

    test('object with constructor key', () => {
        let schema = object({ constructor: STRING });
        expect(typeof schema).toBe('number');
        expect(validate({ constructor: 'hello' }, schema)).toBe(true);
    });

    test('validate with NaN number', () => {
        expect(validate(NaN, NUMBER)).toBe(true);
        expect(validate(NaN, STRING)).toBe(false);
    });

    test('validate with -0', () => {
        expect(validate(-0, NUMBER)).toBe(true);
    });

    test('validate with empty string', () => {
        expect(validate('', STRING)).toBe(true);
        expect(validate('', NUMBER)).toBe(false);
    });

    test('validate with very long string', () => {
        let long = 'x'.repeat(1000000);
        expect(validate(long, STRING)).toBe(true);
    });

    test('nested null in object field', () => {
        let schema = object({ a: { b: STRING } });
        expect(validate({ a: null }, schema)).toBe(false);
        expect(validate({ a: undefined }, schema)).toBe(false);
    });

    test('array-like object rejected', () => {
        let schema = array(NUMBER);
        expect(validate({ 0: 1, 1: 2, length: 2 }, schema)).toBe(false);
    });
});

describe('edge: shared keys across schemas', () => {
    test('schemas sharing field names work independently', () => {
        let A = object({ name: STRING, age: NUMBER });
        let B = object({ name: NUMBER, age: STRING }); // flipped types!

        expect(validate({ name: 'Alice', age: 30 }, A)).toBe(true);
        expect(validate({ name: 'Alice', age: 30 }, B)).toBe(false);

        expect(validate({ name: 42, age: 'thirty' }, B)).toBe(true);
        expect(validate({ name: 42, age: 'thirty' }, A)).toBe(false);
    });
});

describe('edge: multiple arrays registered', () => {
    test('different array types are independent', () => {
        let numArr = array(NUMBER);
        let strArr = array(STRING);
        let nullNumArr = array(NUMBER | NULL);

        expect(validate([1, 2], numArr)).toBe(true);
        expect(validate([1, 2], strArr)).toBe(false);

        expect(validate(['a', 'b'], strArr)).toBe(true);
        expect(validate(['a', 'b'], numArr)).toBe(false);

        expect(validate([1, null], nullNumArr)).toBe(true);
        expect(validate([1, null], numArr)).toBe(false);
    });
});