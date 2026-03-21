import { describe, test, expect } from 'bun:test';
import {
    STRING, NUMBER, NULL, STRICT_REJECT
} from 'uvd';
import { catalog } from 'uvd/catalog';
import { allocators, $allocators } from 'uvd/alloc';

describe('scratch: basic usage', () => {
    test('$object() creates a usable type', () => {
        let cat = catalog();
        let { $object } = $allocators(cat);
        let { is } = cat;
        let schema = $object({ name: STRING, age: NUMBER });
        expect(typeof schema).toBe('number');
        expect(is({ name: 'Alice', age: 30 }, schema)).toBe(true);
        expect(is({ name: 'Alice', age: '30' }, schema)).toBe(false);
    });

    test('$array() creates a usable type', () => {
        let cat = catalog();
        let { $array } = $allocators(cat);
        let { is } = cat;
        let schema = $array(STRING);
        expect(is(['a', 'b'], schema)).toBe(true);
        expect(is([1, 2], schema)).toBe(false);
    });

    test('$union() creates a usable type', () => {
        let cat = catalog();
        let { $object, $union } = $allocators(cat);
        let { is } = cat;
        let u = $union('type', {
            a: $object({ type: STRING, val: NUMBER }),
            b: $object({ type: STRING, name: STRING })
        });
        expect(is({ type: 'a', val: 42 }, u)).toBe(true);
        expect(is({ type: 'b', name: 'hello' }, u)).toBe(true);
        expect(is({ type: 'c' }, u)).toBe(false);
    });

    test('scratch bit is set on scratch typedefs', () => {
        let cat = catalog();
        let { object } = allocators(cat);
        let { $object } = $allocators(cat);
        let perm = object({ x: NUMBER });
        let vol = $object({ x: NUMBER });
        // Bit 28 = SCRATCH
        expect((perm >>> 28) & 1).toBe(0);
        expect((vol >>> 28) & 1).toBe(1);
    });
});

describe('scratch: lifecycle', () => {
    test('scratch types are valid until next scratch allocation after check', () => {
        let cat = catalog();
        let { $object } = $allocators(cat);
        let { is } = cat;

        // Create scratch type
        let schema = $object({ name: STRING });

        // Use it multiple times — still valid (no new scratch alloc)
        expect(is({ name: 'Alice' }, schema)).toBe(true);
        expect(is({ name: 'Bob' }, schema)).toBe(true);

        // No wipe yet because no new scratch allocation happened
        expect(is({ name: 'Charlie' }, schema)).toBe(true);
    });

    test('scratch types are wiped on next scratch allocation after validation', () => {
        let cat = catalog();
        let { $object } = $allocators(cat);
        let { is } = cat;

        // Create and use a scratch type
        let schema1 = $object({ name: STRING });
        expect(is({ name: 'Alice' }, schema1)).toBe(true);

        // is sets needsWipe. Next $* call triggers wipe.
        let schema2 = $object({ x: NUMBER });

        // schema2 is valid
        expect(is({ x: 42 }, schema2)).toBe(true);

        // schema1 is now stale (its storage was overwritten)
        // We don't test what happens with stale types — it's undefined behavior
    });

    test('permanent types survive scratch wipes', () => {
        let cat = catalog();
        let { object } = allocators(cat);
        let { $object } = $allocators(cat);
        let { is } = cat;

        // Create permanent type
        let permSchema = object({ name: STRING });

        // Create scratch type and validate
        let volSchema = $object({ x: NUMBER });
        expect(is({ x: 42 }, volSchema)).toBe(true);

        // Wipe scratch (by allocating new scratch after check)
        let volSchema2 = $object({ y: NUMBER });

        // Permanent type still works
        expect(is({ name: 'Alice' }, permSchema)).toBe(true);
        // New scratch type works
        expect(is({ y: 99 }, volSchema2)).toBe(true);
    });

    test('scratch types can reference permanent types', () => {
        let cat = catalog();
        let { object } = allocators(cat);
        let { $object } = $allocators(cat);
        let { is } = cat;

        let Point = object({ x: NUMBER, y: NUMBER });
        let schema = $object({ origin: Point, label: STRING });

        expect(is({ origin: { x: 1, y: 2 }, label: 'A' }, schema)).toBe(true);
        expect(is({ origin: { x: 1, y: '2' }, label: 'A' }, schema)).toBe(false);
    });

    test('scratch array with permanent element type', () => {
        let cat = catalog();
        let { object } = allocators(cat);
        let { $array } = $allocators(cat);
        let { is } = cat;

        let Item = object({ id: NUMBER, name: STRING });
        let schema = $array(Item);

        expect(is([{ id: 1, name: 'A' }], schema)).toBe(true);
        expect(is([{ id: 1, name: 42 }], schema)).toBe(false);
    });

    test('conform works with scratch types', () => {
        let cat = catalog();
        let { $object } = $allocators(cat);
        let { conform } = cat;
        let schema = $object({ name: STRING, n: NUMBER });
        let obj = { name: 'Alice', n: 42 };
        expect(conform(obj, schema)).toBe(true);
    });

    test('strict works with scratch types', () => {
        let cat = catalog();
        let { $object } = $allocators(cat);
        let { is } = cat;
        let schema = $object({ name: STRING });
        expect(is({ name: 'Alice' }, schema, STRICT_REJECT)).toBe(true);
        expect(is({ name: 'Alice', extra: true }, schema, STRICT_REJECT)).toBe(false);
    });

    test('diagnose works with scratch types', () => {
        let cat = catalog();
        let { $object } = $allocators(cat);
        let { diagnose } = cat;
        let schema = $object({ name: STRING, age: NUMBER });
        let errors = diagnose({ name: 42, age: 'wrong' }, schema);
        expect(errors.length).toBe(2);
    });

    test('nullable scratch types work', () => {
        let cat = catalog();
        let { $object } = $allocators(cat);
        let { is } = cat;
        let schema = $object({ name: STRING }) | NULL;
        expect(is(null, schema)).toBe(true);
        expect(is({ name: 'Alice' }, schema)).toBe(true);
        expect(is({ name: 42 }, schema)).toBe(false);
    });

    test('multiple validations without new allocs do not trigger wipe', () => {
        let cat = catalog();
        let { $object } = $allocators(cat);
        let { is } = cat;
        let schema = $object({ x: NUMBER });

        // Multiple checks — needsWipe gets set each time but no $* calls happen
        for (let i = 0; i < 10; i++) {
            expect(is({ x: i }, schema)).toBe(true);
        }

        // Schema is still valid
        expect(is({ x: 999 }, schema)).toBe(true);
    });
});
