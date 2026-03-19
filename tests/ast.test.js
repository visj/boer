import { describe, test, expect } from 'bun:test';
import {
    BOOLEAN, NUMBER, STRING, BIGINT, DATE, URI, PRIMITIVE,
    NULL, UNDEFINED, catalog,
} from 'uvd/catalog';
import { compile } from '../src/ast.js';

describe('ast: compile primitives', () => {
    test('raw number passthrough', () => {
        let cat = catalog();
        let result = compile(cat, { root: STRING, defs: [], names: [] });
        expect(result.root).toBe(STRING);
        expect(cat.is('hello', result.root)).toBe(true);
        expect(cat.is(42, result.root)).toBe(false);
    });

    test('nullable primitive', () => {
        let cat = catalog();
        let nullable = (STRING | NULL) >>> 0;
        let result = compile(cat, { root: nullable, defs: [], names: [] });
        expect(cat.is(null, result.root)).toBe(true);
        expect(cat.is('hello', result.root)).toBe(true);
        expect(cat.is(42, result.root)).toBe(false);
    });
});

describe('ast: compile objects', () => {
    test('simple object', () => {
        let cat = catalog();
        let ast = {
            root: { k: 1, p: { name: STRING, age: NUMBER } },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(typeof result.root).toBe('number');
        expect(cat.is({ name: 'Alice', age: 30 }, result.root)).toBe(true);
        expect(cat.is({ name: 'Alice' }, result.root)).toBe(false);
        expect(cat.is({ name: 'Alice', age: 'thirty' }, result.root)).toBe(false);
    });

    test('nested objects', () => {
        let cat = catalog();
        let ast = {
            root: {
                k: 1,
                p: {
                    name: STRING,
                    address: {
                        k: 1,
                        p: { street: STRING, city: STRING },
                    },
                },
            },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.is({ name: 'Bob', address: { street: '123 Main', city: 'NY' } }, result.root)).toBe(true);
        expect(cat.is({ name: 'Bob', address: { street: '123 Main' } }, result.root)).toBe(false);
    });

    test('object with validators (minProperties, maxProperties)', () => {
        let cat = catalog();
        let ast = {
            root: {
                k: 1,
                p: { a: STRING, b: STRING, c: STRING },
                v: { a: 2, b: 3 },
            },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.is({ a: 'x', b: 'y' }, result.root)).toBe(false);
        expect(cat.is({ a: 'x', b: 'y', c: 'z' }, result.root)).toBe(true);
    });
});

describe('ast: compile arrays', () => {
    test('simple array', () => {
        let cat = catalog();
        let ast = {
            root: { k: 2, i: STRING },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.is(['hello', 'world'], result.root)).toBe(true);
        expect(cat.is([1, 2, 3], result.root)).toBe(false);
        expect(cat.is('not array', result.root)).toBe(false);
    });

    test('array with validators (minItems, maxItems) via validate()', () => {
        let cat = catalog();
        let ast = {
            root: { k: 2, i: NUMBER, v: { a: 2, b: 5 } },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.validate([1], result.root)).toBe(false);
        expect(cat.validate([1, 2], result.root)).toBe(true);
        expect(cat.validate([1, 2, 3, 4, 5], result.root)).toBe(true);
        expect(cat.validate([1, 2, 3, 4, 5, 6], result.root)).toBe(false);
    });

    test('array of objects', () => {
        let cat = catalog();
        let ast = {
            root: {
                k: 2,
                i: { k: 1, p: { id: NUMBER, name: STRING } },
            },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.is([{ id: 1, name: 'Alice' }], result.root)).toBe(true);
        expect(cat.is([{ id: 'one', name: 'Alice' }], result.root)).toBe(false);
    });
});

describe('ast: compile union', () => {
    test('discriminated union', () => {
        let cat = catalog();
        let dogType = { k: 1, p: { name: STRING, breed: STRING } };
        let catType = { k: 1, p: { name: STRING, lives: NUMBER } };
        let ast = {
            root: {
                k: 3,
                d: 'type',
                m: { dog: dogType, cat: catType },
            },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.is({ type: 'dog', name: 'Rex', breed: 'Lab' }, result.root)).toBe(true);
        expect(cat.is({ type: 'cat', name: 'Whiskers', lives: 9 }, result.root)).toBe(true);
        expect(cat.is({ type: 'fish', name: 'Nemo' }, result.root)).toBe(false);
    });
});

describe('ast: compile tuple', () => {
    test('simple tuple', () => {
        let cat = catalog();
        let ast = {
            root: { k: 5, i: [STRING, NUMBER, BOOLEAN] },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.is(['hello', 42, true], result.root)).toBe(true);
        expect(cat.is(['hello', 42], result.root)).toBe(false);
        expect(cat.is(['hello', 'world', true], result.root)).toBe(false);
    });
});

describe('ast: compile record', () => {
    test('record of numbers', () => {
        let cat = catalog();
        let ast = {
            root: { k: 6, i: NUMBER },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.is({ a: 1, b: 2 }, result.root)).toBe(true);
        expect(cat.is({ a: 1, b: 'two' }, result.root)).toBe(false);
    });
});

describe('ast: compile or (anyOf)', () => {
    test('primitive or — fast path', () => {
        let cat = catalog();
        let ast = {
            root: { k: 7, i: [STRING, NUMBER] },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.is('hello', result.root)).toBe(true);
        expect(cat.is(42, result.root)).toBe(true);
        expect(cat.is(true, result.root)).toBe(false);
    });

    test('complex or', () => {
        let cat = catalog();
        let ast = {
            root: {
                k: 7,
                i: [
                    { k: 1, p: { name: STRING } },
                    { k: 2, i: NUMBER },
                ],
            },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.is({ name: 'Alice' }, result.root)).toBe(true);
        expect(cat.is([1, 2, 3], result.root)).toBe(true);
        expect(cat.is('string', result.root)).toBe(false);
    });
});

describe('ast: compile exclusive (oneOf)', () => {
    test('exclusive types', () => {
        let cat = catalog();
        let ast = {
            root: { k: 8, i: [STRING, NUMBER] },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.is('hello', result.root)).toBe(true);
        expect(cat.is(42, result.root)).toBe(true);
        expect(cat.is(true, result.root)).toBe(false);
    });
});

describe('ast: compile intersect (allOf)', () => {
    test('intersect objects', () => {
        let cat = catalog();
        let ast = {
            root: {
                k: 9,
                i: [
                    { k: 1, p: { name: STRING } },
                    { k: 1, p: { age: NUMBER } },
                ],
            },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.is({ name: 'Alice', age: 30 }, result.root)).toBe(true);
        expect(cat.is({ name: 'Alice' }, result.root)).toBe(false);
    });
});

describe('ast: compile not', () => {
    test('not string', () => {
        let cat = catalog();
        let ast = {
            root: { k: 10, i: STRING },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.is(42, result.root)).toBe(true);
        expect(cat.is('hello', result.root)).toBe(false);
    });
});

describe('ast: compile conditional (if/then/else)', () => {
    test('if/then/else', () => {
        let cat = catalog();
        let ast = {
            root: {
                k: 11,
                if: STRING,
                then: STRING,
                else: NUMBER,
            },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        expect(cat.is('hello', result.root)).toBe(true);
        expect(cat.is(42, result.root)).toBe(true);
        expect(cat.is(true, result.root)).toBe(false);
    });
});

describe('ast: compile refine', () => {
    test('refine with callback via validate()', () => {
        let cat = catalog();
        let ast = {
            root: {
                k: 4,
                i: NUMBER,
                f: (val) => val > 0,
            },
            defs: [],
            names: [],
        };
        let result = compile(cat, ast);
        // is() only checks the inner type, not the callback
        expect(cat.is(5, result.root)).toBe(true);
        expect(cat.is(-1, result.root)).toBe(true);
        expect(cat.is('hello', result.root)).toBe(false);
        // validate() checks both inner type AND callback
        expect(cat.validate(5, result.root)).toBe(true);
        expect(cat.validate(-1, result.root)).toBe(false);
        expect(cat.validate('hello', result.root)).toBe(false);
    });
});

describe('ast: compile refs (defs)', () => {
    test('simple def reference', () => {
        let cat = catalog();
        let addressNode = { k: 1, p: { street: STRING, city: STRING } };
        let ast = {
            root: {
                k: 1,
                p: {
                    name: STRING,
                    address: { k: 12, r: 0 },
                },
            },
            defs: [addressNode],
            names: ['Address'],
        };
        let result = compile(cat, ast);
        expect(typeof result.root).toBe('number');
        expect(typeof result.defs['Address']).toBe('number');
        expect(cat.is({ name: 'Alice', address: { street: '123 Main', city: 'NY' } }, result.root)).toBe(true);
        expect(cat.is({ name: 'Alice', address: { street: '123 Main' } }, result.root)).toBe(false);
    });

    test('def reused multiple times', () => {
        let cat = catalog();
        let stringArrayNode = { k: 2, i: STRING };
        let ast = {
            root: {
                k: 1,
                p: {
                    tags: { k: 12, r: 0 },
                    labels: { k: 12, r: 0 },
                },
            },
            defs: [stringArrayNode],
            names: ['StringArray'],
        };
        let result = compile(cat, ast);
        expect(cat.is({ tags: ['a', 'b'], labels: ['c'] }, result.root)).toBe(true);
        expect(cat.is({ tags: ['a', 'b'], labels: [1] }, result.root)).toBe(false);
    });

    test('multiple defs', () => {
        let cat = catalog();
        let ast = {
            root: {
                k: 1,
                p: {
                    user: { k: 12, r: 0 },
                    comment: { k: 12, r: 1 },
                },
            },
            defs: [
                { k: 1, p: { name: STRING } },
                { k: 1, p: { text: STRING, author: { k: 12, r: 0 } } },
            ],
            names: ['User', 'Comment'],
        };
        let result = compile(cat, ast);
        expect(typeof result.defs['User']).toBe('number');
        expect(typeof result.defs['Comment']).toBe('number');

        let data = {
            user: { name: 'Alice' },
            comment: { text: 'Great!', author: { name: 'Bob' } },
        };
        expect(cat.is(data, result.root)).toBe(true);
        expect(cat.is({ user: { name: 'Alice' }, comment: { text: 'Great!', author: { name: 42 } } }, result.root)).toBe(false);
    });

    test('primitive def gets promoted to K_PRIMITIVE', () => {
        let cat = catalog();
        let ast = {
            root: { k: 12, r: 0 },
            defs: [STRING],
            names: ['MyString'],
        };
        let result = compile(cat, ast);
        expect(cat.is('hello', result.root)).toBe(true);
        expect(cat.is(42, result.root)).toBe(false);
    });

    test('CompiledSchema defs can be used directly with is()', () => {
        let cat = catalog();
        let ast = {
            root: NUMBER,
            defs: [
                { k: 1, p: { name: STRING, age: NUMBER } },
            ],
            names: ['User'],
        };
        let result = compile(cat, ast);
        expect(cat.is({ name: 'Alice', age: 30 }, result.defs['User'])).toBe(true);
        expect(cat.is({ name: 'Alice' }, result.defs['User'])).toBe(false);
    });
});

describe('ast: string validators', () => {
    test('minLength and maxLength', () => {
        let cat = catalog();
        let ast = {
            root: {
                k: 1,
                p: {
                    name: {
                        k: 1,
                        p: { value: STRING },
                    },
                },
            },
            defs: [],
            names: [],
        };
        // This test just verifies the compilation works with nested objects
        let result = compile(cat, ast);
        expect(cat.is({ name: { value: 'test' } }, result.root)).toBe(true);
    });
});
