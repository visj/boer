import { describe, test, expect } from 'bun:test';
import {
    STRING, NUMBER, NULL, UNDEFINED,
} from '@luvd/core';
import { catalog } from '@luvd/validate';
import { allocators } from '@luvd/builder';
import { createConform } from '@luvd/conform';
import { createDiagnose } from '@luvd/diagnose';

describe('catalog: isolation', () => {
    test('catalog() returns an object with validate, etc.', () => {
        let r = catalog();
        let { object, array, union } = allocators(r);
        expect(typeof object).toBe('function');
        expect(typeof array).toBe('function');
        expect(typeof union).toBe('function');
        expect(typeof r.validate).toBe('function');
        expect(typeof createConform(r)).toBe('function');
        expect(typeof createDiagnose(r)).toBe('function');
    });

    test('two catalogs have independent state', () => {
        let r1 = catalog();
        let r2 = catalog();
        let t1 = allocators(r1);
        let t2 = allocators(r2);

        let schema1 = t1.object({ name: STRING, age: NUMBER });
        let schema2 = t2.object({ x: NUMBER, y: NUMBER });

        // Each catalog validates its own schemas correctly
        expect(r1.validate({ name: 'Alice', age: 30 }, schema1)).toBe(true);
        expect(r2.validate({ x: 1, y: 2 }, schema2)).toBe(true);
    });

    test('cross-catalog typedef usage is undefined behavior', () => {
        let r1 = catalog();
        let r2 = catalog();
        let t1 = allocators(r1);

        let schema = t1.object({ name: STRING });

        // Using r1's schema with r2's is is undefined behavior.
        // r2's KINDS/OBJECTS are uninitialized at this index, so the result
        // is unpredictable. We just verify it doesn't throw.
        expect(() => r2.validate({ name: 'Alice' }, schema)).not.toThrow();
    });

    test('catalogs have independent key dictionaries', () => {
        let r1 = catalog();
        let r2 = catalog();
        let t1 = allocators(r1);
        let t2 = allocators(r2);

        // Register schemas with different key sets
        t1.object({ alpha: STRING });
        t2.object({ beta: NUMBER });

        // Each catalog only knows about its own keys
        let s1 = t1.object({ alpha: STRING });
        let s2 = t2.object({ beta: NUMBER });

        expect(r1.validate({ alpha: 'hello' }, s1)).toBe(true);
        expect(r2.validate({ beta: 42 }, s2)).toBe(true);
    });

    test('catalogs support arrays independently', () => {
        let r1 = catalog();
        let r2 = catalog();
        let t1 = allocators(r1);
        let t2 = allocators(r2);

        let arr1 = t1.array(STRING);
        let arr2 = t2.array(NUMBER);

        expect(r1.validate(['a', 'b'], arr1)).toBe(true);
        expect(r1.validate([1, 2], arr1)).toBe(false);

        expect(r2.validate([1, 2], arr2)).toBe(true);
        expect(r2.validate(['a', 'b'], arr2)).toBe(false);
    });

    test('catalogs support unions independently', () => {
        let r1 = catalog();
        let t1 = allocators(r1);

        let u = t1.union('kind', {
            a: t1.object({ kind: STRING, val: NUMBER }),
            b: t1.object({ kind: STRING, name: STRING })
        });

        expect(r1.validate({ kind: 'a', val: 42 }, u)).toBe(true);
        expect(r1.validate({ kind: 'b', name: 'hello' }, u)).toBe(true);
        expect(r1.validate({ kind: 'c' }, u)).toBe(false);
    });

    test('catalog supports nullable and optional complex types', () => {
        let r = catalog();
        let { object, array } = allocators(r);

        let schema = object({
            data: array(NUMBER) | NULL,
            meta: object({ v: STRING }) | NULL | UNDEFINED
        });

        expect(r.validate({ data: [1, 2], meta: { v: 'ok' } }, schema)).toBe(true);
        expect(r.validate({ data: null, meta: null }, schema)).toBe(true);
        expect(r.validate({ data: [1, 2] }, schema)).toBe(true); // meta is optional
        expect(r.validate({ data: 'wrong' }, schema)).toBe(false);
    });

    test.skip('catalog conform works with rich types', () => {
        let r = catalog();
        let conform = createConform(r);
        let { object } = allocators(r);
        let schema = object({ created: STRING | NUMBER });
        let obj = { created: 42 };
        expect(conform(obj, schema)).toBe(true);
        expect(obj.created).toBe(42);
    });

    test('catalog additionalProperties false works', () => {
        let r = catalog();
        let { object } = allocators(r);
        let schema = object({ name: STRING }, { additionalProperties: false });

        expect(r.validate({ name: 'Alice' }, schema)).toBe(true);
        expect(r.validate({ name: 'Alice', extra: true }, schema)).toBe(false);
    });

    test.skip('catalog diagnose works', () => {
        let r = catalog();
        let diagnose = createDiagnose(r);
        let { object } = allocators(r);
        let schema = object({ name: STRING, age: NUMBER });
        let errors = diagnose({ name: 42, age: 'wrong' }, schema);
        expect(errors.length).toBe(2);
    });
});
