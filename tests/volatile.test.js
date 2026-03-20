import { describe, test, expect } from 'bun:test';
import {
    STRING, NUMBER, NULL, STRICT_REJECT
} from 'uvd';
import { catalog } from 'uvd/catalog';

describe('volatile: basic usage', () => {
    test('v.object() creates a usable type', () => {
        let r = catalog();
        let schema = r.v.object({ name: STRING, age: NUMBER });
        expect(typeof schema).toBe('number');
        expect(r.is({ name: 'Alice', age: 30 }, schema)).toBe(true);
        expect(r.is({ name: 'Alice', age: '30' }, schema)).toBe(false);
    });

    test('v.array() creates a usable type', () => {
        let r = catalog();
        let schema = r.v.array(STRING);
        expect(r.is(['a', 'b'], schema)).toBe(true);
        expect(r.is([1, 2], schema)).toBe(false);
    });

    test('v.union() creates a usable type', () => {
        let r = catalog();
        let u = r.v.union('type', {
            a: r.v.object({ type: STRING, val: NUMBER }),
            b: r.v.object({ type: STRING, name: STRING })
        });
        expect(r.is({ type: 'a', val: 42 }, u)).toBe(true);
        expect(r.is({ type: 'b', name: 'hello' }, u)).toBe(true);
        expect(r.is({ type: 'c' }, u)).toBe(false);
    });

    test('volatile bit is set on volatile typedefs', () => {
        let r = catalog();
        let perm = r.t.object({ x: NUMBER });
        let vol = r.v.object({ x: NUMBER });
        // Bit 28 = VOLATILE
        expect((perm >>> 28) & 1).toBe(0);
        expect((vol >>> 28) & 1).toBe(1);
    });
});

describe('volatile: lifecycle', () => {
    test('volatile types are valid until next volatile allocation after check', () => {
        let r = catalog();

        // Create volatile type
        let schema = r.v.object({ name: STRING });

        // Use it multiple times — still valid (no new volatile alloc)
        expect(r.is({ name: 'Alice' }, schema)).toBe(true);
        expect(r.is({ name: 'Bob' }, schema)).toBe(true);

        // No wipe yet because no new volatile allocation happened
        expect(r.is({ name: 'Charlie' }, schema)).toBe(true);
    });

    test('volatile types are wiped on next volatile allocation after validation', () => {
        let r = catalog();

        // Create and use a volatile type
        let schema1 = r.v.object({ name: STRING });
        expect(r.is({ name: 'Alice' }, schema1)).toBe(true);

        // is sets needsWipe. Next v.* call triggers wipe.
        let schema2 = r.v.object({ x: NUMBER });

        // schema2 is valid
        expect(r.is({ x: 42 }, schema2)).toBe(true);

        // schema1 is now stale (its storage was overwritten)
        // We don't test what happens with stale types — it's undefined behavior
    });

    test('permanent types survive volatile wipes', () => {
        let r = catalog();

        // Create permanent type
        let permSchema = r.t.object({ name: STRING });

        // Create volatile type and validate
        let volSchema = r.v.object({ x: NUMBER });
        expect(r.is({ x: 42 }, volSchema)).toBe(true);

        // Wipe volatile (by allocating new volatile after check)
        let volSchema2 = r.v.object({ y: NUMBER });

        // Permanent type still works
        expect(r.is({ name: 'Alice' }, permSchema)).toBe(true);
        // New volatile type works
        expect(r.is({ y: 99 }, volSchema2)).toBe(true);
    });

    test('volatile types can reference permanent types', () => {
        let r = catalog();

        let Point = r.t.object({ x: NUMBER, y: NUMBER });
        let schema = r.v.object({ origin: Point, label: STRING });

        expect(r.is({ origin: { x: 1, y: 2 }, label: 'A' }, schema)).toBe(true);
        expect(r.is({ origin: { x: 1, y: '2' }, label: 'A' }, schema)).toBe(false);
    });

    test('volatile array with permanent element type', () => {
        let r = catalog();

        let Item = r.t.object({ id: NUMBER, name: STRING });
        let schema = r.v.array(Item);

        expect(r.is([{ id: 1, name: 'A' }], schema)).toBe(true);
        expect(r.is([{ id: 1, name: 42 }], schema)).toBe(false);
    });

    test('conform works with volatile types', () => {
        let r = catalog();
        let schema = r.v.object({ name: STRING, n: NUMBER });
        let obj = { name: 'Alice', n: 42 };
        expect(r.conform(obj, schema)).toBe(true);
    });

    test('strict works with volatile types', () => {
        let r = catalog();
        let schema = r.v.object({ name: STRING });
        expect(r.is({ name: 'Alice' }, schema, STRICT_REJECT)).toBe(true);
        expect(r.is({ name: 'Alice', extra: true }, schema, STRICT_REJECT)).toBe(false);
    });

    test('diagnose works with volatile types', () => {
        let r = catalog();
        let schema = r.v.object({ name: STRING, age: NUMBER });
        let errors = r.diagnose({ name: 42, age: 'wrong' }, schema);
        expect(errors.length).toBe(2);
    });

    test('nullable volatile types work', () => {
        let r = catalog();
        let schema = r.v.object({ name: STRING }) | NULL;
        expect(r.is(null, schema)).toBe(true);
        expect(r.is({ name: 'Alice' }, schema)).toBe(true);
        expect(r.is({ name: 42 }, schema)).toBe(false);
    });

    test('multiple validations without new allocs do not trigger wipe', () => {
        let r = catalog();
        let schema = r.v.object({ x: NUMBER });

        // Multiple checks — needsWipe gets set each time but no v.* calls happen
        for (let i = 0; i < 10; i++) {
            expect(r.is({ x: i }, schema)).toBe(true);
        }

        // Schema is still valid
        expect(r.is({ x: 999 }, schema)).toBe(true);
    });
});
