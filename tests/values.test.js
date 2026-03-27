import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, BOOLEAN, NUMBER, STRING,
} from 'uvd';
import { catalog, allocators, createConform } from 'uvd/core';

const cat = catalog();
const { object } = allocators(cat);
const { validate } = cat;
const conform = createConform(cat);

describe('validate: primitives', () => {
    test('STRING accepts strings only', () => {
        expect(validate('hello', STRING)).toBe(true);
        expect(validate('', STRING)).toBe(true);
        expect(validate(42, STRING)).toBe(false);
        expect(validate(true, STRING)).toBe(false);
        expect(validate(null, STRING)).toBe(false);
        expect(validate(undefined, STRING)).toBe(false);
        expect(validate({}, STRING)).toBe(false);
        expect(validate([], STRING)).toBe(false);
    });

    test('NUMBER accepts numbers only', () => {
        expect(validate(0, NUMBER)).toBe(true);
        expect(validate(-1, NUMBER)).toBe(true);
        expect(validate(3.14, NUMBER)).toBe(true);
        expect(validate(NaN, NUMBER)).toBe(true);
        expect(validate(Infinity, NUMBER)).toBe(true);
        expect(validate(-Infinity, NUMBER)).toBe(true);
        expect(validate('42', NUMBER)).toBe(false);
        expect(validate(true, NUMBER)).toBe(false);
        expect(validate(null, NUMBER)).toBe(false);
        expect(validate(undefined, NUMBER)).toBe(false);
    });

    test('BOOLEAN accepts booleans only', () => {
        expect(validate(true, BOOLEAN)).toBe(true);
        expect(validate(false, BOOLEAN)).toBe(true);
        expect(validate(0, BOOLEAN)).toBe(false);
        expect(validate(1, BOOLEAN)).toBe(false);
        expect(validate('true', BOOLEAN)).toBe(false);
        expect(validate(null, BOOLEAN)).toBe(false);
        expect(validate(undefined, BOOLEAN)).toBe(false);
    });

});

describe.skip('parse: primitives', () => {
    test('STRING accepts strings strictly', () => {
        expect(conform('hello', STRING)).toBe(true);
        expect(conform(42, STRING)).toBe(false);
        expect(conform(true, STRING)).toBe(false);
    });

    test('NUMBER accepts numbers strictly', () => {
        expect(conform(42, NUMBER)).toBe(true);
        expect(conform('42', NUMBER)).toBe(false);
    });

    test('BOOLEAN accepts booleans strictly', () => {
        expect(conform(true, BOOLEAN)).toBe(true);
        expect(conform(1, BOOLEAN)).toBe(false);
        expect(conform('true', BOOLEAN)).toBe(false);
    });
});

describe('validate: null and undefined', () => {
    test('bare NULL allows only null', () => {
        expect(validate(null, NULL)).toBe(true);
        expect(validate(undefined, NULL)).toBe(false);
        expect(validate(0, NULL)).toBe(false);
        expect(validate('', NULL)).toBe(false);
    });

    test('bare UNDEFINED allows only undefined', () => {
        expect(validate(undefined, UNDEFINED)).toBe(true);
        expect(validate(null, UNDEFINED)).toBe(false);
        expect(validate(0, UNDEFINED)).toBe(false);
    });

    test('NULL | UNDEFINED allows both null and undefined', () => {
        let type = NULL | UNDEFINED;
        expect(validate(null, type)).toBe(true);
        expect(validate(undefined, type)).toBe(true);
        expect(validate(0, type)).toBe(false);
        expect(validate('', type)).toBe(false);
    });

    test('STRING | NULL', () => {
        let type = STRING | NULL;
        expect(validate('hello', type)).toBe(true);
        expect(validate(null, type)).toBe(true);
        expect(validate(undefined, type)).toBe(false);
        expect(validate(42, type)).toBe(false);
    });

    test('STRING | UNDEFINED', () => {
        let type = STRING | UNDEFINED;
        expect(validate('hello', type)).toBe(true);
        expect(validate(undefined, type)).toBe(true);
        expect(validate(null, type)).toBe(false);
    });

    test('STRING | NULL | UNDEFINED', () => {
        let type = STRING | NULL | UNDEFINED;
        expect(validate('hello', type)).toBe(true);
        expect(validate(null, type)).toBe(true);
        expect(validate(undefined, type)).toBe(true);
        expect(validate(42, type)).toBe(false);
    });

    test('NUMBER | NULL', () => {
        let type = NUMBER | NULL;
        expect(validate(42, type)).toBe(true);
        expect(validate(0, type)).toBe(true);
        expect(validate(null, type)).toBe(true);
        expect(validate(undefined, type)).toBe(false);
        expect(validate('42', type)).toBe(false);
    });

    test('BOOLEAN | NULL | UNDEFINED', () => {
        let type = BOOLEAN | NULL | UNDEFINED;
        expect(validate(true, type)).toBe(true);
        expect(validate(false, type)).toBe(true);
        expect(validate(null, type)).toBe(true);
        expect(validate(undefined, type)).toBe(true);
        expect(validate(0, type)).toBe(false);
    });

});

describe.skip('parse: null and undefined', () => {
    test('STRING | NULL parses null correctly', () => {
        expect(conform(null, STRING | NULL)).toBe(true);
        expect(conform(undefined, STRING | NULL)).toBe(false);
        expect(conform('hello', STRING | NULL)).toBe(true);
    });

    test('NUMBER | NULL | UNDEFINED', () => {
        expect(conform(null, NUMBER | NULL | UNDEFINED)).toBe(true);
        expect(conform(undefined, NUMBER | NULL | UNDEFINED)).toBe(true);
        expect(conform(42, NUMBER | NULL | UNDEFINED)).toBe(true);
        expect(conform('42', NUMBER | NULL | UNDEFINED)).toBe(false);
    });
});

describe('validate: primitive type unions', () => {
    test('STRING | NUMBER', () => {
        let type = STRING | NUMBER;
        expect(validate('hello', type)).toBe(true);
        expect(validate(42, type)).toBe(true);
        expect(validate(true, type)).toBe(false);
        expect(validate(null, type)).toBe(false);
    });

    test('STRING | BOOLEAN', () => {
        let type = STRING | BOOLEAN;
        expect(validate('hello', type)).toBe(true);
        expect(validate(true, type)).toBe(true);
        expect(validate(false, type)).toBe(true);
        expect(validate(42, type)).toBe(false);
    });

    test('NUMBER | BOOLEAN', () => {
        let type = NUMBER | BOOLEAN;
        expect(validate(42, type)).toBe(true);
        expect(validate(true, type)).toBe(true);
        expect(validate('hello', type)).toBe(false);
    });

    test('STRING | NUMBER | BOOLEAN', () => {
        let type = STRING | NUMBER | BOOLEAN;
        expect(validate('hello', type)).toBe(true);
        expect(validate(42, type)).toBe(true);
        expect(validate(true, type)).toBe(true);
        expect(validate(null, type)).toBe(false);
        expect(validate(BigInt(1), type)).toBe(false);
    });

    test('STRING | NUMBER | NULL', () => {
        let type = STRING | NUMBER | NULL;
        expect(validate('hello', type)).toBe(true);
        expect(validate(42, type)).toBe(true);
        expect(validate(null, type)).toBe(true);
        expect(validate(undefined, type)).toBe(false);
        expect(validate(true, type)).toBe(false);
    });

    test('STRING | NUMBER | BOOLEAN | NULL | UNDEFINED', () => {
        let type = STRING | NUMBER | BOOLEAN | NULL | UNDEFINED;
        expect(validate('hello', type)).toBe(true);
        expect(validate(42, type)).toBe(true);
        expect(validate(true, type)).toBe(true);
        expect(validate(null, type)).toBe(true);
        expect(validate(undefined, type)).toBe(true);
        expect(validate(BigInt(1), type)).toBe(false);
        expect(validate(new Date(), type)).toBe(false);
    });

});

describe.skip('parse: primitive type unions', () => {

    test('NUMBER | STRING: number stays number', () => {
        let obj = { v: 42 };
        let schema = object({ v: NUMBER | STRING });
        expect(conform(obj, schema)).toBe(true);
        expect(obj.v).toBe(42);
    });

    test('NUMBER | STRING: string stays string', () => {
        let obj = { v: 'hello' };
        let schema = object({ v: NUMBER | STRING });
        expect(conform(obj, schema)).toBe(true);
        expect(obj.v).toBe('hello');
    });
});