import { describe, test, expect } from 'bun:test';
import {
    STRING, NUMBER, NULL, STRICT_REJECT, registry
} from 'uvd/core';

describe('volatile: basic usage', () => {
    test('v.object() creates a usable type', () => {
        let r = registry();
        let schema = r.v.object({ name: STRING, age: NUMBER });
        expect(typeof schema).toBe('number');
        expect(r.check({ name: 'Alice', age: 30 }, schema)).toBe(true);
        expect(r.check({ name: 'Alice', age: '30' }, schema)).toBe(false);
    });

    test('v.array() creates a usable type', () => {
        let r = registry();
        let schema = r.v.array(STRING);
        expect(r.check(['a', 'b'], schema)).toBe(true);
        expect(r.check([1, 2], schema)).toBe(false);
    });

    test('v.union() creates a usable type', () => {
        let r = registry();
        let u = r.v.union('type', {
            a: r.v.object({ type: STRING, val: NUMBER }),
            b: r.v.object({ type: STRING, name: STRING })
        });
        expect(r.check({ type: 'a', val: 42 }, u)).toBe(true);
        expect(r.check({ type: 'b', name: 'hello' }, u)).toBe(true);
        expect(r.check({ type: 'c' }, u)).toBe(false);
    });

    test('volatile bit is set on volatile typedefs', () => {
        let r = registry();
        let perm = r.t.object({ x: NUMBER });
        let vol = r.v.object({ x: NUMBER });
        // Bit 28 = VOLATILE
        expect((perm >>> 28) & 1).toBe(0);
        expect((vol >>> 28) & 1).toBe(1);
    });
});

describe('volatile: lifecycle', () => {
    test('volatile types are valid until next volatile allocation after check', () => {
        let r = registry();

        // Create volatile type
        let schema = r.v.object({ name: STRING });

        // Use it multiple times — still valid (no new volatile alloc)
        expect(r.check({ name: 'Alice' }, schema)).toBe(true);
        expect(r.check({ name: 'Bob' }, schema)).toBe(true);

        // No wipe yet because no new volatile allocation happened
        expect(r.check({ name: 'Charlie' }, schema)).toBe(true);
    });

    test('volatile types are wiped on next volatile allocation after validation', () => {
        let r = registry();

        // Create and use a volatile type
        let schema1 = r.v.object({ name: STRING });
        expect(r.check({ name: 'Alice' }, schema1)).toBe(true);

        // check() sets needsWipe. Next v.* call triggers wipe.
        let schema2 = r.v.object({ x: NUMBER });

        // schema2 is valid
        expect(r.check({ x: 42 }, schema2)).toBe(true);

        // schema1 is now stale (its storage was overwritten)
        // We don't test what happens with stale types — it's undefined behavior
    });

    test('permanent types survive volatile wipes', () => {
        let r = registry();

        // Create permanent type
        let permSchema = r.t.object({ name: STRING });

        // Create volatile type and validate
        let volSchema = r.v.object({ x: NUMBER });
        expect(r.check({ x: 42 }, volSchema)).toBe(true);

        // Wipe volatile (by allocating new volatile after check)
        let volSchema2 = r.v.object({ y: NUMBER });

        // Permanent type still works
        expect(r.check({ name: 'Alice' }, permSchema)).toBe(true);
        // New volatile type works
        expect(r.check({ y: 99 }, volSchema2)).toBe(true);
    });

    test('volatile types can reference permanent types', () => {
        let r = registry();

        let Point = r.t.object({ x: NUMBER, y: NUMBER });
        let schema = r.v.object({ origin: Point, label: STRING });

        expect(r.check({ origin: { x: 1, y: 2 }, label: 'A' }, schema)).toBe(true);
        expect(r.check({ origin: { x: 1, y: '2' }, label: 'A' }, schema)).toBe(false);
    });

    test('volatile array with permanent element type', () => {
        let r = registry();

        let Item = r.t.object({ id: NUMBER, name: STRING });
        let schema = r.v.array(Item);

        expect(r.check([{ id: 1, name: 'A' }], schema)).toBe(true);
        expect(r.check([{ id: 1, name: 42 }], schema)).toBe(false);
    });

    test('conform works with volatile types', () => {
        let r = registry();
        let schema = r.v.object({ name: STRING, n: NUMBER });
        let obj = { name: 'Alice', n: 42 };
        expect(r.conform(obj, schema)).toBe(true);
    });

    test('strict works with volatile types', () => {
        let r = registry();
        let schema = r.v.object({ name: STRING });
        expect(r.check({ name: 'Alice' }, schema, STRICT_REJECT)).toBe(true);
        expect(r.check({ name: 'Alice', extra: true }, schema, STRICT_REJECT)).toBe(false);
    });

    test('diagnose works with volatile types', () => {
        let r = registry();
        let schema = r.v.object({ name: STRING, age: NUMBER });
        let errors = r.diagnose({ name: 42, age: 'wrong' }, schema);
        expect(errors.length).toBe(2);
    });

    test('nullable volatile types work', () => {
        let r = registry();
        let schema = r.v.object({ name: STRING }) | NULL;
        expect(r.check(null, schema)).toBe(true);
        expect(r.check({ name: 'Alice' }, schema)).toBe(true);
        expect(r.check({ name: 42 }, schema)).toBe(false);
    });

    test('multiple validations without new allocs do not trigger wipe', () => {
        let r = registry();
        let schema = r.v.object({ x: NUMBER });

        // Multiple checks — needsWipe gets set each time but no v.* calls happen
        for (let i = 0; i < 10; i++) {
            expect(r.check({ x: i }, schema)).toBe(true);
        }

        // Schema is still valid
        expect(r.check({ x: 999 }, schema)).toBe(true);
    });
});
