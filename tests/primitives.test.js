import { describe, test, expect } from 'bun:test';
import {
    object, conform, check,
    UNDEFINED, NULL, BOOLEAN, NUMBER,
    STRING, BIGINT, DATE, URI, VALUE,
} from '../';

describe('validate: primitives', () => {
    test('STRING accepts strings only', () => {
        expect(check('hello', STRING)).toBe(true);
        expect(check('', STRING)).toBe(true);
        expect(check(42, STRING)).toBe(false);
        expect(check(true, STRING)).toBe(false);
        expect(check(null, STRING)).toBe(false);
        expect(check(undefined, STRING)).toBe(false);
        expect(check(BigInt(1), STRING)).toBe(false);
        expect(check(new Date(), STRING)).toBe(false);
        expect(check(new URL('https://vilhelm.se'), STRING)).toBe(false);
        expect(check({}, STRING)).toBe(false);
        expect(check([], STRING)).toBe(false);
    });

    test('NUMBER accepts numbers only', () => {
        expect(check(0, NUMBER)).toBe(true);
        expect(check(-1, NUMBER)).toBe(true);
        expect(check(3.14, NUMBER)).toBe(true);
        expect(check(NaN, NUMBER)).toBe(true);
        expect(check(Infinity, NUMBER)).toBe(true);
        expect(check(-Infinity, NUMBER)).toBe(true);
        expect(check('42', NUMBER)).toBe(false);
        expect(check(true, NUMBER)).toBe(false);
        expect(check(null, NUMBER)).toBe(false);
        expect(check(undefined, NUMBER)).toBe(false);
    });

    test('BOOLEAN accepts booleans only', () => {
        expect(check(true, BOOLEAN)).toBe(true);
        expect(check(false, BOOLEAN)).toBe(true);
        expect(check(0, BOOLEAN)).toBe(false);
        expect(check(1, BOOLEAN)).toBe(false);
        expect(check('true', BOOLEAN)).toBe(false);
        expect(check(null, BOOLEAN)).toBe(false);
        expect(check(undefined, BOOLEAN)).toBe(false);
    });

    test('BIGINT accepts bigints only', () => {
        expect(check(BigInt(0), BIGINT)).toBe(true);
        expect(check(BigInt(999999999999999999), BIGINT)).toBe(true);
        expect(check(BigInt(-1), BIGINT)).toBe(true);
        expect(check(0, BIGINT)).toBe(false);
        expect(check('1', BIGINT)).toBe(false);
        expect(check(null, BIGINT)).toBe(false);
    });

    test('DATE accepts Date instances only', () => {
        expect(check(new Date(), DATE)).toBe(true);
        expect(check(new Date('2024-01-01'), DATE)).toBe(true);
        expect(check('2024-01-01', DATE)).toBe(false);
        expect(check(Date.now(), DATE)).toBe(false);
        expect(check(null, DATE)).toBe(false);
    });

    test('URI accepts URL instances only', () => {
        expect(check(new URL('https://vilhelm.se'), URI)).toBe(true);
        expect(check('https://vilhelm.se', URI)).toBe(false);
        expect(check(null, URI)).toBe(false);
    });
});

describe('parse: primitives', () => {
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
        expect(check(null, NULL)).toBe(true);
        expect(check(undefined, NULL)).toBe(false);
        expect(check(0, NULL)).toBe(false);
        expect(check('', NULL)).toBe(false);
    });

    test('bare UNDEFINED allows only undefined', () => {
        expect(check(undefined, UNDEFINED)).toBe(true);
        expect(check(null, UNDEFINED)).toBe(false);
        expect(check(0, UNDEFINED)).toBe(false);
    });

    test('NULL | UNDEFINED allows both null and undefined', () => {
        let type = NULL | UNDEFINED;
        expect(check(null, type)).toBe(true);
        expect(check(undefined, type)).toBe(true);
        expect(check(0, type)).toBe(false);
        expect(check('', type)).toBe(false);
    });

    test('STRING | NULL', () => {
        let type = STRING | NULL;
        expect(check('hello', type)).toBe(true);
        expect(check(null, type)).toBe(true);
        expect(check(undefined, type)).toBe(false);
        expect(check(42, type)).toBe(false);
    });

    test('STRING | UNDEFINED', () => {
        let type = STRING | UNDEFINED;
        expect(check('hello', type)).toBe(true);
        expect(check(undefined, type)).toBe(true);
        expect(check(null, type)).toBe(false);
    });

    test('STRING | NULL | UNDEFINED', () => {
        let type = STRING | NULL | UNDEFINED;
        expect(check('hello', type)).toBe(true);
        expect(check(null, type)).toBe(true);
        expect(check(undefined, type)).toBe(true);
        expect(check(42, type)).toBe(false);
    });

    test('NUMBER | NULL', () => {
        let type = NUMBER | NULL;
        expect(check(42, type)).toBe(true);
        expect(check(0, type)).toBe(true);
        expect(check(null, type)).toBe(true);
        expect(check(undefined, type)).toBe(false);
        expect(check('42', type)).toBe(false);
    });

    test('BOOLEAN | NULL | UNDEFINED', () => {
        let type = BOOLEAN | NULL | UNDEFINED;
        expect(check(true, type)).toBe(true);
        expect(check(false, type)).toBe(true);
        expect(check(null, type)).toBe(true);
        expect(check(undefined, type)).toBe(true);
        expect(check(0, type)).toBe(false);
    });

    test('DATE | NULL', () => {
        let type = DATE | NULL;
        expect(check(new Date(), type)).toBe(true);
        expect(check(null, type)).toBe(true);
        expect(check('2024-01-01', type)).toBe(false);
    });

    test('URI | NULL', () => {
        let type = URI | NULL;
        expect(check(new URL('https://vilhelm.se'), type)).toBe(true);
        expect(check(null, type)).toBe(true);
        expect(check('https://vilhelm.se', type)).toBe(false);
    });

    test('BIGINT | NULL | UNDEFINED', () => {
        let type = BIGINT | NULL | UNDEFINED;
        expect(check(BigInt(0), type)).toBe(true);
        expect(check(null, type)).toBe(true);
        expect(check(undefined, type)).toBe(true);
        expect(check(0, type)).toBe(false);
    });
});

describe('parse: null and undefined', () => {
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
        expect(check('hello', type)).toBe(true);
        expect(check(42, type)).toBe(true);
        expect(check(true, type)).toBe(false);
        expect(check(null, type)).toBe(false);
    });

    test('STRING | BOOLEAN', () => {
        let type = STRING | BOOLEAN;
        expect(check('hello', type)).toBe(true);
        expect(check(true, type)).toBe(true);
        expect(check(false, type)).toBe(true);
        expect(check(42, type)).toBe(false);
    });

    test('NUMBER | BOOLEAN', () => {
        let type = NUMBER | BOOLEAN;
        expect(check(42, type)).toBe(true);
        expect(check(true, type)).toBe(true);
        expect(check('hello', type)).toBe(false);
    });

    test('STRING | NUMBER | BOOLEAN', () => {
        let type = STRING | NUMBER | BOOLEAN;
        expect(check('hello', type)).toBe(true);
        expect(check(42, type)).toBe(true);
        expect(check(true, type)).toBe(true);
        expect(check(null, type)).toBe(false);
        expect(check(BigInt(1), type)).toBe(false);
    });

    test('STRING | NUMBER | NULL', () => {
        let type = STRING | NUMBER | NULL;
        expect(check('hello', type)).toBe(true);
        expect(check(42, type)).toBe(true);
        expect(check(null, type)).toBe(true);
        expect(check(undefined, type)).toBe(false);
        expect(check(true, type)).toBe(false);
    });

    test('STRING | NUMBER | BOOLEAN | NULL | UNDEFINED', () => {
        let type = STRING | NUMBER | BOOLEAN | NULL | UNDEFINED;
        expect(check('hello', type)).toBe(true);
        expect(check(42, type)).toBe(true);
        expect(check(true, type)).toBe(true);
        expect(check(null, type)).toBe(true);
        expect(check(undefined, type)).toBe(true);
        expect(check(BigInt(1), type)).toBe(false);
        expect(check(new Date(), type)).toBe(false);
    });

    test('DATE | STRING (rich + native)', () => {
        let type = DATE | STRING;
        expect(check(new Date(), type)).toBe(true);
        expect(check('hello', type)).toBe(true);
        expect(check(42, type)).toBe(false);
    });

    test('DATE | NUMBER (both rich-compatible)', () => {
        let type = DATE | NUMBER;
        expect(check(new Date(), type)).toBe(true);
        expect(check(42, type)).toBe(true);
        expect(check('hello', type)).toBe(false);
    });

    test('URI | STRING', () => {
        let type = URI | STRING;
        expect(check(new URL('https://vilhelm.se'), type)).toBe(true);
        expect(check('hello', type)).toBe(true);
        expect(check(42, type)).toBe(false);
    });

    test('BIGINT | NUMBER', () => {
        let type = BIGINT | NUMBER;
        expect(check(BigInt(5), type)).toBe(true);
        expect(check(42, type)).toBe(true);
        expect(check('5', type)).toBe(false);
    });

    test('DATE | URI | STRING | NULL', () => {
        let type = DATE | URI | STRING | NULL;
        expect(check(new Date(), type)).toBe(true);
        expect(check(new URL('https://vilhelm.se'), type)).toBe(true);
        expect(check('hello', type)).toBe(true);
        expect(check(null, type)).toBe(true);
        expect(check(42, type)).toBe(false);
    });

    test('all VALUE types combined', () => {
        let type = VALUE;
        expect(check('hello', type)).toBe(true);
        expect(check(42, type)).toBe(true);
        expect(check(true, type)).toBe(true);
        expect(check(BigInt(5), type)).toBe(true);
        expect(check(new Date(), type)).toBe(true);
        expect(check(new URL('https://vilhelm.se'), type)).toBe(true);
        expect(check(null, type)).toBe(false);
        expect(check(undefined, type)).toBe(false);
        expect(check({}, type)).toBe(false);
        expect(check([], type)).toBe(false);
    });
});

describe('parse: primitive type unions', () => {
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