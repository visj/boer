import { describe, test, expect } from 'bun:test';
import {
    STRING, NUMBER, NULL, UNDEFINED,
    STRICT_REJECT
} from 'uvd/catalog';
import { catalog } from 'uvd/catalog';

describe('registry: isolation', () => {
    test('registry() returns an object with t, v, check, diagnose, etc.', () => {
        let r = catalog();
        expect(typeof r.t.object).toBe('function');
        expect(typeof r.t.array).toBe('function');
        expect(typeof r.t.union).toBe('function');
        expect(typeof r.v.object).toBe('function');
        expect(typeof r.v.array).toBe('function');
        expect(typeof r.v.union).toBe('function');
        expect(typeof r.is).toBe('function');
        expect(typeof r.guard).toBe('function');
        expect(typeof r.conform).toBe('function');
        expect(typeof r.diagnose).toBe('function');
    });

    test('two registries have independent state', () => {
        let r1 = catalog();
        let r2 = catalog();

        let schema1 = r1.t.object({ name: STRING, age: NUMBER });
        let schema2 = r2.t.object({ x: NUMBER, y: NUMBER });

        // Each registry validates its own schemas correctly
        expect(r1.is({ name: 'Alice', age: 30 }, schema1)).toBe(true);
        expect(r2.is({ x: 1, y: 2 }, schema2)).toBe(true);
    });

    test('cross-registry typedef usage is undefined behavior', () => {
        let r1 = catalog();
        let r2 = catalog();

        let schema = r1.t.object({ name: STRING });

        // Using r1's schema with r2's is is undefined behavior.
        // r2's KINDS/OBJECTS are uninitialized at this index, so the result
        // is unpredictable. We just verify it doesn't throw.
        expect(() => r2.is({ name: 'Alice' }, schema)).not.toThrow();
    });

    test('registries have independent key dictionaries', () => {
        let r1 = catalog();
        let r2 = catalog();

        // Register schemas with different key sets
        r1.t.object({ alpha: STRING });
        r2.t.object({ beta: NUMBER });

        // Each registry only knows about its own keys
        let s1 = r1.t.object({ alpha: STRING });
        let s2 = r2.t.object({ beta: NUMBER });

        expect(r1.is({ alpha: 'hello' }, s1)).toBe(true);
        expect(r2.is({ beta: 42 }, s2)).toBe(true);
    });

    test('registries support arrays independently', () => {
        let r1 = catalog();
        let r2 = catalog();

        let arr1 = r1.t.array(STRING);
        let arr2 = r2.t.array(NUMBER);

        expect(r1.is(['a', 'b'], arr1)).toBe(true);
        expect(r1.is([1, 2], arr1)).toBe(false);

        expect(r2.is([1, 2], arr2)).toBe(true);
        expect(r2.is(['a', 'b'], arr2)).toBe(false);
    });

    test('registries support unions independently', () => {
        let r1 = catalog();

        let u = r1.t.union('kind', {
            a: r1.t.object({ kind: STRING, val: NUMBER }),
            b: r1.t.object({ kind: STRING, name: STRING })
        });

        expect(r1.is({ kind: 'a', val: 42 }, u)).toBe(true);
        expect(r1.is({ kind: 'b', name: 'hello' }, u)).toBe(true);
        expect(r1.is({ kind: 'c' }, u)).toBe(false);
    });

    test('registry supports nullable and optional complex types', () => {
        let r = catalog();

        let schema = r.t.object({
            data: r.t.array(NUMBER) | NULL,
            meta: r.t.object({ v: STRING }) | NULL | UNDEFINED
        });

        expect(r.is({ data: [1, 2], meta: { v: 'ok' } }, schema)).toBe(true);
        expect(r.is({ data: null, meta: null }, schema)).toBe(true);
        expect(r.is({ data: [1, 2] }, schema)).toBe(true); // meta is optional
        expect(r.is({ data: 'wrong' }, schema)).toBe(false);
    });

    test('registry conform works with rich types', () => {
        let r = catalog();
        let schema = r.t.object({ created: STRING | NUMBER });
        let obj = { created: 42 };
        expect(r.conform(obj, schema)).toBe(true);
        expect(obj.created).toBe(42);
    });

    test('registry strict works', () => {
        let r = catalog();
        let schema = r.t.object({ name: STRING });

        expect(r.is({ name: 'Alice' }, schema, STRICT_REJECT)).toBe(true);
        expect(r.is({ name: 'Alice', extra: true }, schema, STRICT_REJECT)).toBe(false);
    });

    test('registry diagnose works', () => {
        let r = catalog();
        let schema = r.t.object({ name: STRING, age: NUMBER });
        let errors = r.diagnose({ name: 42, age: 'wrong' }, schema);
        expect(errors.length).toBe(2);
    });
});
