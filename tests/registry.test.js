import { describe, test, expect } from 'bun:test';
import {
    STRING, NUMBER, NULL, UNDEFINED,
    STRICT_REJECT
} from 'uvd/catalog';
import { catalog } from 'uvd/catalog';
import { allocators, $allocators } from 'uvd/alloc';

describe('registry: isolation', () => {
    test('registry() returns an object with is, guard, conform, diagnose, etc.', () => {
        let r = catalog();
        let { object, array, union } = allocators(r);
        let { $object, $array, $union } = $allocators(r);
        expect(typeof object).toBe('function');
        expect(typeof array).toBe('function');
        expect(typeof union).toBe('function');
        expect(typeof $object).toBe('function');
        expect(typeof $array).toBe('function');
        expect(typeof $union).toBe('function');
        expect(typeof r.is).toBe('function');
        expect(typeof r.guard).toBe('function');
        expect(typeof r.conform).toBe('function');
        expect(typeof r.diagnose).toBe('function');
    });

    test('two registries have independent state', () => {
        let r1 = catalog();
        let r2 = catalog();
        let t1 = allocators(r1);
        let t2 = allocators(r2);

        let schema1 = t1.object({ name: STRING, age: NUMBER });
        let schema2 = t2.object({ x: NUMBER, y: NUMBER });

        // Each registry validates its own schemas correctly
        expect(r1.is({ name: 'Alice', age: 30 }, schema1)).toBe(true);
        expect(r2.is({ x: 1, y: 2 }, schema2)).toBe(true);
    });

    test('cross-registry typedef usage is undefined behavior', () => {
        let r1 = catalog();
        let r2 = catalog();
        let t1 = allocators(r1);

        let schema = t1.object({ name: STRING });

        // Using r1's schema with r2's is is undefined behavior.
        // r2's KINDS/OBJECTS are uninitialized at this index, so the result
        // is unpredictable. We just verify it doesn't throw.
        expect(() => r2.is({ name: 'Alice' }, schema)).not.toThrow();
    });

    test('registries have independent key dictionaries', () => {
        let r1 = catalog();
        let r2 = catalog();
        let t1 = allocators(r1);
        let t2 = allocators(r2);

        // Register schemas with different key sets
        t1.object({ alpha: STRING });
        t2.object({ beta: NUMBER });

        // Each registry only knows about its own keys
        let s1 = t1.object({ alpha: STRING });
        let s2 = t2.object({ beta: NUMBER });

        expect(r1.is({ alpha: 'hello' }, s1)).toBe(true);
        expect(r2.is({ beta: 42 }, s2)).toBe(true);
    });

    test('registries support arrays independently', () => {
        let r1 = catalog();
        let r2 = catalog();
        let t1 = allocators(r1);
        let t2 = allocators(r2);

        let arr1 = t1.array(STRING);
        let arr2 = t2.array(NUMBER);

        expect(r1.is(['a', 'b'], arr1)).toBe(true);
        expect(r1.is([1, 2], arr1)).toBe(false);

        expect(r2.is([1, 2], arr2)).toBe(true);
        expect(r2.is(['a', 'b'], arr2)).toBe(false);
    });

    test('registries support unions independently', () => {
        let r1 = catalog();
        let t1 = allocators(r1);

        let u = t1.union('kind', {
            a: t1.object({ kind: STRING, val: NUMBER }),
            b: t1.object({ kind: STRING, name: STRING })
        });

        expect(r1.is({ kind: 'a', val: 42 }, u)).toBe(true);
        expect(r1.is({ kind: 'b', name: 'hello' }, u)).toBe(true);
        expect(r1.is({ kind: 'c' }, u)).toBe(false);
    });

    test('registry supports nullable and optional complex types', () => {
        let r = catalog();
        let { object, array } = allocators(r);

        let schema = object({
            data: array(NUMBER) | NULL,
            meta: object({ v: STRING }) | NULL | UNDEFINED
        });

        expect(r.is({ data: [1, 2], meta: { v: 'ok' } }, schema)).toBe(true);
        expect(r.is({ data: null, meta: null }, schema)).toBe(true);
        expect(r.is({ data: [1, 2] }, schema)).toBe(true); // meta is optional
        expect(r.is({ data: 'wrong' }, schema)).toBe(false);
    });

    test('registry conform works with rich types', () => {
        let r = catalog();
        let { object } = allocators(r);
        let schema = object({ created: STRING | NUMBER });
        let obj = { created: 42 };
        expect(r.conform(obj, schema)).toBe(true);
        expect(obj.created).toBe(42);
    });

    test('registry strict works', () => {
        let r = catalog();
        let { object } = allocators(r);
        let schema = object({ name: STRING });

        expect(r.is({ name: 'Alice' }, schema, STRICT_REJECT)).toBe(true);
        expect(r.is({ name: 'Alice', extra: true }, schema, STRICT_REJECT)).toBe(false);
    });

    test('registry diagnose works', () => {
        let r = catalog();
        let { object } = allocators(r);
        let schema = object({ name: STRING, age: NUMBER });
        let errors = r.diagnose({ name: 42, age: 'wrong' }, schema);
        expect(errors.length).toBe(2);
    });
});
