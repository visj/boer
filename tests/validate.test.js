import { describe, test, expect } from 'bun:test';
import {
    BOOLEAN, NUMBER, STRING,
    BIGINT, DATE, URI
} from 'uvd';
import { catalog } from 'uvd/catalog';

const { t, v, is, validate } = catalog();

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

describe('validate: is ignores validators', () => {
    test('is passes structural type even if validator would fail', () => {
        let td = t.string({ minLength: 5 });
        expect(is('hi', td)).toBe(true);
        expect(is('hello world', td)).toBe(true);
        expect(is(42, td)).toBe(false);
    });
    test('is passes number even if below minimum', () => {
        let td = t.number({ minimum: 10 });
        expect(is(5, td)).toBe(true);
        expect(is('not a number', td)).toBe(false);
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
    test('is ignores array validators', () => {
        let td = t.array(STRING, { minItems: 5 });
        expect(is(['a'], td)).toBe(true);
        expect(is([], td)).toBe(true);
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
    test('is ignores object validators', () => {
        let td = t.object({ name: STRING }, { minProperties: 5 });
        expect(is({ name: 'Alice' }, td)).toBe(true);
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
        let td = t.nullable(t.string({ minLength: 3 }));
        expect(validate(null, td)).toBe(true);
        expect(validate('abc', td)).toBe(true);
        expect(validate('ab', td)).toBe(false);
    });
    test('optional validated number', () => {
        let td = t.optional(t.number({ minimum: 0 }));
        expect(validate(undefined, td)).toBe(true);
        expect(validate(5, td)).toBe(true);
        expect(validate(-1, td)).toBe(false);
    });
});

describe('validate: plain primitives (no validators)', () => {
    test('validate works like is for plain primitives', () => {
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

// --- NEW VALIDATORS (PROPERTIES.md) ---

describe('validate: string format — email', () => {
    test('valid emails pass', () => {
        let td = t.string({ format: 'email' });
        expect(validate('user@example.com', td)).toBe(true);
        expect(validate('a@b.co', td)).toBe(true);
    });
    test('invalid emails fail', () => {
        let td = t.string({ format: 'email' });
        expect(validate('not-an-email', td)).toBe(false);
        expect(validate('@missing.com', td)).toBe(false);
        expect(validate('user@', td)).toBe(false);
    });
    test('is ignores format', () => {
        let td = t.string({ format: 'email' });
        expect(is('not-an-email', td)).toBe(true);
    });
});

describe('validate: string format — ipv4', () => {
    test('valid ipv4 passes', () => {
        let td = t.string({ format: 'ipv4' });
        expect(validate('192.168.1.1', td)).toBe(true);
        expect(validate('0.0.0.0', td)).toBe(true);
        expect(validate('255.255.255.255', td)).toBe(true);
    });
    test('invalid ipv4 fails', () => {
        let td = t.string({ format: 'ipv4' });
        expect(validate('256.1.1.1', td)).toBe(false);
        expect(validate('1.2.3', td)).toBe(false);
        expect(validate('abc.def.ghi.jkl', td)).toBe(false);
    });
});

describe('validate: string format — uuid', () => {
    test('valid uuid passes', () => {
        let td = t.string({ format: 'uuid' });
        expect(validate('550e8400-e29b-41d4-a716-446655440000', td)).toBe(true);
        expect(validate('6ba7b810-9dad-11d1-80b4-00c04fd430c8', td)).toBe(true);
    });
    test('invalid uuid fails', () => {
        let td = t.string({ format: 'uuid' });
        expect(validate('not-a-uuid', td)).toBe(false);
        expect(validate('550e8400-e29b-41d4-a716', td)).toBe(false);
    });
});

describe('validate: string format — date-time', () => {
    test('valid RFC 3339 date-time passes', () => {
        let td = t.string({ format: 'date-time' });
        expect(validate('2024-01-15T10:30:00Z', td)).toBe(true);
        expect(validate('2024-01-15T10:30:00+05:30', td)).toBe(true);
        expect(validate('2024-01-15T10:30:00.123Z', td)).toBe(true);
    });
    test('invalid date-time fails', () => {
        let td = t.string({ format: 'date-time' });
        expect(validate('2024-01-15', td)).toBe(false);
        expect(validate('not-a-date', td)).toBe(false);
        expect(validate('2024-01-15 10:30:00', td)).toBe(false);
    });
    test('date-time is NOT the DATE primitive', () => {
        let td = t.string({ format: 'date-time' });
        expect(validate(new Date(), td)).toBe(false);
    });
});

describe('validate: string format combined with other validators', () => {
    test('format + minLength', () => {
        let td = t.string({ format: 'email', minLength: 10 });
        expect(validate('user@example.com', td)).toBe(true);
        expect(validate('a@b.co', td)).toBe(false); // valid email but too short
    });
    test('invalid format throws', () => {
        expect(() => t.string({ format: 'invalid' })).toThrow();
    });
});

describe('validate: array contains', () => {
    test('contains alone (default minContains=1)', () => {
        let td = t.array(NUMBER, { contains: NUMBER });
        expect(validate([1, 2, 3], td)).toBe(true);
        expect(validate([], td)).toBe(false); // no matches
    });
    test('contains with a validated type', () => {
        let gt10 = t.number({ minimum: 10 });
        let td = t.array(NUMBER, { contains: gt10 });
        expect(validate([1, 2, 15], td)).toBe(true); // 15 matches
        expect(validate([1, 2, 3], td)).toBe(false); // no match >= 10
    });
    test('contains + minContains', () => {
        let td = t.array(NUMBER, { contains: NUMBER, minContains: 2 });
        expect(validate([1, 2, 3], td)).toBe(true);
        expect(validate([1], td)).toBe(false); // only 1 match, need 2
    });
    test('contains + maxContains', () => {
        let td = t.array(NUMBER, { contains: NUMBER, maxContains: 2 });
        expect(validate([1, 2], td)).toBe(true);
        expect(validate([1, 2, 3], td)).toBe(false); // 3 matches > maxContains 2
    });
    test('contains + minContains + maxContains', () => {
        let gt5 = t.number({ minimum: 5 });
        let td = t.array(NUMBER, { contains: gt5, minContains: 1, maxContains: 2 });
        expect(validate([1, 2, 6], td)).toBe(true); // 1 match
        expect(validate([1, 6, 7], td)).toBe(true); // 2 matches
        expect(validate([6, 7, 8], td)).toBe(false); // 3 matches > max 2
        expect(validate([1, 2, 3], td)).toBe(false); // 0 matches < min 1
    });
    test('is ignores contains', () => {
        let gt10 = t.number({ minimum: 10 });
        let td = t.array(NUMBER, { contains: gt10 });
        expect(is([1, 2, 3], td)).toBe(true);
    });
});

describe('validate: object patternProperties', () => {
    test('values matching pattern pass schema', () => {
        let td = t.object({ id: NUMBER }, {
            patternProperties: { '^S_': STRING }
        });
        expect(validate({ id: 1, S_name: 'Alice' }, td)).toBe(true);
    });
    test('values matching pattern fail schema', () => {
        let td = t.object({ id: NUMBER }, {
            patternProperties: { '^S_': STRING }
        });
        expect(validate({ id: 1, S_name: 42 }, td)).toBe(false);
    });
    test('non-matching keys are ignored by pattern', () => {
        let td = t.object({ id: NUMBER }, {
            patternProperties: { '^S_': STRING }
        });
        expect(validate({ id: 1, other: 42 }, td)).toBe(true);
    });
    test('multiple patterns', () => {
        let td = t.object({ id: NUMBER }, {
            patternProperties: {
                '^S_': STRING,
                '^N_': NUMBER,
            }
        });
        expect(validate({ id: 1, S_name: 'Alice', N_age: 30 }, td)).toBe(true);
        expect(validate({ id: 1, S_name: 'Alice', N_age: 'not a number' }, td)).toBe(false);
    });
});

describe('validate: object propertyNames', () => {
    test('all keys match string schema — pass', () => {
        let shortKey = t.string({ maxLength: 5 });
        let td = t.object({ id: NUMBER }, { propertyNames: shortKey });
        expect(validate({ id: 1, name: 'x' }, td)).toBe(true);
    });
    test('one key fails string schema — fail', () => {
        let shortKey = t.string({ maxLength: 3 });
        let td = t.object({ id: NUMBER }, { propertyNames: shortKey });
        expect(validate({ id: 1, longname: 'x' }, td)).toBe(false);
    });
    test('propertyNames with pattern', () => {
        let camelCase = t.string({ pattern: /^[a-z][a-zA-Z]*$/ });
        let td = t.object({ id: NUMBER }, { propertyNames: camelCase });
        expect(validate({ id: 1, myField: 'x' }, td)).toBe(true);
        expect(validate({ id: 1, MyField: 'x' }, td)).toBe(false);
    });
});

describe('validate: object dependentRequired', () => {
    test('trigger present, deps present — pass', () => {
        let td = t.object({ name: STRING, email: STRING, phone: STRING }, {
            dependentRequired: { email: ['phone'] }
        });
        expect(validate({ name: 'Alice', email: 'a@b.com', phone: '123' }, td)).toBe(true);
    });
    test('trigger present, dep missing — fail', () => {
        let td = t.object({
            name: STRING,
            email: t.optional(STRING),
            phone: t.optional(STRING)
        }, {
            dependentRequired: { email: ['phone'] }
        });
        expect(validate({ name: 'Alice', email: 'a@b.com' }, td)).toBe(false);
    });
    test('trigger absent — constraint not activated', () => {
        let td = t.object({
            name: STRING,
            email: t.optional(STRING),
            phone: t.optional(STRING)
        }, {
            dependentRequired: { email: ['phone'] }
        });
        expect(validate({ name: 'Alice' }, td)).toBe(true);
    });
    test('multiple triggers', () => {
        let td = t.object({
            name: STRING,
            billing: t.optional(STRING),
            shipping: t.optional(STRING),
            address: t.optional(STRING),
        }, {
            dependentRequired: {
                billing: ['address'],
                shipping: ['address'],
            }
        });
        expect(validate({ name: 'Alice', billing: 'cc', address: '123 St' }, td)).toBe(true);
        expect(validate({ name: 'Alice', shipping: 'ups' }, td)).toBe(false);
        expect(validate({ name: 'Alice' }, td)).toBe(true);
    });
});

describe('validate: volatile new validators', () => {
    test('v.string with format works', () => {
        let td = v.string({ format: 'email' });
        expect(validate('user@example.com', td)).toBe(true);
        expect(validate('invalid', td)).toBe(false);
    });
    test('v.array with contains works', () => {
        let td = v.array(NUMBER, { contains: NUMBER, minContains: 2 });
        expect(validate([1, 2, 3], td)).toBe(true);
        expect(validate([1], td)).toBe(false);
    });
    test('v.object with patternProperties works', () => {
        let td = v.object({ id: NUMBER }, {
            patternProperties: { '^S_': STRING }
        });
        expect(validate({ id: 1, S_name: 'Alice' }, td)).toBe(true);
        expect(validate({ id: 1, S_name: 42 }, td)).toBe(false);
    });
    test('v.object with dependentRequired works', () => {
        let td = v.object({
            name: STRING,
            email: t.optional(STRING),
            phone: t.optional(STRING),
        }, {
            dependentRequired: { email: ['phone'] }
        });
        expect(validate({ name: 'Alice', email: 'a@b.com', phone: '123' }, td)).toBe(true);
        expect(validate({ name: 'Alice', email: 'a@b.com' }, td)).toBe(false);
    });
});

// --- t.refine() ---

describe('validate: t.refine — primitives', () => {
    test('refine string with custom predicate', () => {
        let td = t.refine(STRING, s => s.startsWith('A'));
        expect(validate('Alice', td)).toBe(true);
        expect(validate('Bob', td)).toBe(false);
    });
    test('refine number — even check', () => {
        let even = t.refine(NUMBER, n => n % 2 === 0);
        expect(validate(4, even)).toBe(true);
        expect(validate(3, even)).toBe(false);
    });
    test('wrong type fails before refine runs', () => {
        let td = t.refine(STRING, () => true);
        expect(validate(42, td)).toBe(false);
    });
});

describe('validate: t.refine — complex types', () => {
    test('refine on object', () => {
        let schema = t.object({ x: NUMBER, y: NUMBER });
        let positive = t.refine(schema, obj => obj.x > 0 && obj.y > 0);
        expect(validate({ x: 1, y: 2 }, positive)).toBe(true);
        expect(validate({ x: -1, y: 2 }, positive)).toBe(false);
    });
    test('refine on validated primitive', () => {
        let td = t.refine(t.number({ minimum: 0 }), n => n % 2 === 0);
        expect(validate(4, td)).toBe(true);
        expect(validate(3, td)).toBe(false);  // fails refine
        expect(validate(-2, td)).toBe(false); // fails minimum
    });
    test('refine on array', () => {
        let td = t.refine(t.array(NUMBER), arr => arr.length <= 3);
        expect(validate([1, 2], td)).toBe(true);
        expect(validate([1, 2, 3, 4], td)).toBe(false);
    });
});

describe('validate: t.refine — is ignores callback', () => {
    test('is passes even when refine would reject', () => {
        let td = t.refine(STRING, () => false);
        expect(is('anything', td)).toBe(true);
    });
    test('is still validates inner type', () => {
        let td = t.refine(STRING, () => true);
        expect(is(42, td)).toBe(false);
    });
});

describe('validate: t.refine - can chain refine definitions', () => {
    test('basic chaining validates correctly', () => {
        let schema = t.object({ x: NUMBER, y: NUMBER });
        let positive = t.refine(schema, obj => obj.x > 0 && obj.y > 0);
        let chained = t.refine(positive, obj => obj.x > 10 && obj.y > 10);

        expect(validate({ x: 12, y: 14 }, chained)).toBe(true);
        expect(validate({ x: 8, y: 6 }, chained)).toBe(false);
    });
});

describe('validate: t.refine — nullable/optional', () => {
    test('nullable refine', () => {
        let td = t.nullable(t.refine(STRING, s => s.length > 0));
        expect(validate(null, td)).toBe(true);
        expect(validate('hi', td)).toBe(true);
        expect(validate('', td)).toBe(false);
    });
    test('optional refine', () => {
        let td = t.optional(t.refine(NUMBER, n => n > 0));
        expect(validate(undefined, td)).toBe(true);
        expect(validate(5, td)).toBe(true);
        expect(validate(-1, td)).toBe(false);
    });
});

describe('validate: v.refine — volatile', () => {
    test('v.refine on primitive', () => {
        let td = v.refine(NUMBER, n => n > 0);
        expect(validate(5, td)).toBe(true);
        expect(validate(-1, td)).toBe(false);
    });
    test('v.refine on object', () => {
        let schema = v.object({ a: NUMBER });
        let td = v.refine(schema, obj => obj.a < 100);
        expect(validate({ a: 50 }, td)).toBe(true);
        expect(validate({ a: 200 }, td)).toBe(false);
    });
});

// --- additionalProperties: false ---

describe('validate: additionalProperties: false', () => {
    test('exact keys pass', () => {
        let td = t.object({ name: STRING, age: NUMBER }, { additionalProperties: false });
        expect(validate({ name: 'Alice', age: 30 }, td)).toBe(true);
    });
    test('extra keys fail', () => {
        let td = t.object({ name: STRING, age: NUMBER }, { additionalProperties: false });
        expect(validate({ name: 'Alice', age: 30, extra: true }, td)).toBe(false);
    });
    test('missing optional key is ok', () => {
        let td = t.object({ name: STRING, age: t.optional(NUMBER) }, { additionalProperties: false });
        expect(validate({ name: 'Alice' }, td)).toBe(true);
    });
    test('is ignores additionalProperties', () => {
        let td = t.object({ name: STRING }, { additionalProperties: false });
        expect(is({ name: 'Alice', extra: true }, td)).toBe(true);
    });
    test('combined with other object validators', () => {
        let td = t.object({ name: STRING }, {
            additionalProperties: false,
            minProperties: 1
        });
        expect(validate({ name: 'Alice' }, td)).toBe(true);
        expect(validate({ name: 'Alice', extra: 1 }, td)).toBe(false);
    });
    test('volatile v.object with additionalProperties', () => {
        let td = v.object({ x: NUMBER }, { additionalProperties: false });
        expect(validate({ x: 1 }, td)).toBe(true);
        expect(validate({ x: 1, y: 2 }, td)).toBe(false);
    });
});
