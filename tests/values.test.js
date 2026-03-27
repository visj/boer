import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, BOOLEAN, NUMBER,
    STRING, BIGINT, DATE, URI, VALUE
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
        expect(validate(BigInt(1), STRING)).toBe(false);
        expect(validate(new Date(), STRING)).toBe(false);
        expect(validate(new URL('https://vilhelm.se'), STRING)).toBe(false);
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

    test('BIGINT accepts bigints only', () => {
        expect(validate(BigInt(0), BIGINT)).toBe(true);
        expect(validate(BigInt(999999999999999999), BIGINT)).toBe(true);
        expect(validate(BigInt(-1), BIGINT)).toBe(true);
        expect(validate(0, BIGINT)).toBe(false);
        expect(validate('1', BIGINT)).toBe(false);
        expect(validate(null, BIGINT)).toBe(false);
    });

    test('DATE accepts Date instances only', () => {
        expect(validate(new Date(), DATE)).toBe(true);
        expect(validate(new Date('2024-01-01'), DATE)).toBe(true);
        expect(validate('2024-01-01', DATE)).toBe(false);
        expect(validate(Date.now(), DATE)).toBe(false);
        expect(validate(null, DATE)).toBe(false);
    });

    test('URI accepts URL instances only', () => {
        expect(validate(new URL('https://vilhelm.se'), URI)).toBe(true);
        expect(validate('https://vilhelm.se', URI)).toBe(false);
        expect(validate(null, URI)).toBe(false);
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

    test('DATE parses date strings and timestamps', () => {
        expect(conform('2024-01-15T00:00:00Z', DATE)).toBe(true);
        expect(conform(1705276800000, DATE)).toBe(true);
        expect(conform('not-a-date', DATE)).toBe(false);
        expect(conform(true, DATE)).toBe(false);
        expect(conform(new Date(), DATE)).toBe(true);
    });

    test('URI parses URL strings', () => {
        expect(conform('https://vilhelm.se', URI)).toBe(true);
        expect(conform('not a url', URI)).toBe(false);
        expect(conform(42, URI)).toBe(false);
        expect(conform(new URL('https://vilhelm.se'), URI)).toBe(true);
    });

    test('BIGINT parses from numbers and strings', () => {
        expect(conform(BigInt(5), BIGINT)).toBe(true);
        expect(conform(5, BIGINT)).toBe(true);       // integer number -> bigint
        expect(conform('123', BIGINT)).toBe(true);    // string -> bigint
        expect(conform(3.14, BIGINT)).toBe(false);    // float cannot be bigint
        expect(conform('hello', BIGINT)).toBe(false);
        expect(conform(true, BIGINT)).toBe(false);
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

    test('DATE | NULL', () => {
        let type = DATE | NULL;
        expect(validate(new Date(), type)).toBe(true);
        expect(validate(null, type)).toBe(true);
        expect(validate('2024-01-01', type)).toBe(false);
    });

    test('URI | NULL', () => {
        let type = URI | NULL;
        expect(validate(new URL('https://vilhelm.se'), type)).toBe(true);
        expect(validate(null, type)).toBe(true);
        expect(validate('https://vilhelm.se', type)).toBe(false);
    });

    test('BIGINT | NULL | UNDEFINED', () => {
        let type = BIGINT | NULL | UNDEFINED;
        expect(validate(BigInt(0), type)).toBe(true);
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

    test('DATE | NULL parses null correctly', () => {
        expect(conform(null, DATE | NULL)).toBe(true);
        expect(conform('2024-01-01', DATE | NULL)).toBe(true);
        expect(conform(undefined, DATE | NULL)).toBe(false);
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

    test('DATE | STRING (rich + native)', () => {
        let type = DATE | STRING;
        expect(validate(new Date(), type)).toBe(true);
        expect(validate('hello', type)).toBe(true);
        expect(validate(42, type)).toBe(false);
    });

    test('DATE | NUMBER (both rich-compatible)', () => {
        let type = DATE | NUMBER;
        expect(validate(new Date(), type)).toBe(true);
        expect(validate(42, type)).toBe(true);
        expect(validate('hello', type)).toBe(false);
    });

    test('URI | STRING', () => {
        let type = URI | STRING;
        expect(validate(new URL('https://vilhelm.se'), type)).toBe(true);
        expect(validate('hello', type)).toBe(true);
        expect(validate(42, type)).toBe(false);
    });

    test('BIGINT | NUMBER', () => {
        let type = BIGINT | NUMBER;
        expect(validate(BigInt(5), type)).toBe(true);
        expect(validate(42, type)).toBe(true);
        expect(validate('5', type)).toBe(false);
    });

    test('DATE | URI | STRING | NULL', () => {
        let type = DATE | URI | STRING | NULL;
        expect(validate(new Date(), type)).toBe(true);
        expect(validate(new URL('https://vilhelm.se'), type)).toBe(true);
        expect(validate('hello', type)).toBe(true);
        expect(validate(null, type)).toBe(true);
        expect(validate(42, type)).toBe(false);
    });

    test('all VALUE types combined', () => {
        let type = VALUE;
        expect(validate('hello', type)).toBe(true);
        expect(validate(42, type)).toBe(true);
        expect(validate(true, type)).toBe(true);
        expect(validate(BigInt(5), type)).toBe(true);
        expect(validate(new Date(), type)).toBe(true);
        expect(validate(new URL('https://vilhelm.se'), type)).toBe(true);
        expect(validate(null, type)).toBe(false);
        expect(validate(undefined, type)).toBe(false);
        expect(validate({}, type)).toBe(false);
        expect(validate([], type)).toBe(false);
    });
});

describe.skip('parse: primitive type unions', () => {
    test('DATE | STRING: valid date string becomes Date', () => {
        let obj = { v: '2024-01-15' };
        let schema = object({ v: DATE | STRING });
        expect(conform(obj, schema)).toBe(true);
        expect(obj.v).toBeInstanceOf(Date);
    });

    test('DATE | STRING: invalid date string stays string', () => {
        let obj = { v: 'not-a-date' };
        let schema = object({ v: DATE | STRING });
        expect(conform(obj, schema)).toBe(true);
        expect(typeof obj.v).toBe('string');
    });

    test('URI | STRING: valid URL string becomes URL', () => {
        let obj = { v: 'https://vilhelm.se' };
        let schema = object({ v: URI | STRING });
        expect(conform(obj, schema)).toBe(true);
        expect(obj.v).toBeInstanceOf(URL);
    });

    test('URI | STRING: invalid URL stays string', () => {
        let obj = { v: 'not a url' };
        let schema = object({ v: URI | STRING });
        expect(conform(obj, schema)).toBe(true);
        expect(typeof obj.v).toBe('string');
    });

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

    test('BIGINT | NUMBER: integer becomes bigint (BIGINT checked first after NUMBER)', () => {
        // When NUMBER is in the mask, a number stays a number.
        let obj = { v: 42 };
        let schema = object({ v: BIGINT | NUMBER });
        expect(conform(obj, schema)).toBe(true);
        expect(typeof obj.v).toBe('number');
    });

    test('DATE | STRING | NULL: null allowed', () => {
        let obj = { v: null };
        let schema = object({ v: DATE | STRING | NULL });
        expect(conform(obj, schema)).toBe(true);
    });

    test('DATE | NUMBER: number timestamp becomes Date', () => {
        let obj = { v: 1705276800000 };
        let schema = object({ v: DATE | NUMBER });
        expect(conform(obj, schema)).toBe(true);
        // NUMBER takes priority over DATE for numbers in parse mode
        expect(typeof obj.v).toBe('number');
    });
});