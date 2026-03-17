import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, NUMBER, STRING, registry
} from '../';

const { t, strict } = registry();

describe('strict reject: flat objects', () => {
    let Schema = t.object({ name: STRING, age: NUMBER });

    test('exact match passes', () => {
        expect(strict({ name: 'Alice', age: 30 }, Schema)).toBe(true);
    });

    test('extra property fails', () => {
        expect(strict({ name: 'Alice', age: 30, extra: true }, Schema)).toBe(false);
    });

    test('multiple extra properties fail', () => {
        expect(strict({ name: 'Alice', age: 30, a: 1, b: 2, c: 3 }, Schema)).toBe(false);
    });

    test('missing required property fails', () => {
        expect(strict({ name: 'Alice' }, Schema)).toBe(false);
    });

    test('wrong type fails', () => {
        expect(strict({ name: 'Alice', age: '30' }, Schema)).toBe(false);
    });

    test('null for non-nullable fails', () => {
        expect(strict({ name: null, age: 30 }, Schema)).toBe(false);
    });

    test('non-object input fails', () => {
        expect(strict('string', Schema)).toBe(false);
        expect(strict(42, Schema)).toBe(false);
        expect(strict(true, Schema)).toBe(false);
        expect(strict([], Schema)).toBe(false);
    });
});

describe('strict reject: nullable/optional fields', () => {
    let Schema = t.object({
        required: STRING,
        nullable: STRING | NULL,
        optional: STRING | UNDEFINED,
        both: STRING | NULL | UNDEFINED
    });

    test('all present passes', () => {
        expect(strict({ required: 'a', nullable: 'b', optional: 'c', both: 'd' }, Schema)).toBe(true);
    });

    test('nullable field as null passes', () => {
        expect(strict({ required: 'a', nullable: null, optional: 'c', both: 'd' }, Schema)).toBe(true);
    });

    test('optional field missing passes', () => {
        expect(strict({ required: 'a', nullable: 'b', both: 'd' }, Schema)).toBe(true);
    });

    test('both field as null passes', () => {
        expect(strict({ required: 'a', nullable: 'b', both: null }, Schema)).toBe(true);
    });

    test('both field missing passes', () => {
        expect(strict({ required: 'a', nullable: 'b' }, Schema)).toBe(true);
    });

    test('extra prop still rejected', () => {
        expect(strict({ required: 'a', nullable: 'b', extra: 1 }, Schema)).toBe(false);
    });
});

describe('strict reject: nested objects', () => {
    let Schema = t.object({
        user: t.object({
            name: STRING,
            address: t.object({
                city: STRING
            })
        })
    });

    test('exact nested match passes', () => {
        expect(strict({ user: { name: 'Alice', address: { city: 'NY' } } }, Schema)).toBe(true);
    });

    test('extra on outermost fails', () => {
        expect(strict({ user: { name: 'Alice', address: { city: 'NY' } }, extra: 1 }, Schema)).toBe(false);
    });

    test('extra on middle level fails', () => {
        expect(strict({ user: { name: 'Alice', address: { city: 'NY' }, extra: 1 } }, Schema)).toBe(false);
    });

    test('extra on deepest level fails', () => {
        expect(strict({ user: { name: 'Alice', address: { city: 'NY', extra: 1 } } }, Schema)).toBe(false);
    });
});

describe('strict reject: arrays', () => {
    test('array of primitives (no object checking needed)', () => {
        let Schema = t.object({ tags: t.array(STRING) });
        expect(strict({ tags: ['a', 'b'] }, Schema)).toBe(true);
        expect(strict({ tags: ['a', 'b'], extra: 1 }, Schema)).toBe(false);
    });

    test('array of objects — checks each element', () => {
        let Item = t.object({ id: NUMBER, name: STRING });
        let Schema = t.object({ items: t.array(Item) });
        expect(strict({ items: [{ id: 1, name: 'A' }] }, Schema)).toBe(true);
        expect(strict({ items: [{ id: 1, name: 'A', extra: true }] }, Schema)).toBe(false);
    });

    test('nested array of objects', () => {
        let Cell = t.object({ v: NUMBER });
        let Schema = t.object({ grid: t.array(t.array(Cell)) });
        expect(strict({ grid: [[{ v: 1 }, { v: 2 }]] }, Schema)).toBe(true);
        expect(strict({ grid: [[{ v: 1, x: 'y' }]] }, Schema)).toBe(false);
    });

    test('nullable array — null passes', () => {
        let Schema = t.object({ data: t.array(NUMBER) | NULL });
        expect(strict({ data: null }, Schema)).toBe(true);
        expect(strict({ data: [1, 2] }, Schema)).toBe(true);
        expect(strict({ data: null, extra: 1 }, Schema)).toBe(false);
    });
});

describe('strict reject: discriminated unions', () => {
    let ShapeD = t.union('kind', {
        circle: t.object({ kind: STRING, radius: NUMBER }),
        rect: t.object({ kind: STRING, w: NUMBER, h: NUMBER })
    });

    test('valid variant exact match passes', () => {
        let Schema = t.object({ shape: ShapeD });
        expect(strict({ shape: { kind: 'circle', radius: 5 } }, Schema)).toBe(true);
        expect(strict({ shape: { kind: 'rect', w: 10, h: 20 } }, Schema)).toBe(true);
    });

    test('extra on variant fails', () => {
        let Schema = t.object({ shape: ShapeD });
        expect(strict({ shape: { kind: 'circle', radius: 5, color: 'red' } }, Schema)).toBe(false);
    });

    test('extra on parent fails', () => {
        let Schema = t.object({ shape: ShapeD });
        expect(strict({ shape: { kind: 'circle', radius: 5 }, extra: 1 }, Schema)).toBe(false);
    });

    test('nullable discriminated union', () => {
        let Schema = t.object({ shape: ShapeD | NULL });
        expect(strict({ shape: null }, Schema)).toBe(true);
        expect(strict({ shape: { kind: 'circle', radius: 5 } }, Schema)).toBe(true);
        expect(strict({ shape: { kind: 'circle', radius: 5, x: 1 } }, Schema)).toBe(false);
    });

    test('array of discriminated unions', () => {
        let Schema = t.object({ shapes: t.array(ShapeD) });
        expect(strict({
            shapes: [
                { kind: 'circle', radius: 5 },
                { kind: 'rect', w: 10, h: 20 }
            ]
        }, Schema)).toBe(true);
        expect(strict({
            shapes: [
                { kind: 'circle', radius: 5, extra: 1 }
            ]
        }, Schema)).toBe(false);
    });
});

describe('strict reject: top-level types', () => {
    test('top-level null for nullable object', () => {
        let Schema = t.object({ a: STRING }) | NULL;
        expect(strict(null, Schema)).toBe(true);
    });

    test('top-level undefined for optional object', () => {
        let Schema = t.object({ a: STRING }) | UNDEFINED;
        expect(strict(undefined, Schema)).toBe(true);
    });

    test('top-level primitive delegates to validate', () => {
        expect(strict('hello', STRING)).toBe(true);
        expect(strict(42, STRING)).toBe(false);
    });

    test('top-level array', () => {
        expect(strict([1, 2], t.array(NUMBER))).toBe(true);
        expect(strict([1, 'x'], t.array(NUMBER))).toBe(false);
    });
});

describe('strict reject: empty object schema', () => {
    let Empty = t.object({});

    test('empty input passes', () => {
        expect(strict({}, Empty)).toBe(true);
    });

    test('any extra property fails', () => {
        expect(strict({ a: 1 }, Empty)).toBe(false);
    });
});

describe('strict strip: flat objects', () => {
    let Schema = t.object({ name: STRING, age: NUMBER });

    test('strips extra properties and returns true', () => {
        let obj = { name: 'Alice', age: 30, extra1: true, extra2: 'bye' };
        expect(strict(obj, Schema, true)).toBe(true);
        //@ts-ignore
        expect(obj).toEqual({ name: 'Alice', age: 30 });
    });

    test('no extras — no mutation', () => {
        let obj = { name: 'Alice', age: 30 };
        expect(strict(obj, Schema, true)).toBe(true);
        expect(obj).toEqual({ name: 'Alice', age: 30 });
    });

    test('still fails on type errors even in strip mode', () => {
        let obj = { name: 42, age: 30, extra: true };
        expect(strict(obj, Schema, true)).toBe(false);
    });

    test('still fails on missing required fields', () => {
        let obj = { name: 'Alice', extra: true };
        expect(strict(obj, Schema, true)).toBe(false);
    });

    test('strips many extra properties', () => {
        let obj = { name: 'Alice', age: 30 };
        for (let i = 0; i < 50; i++) {
            //@ts-ignore
            obj['extra_' + i] = i;
        }
        expect(Object.keys(obj).length).toBe(52);
        expect(strict(obj, Schema, true)).toBe(true);
        expect(Object.keys(obj).length).toBe(2);
        expect(obj.name).toBe('Alice');
        expect(obj.age).toBe(30);
    });
});

describe('strict strip: nested objects', () => {
    let Schema = t.object({
        user: t.object({
            name: STRING,
            address: t.object({
                city: STRING
            })
        })
    });

    test('strips at every nesting level', () => {
        let obj = {
            user: {
                name: 'Alice',
                phone: '555',
                address: {
                    city: 'NY',
                    zip: '10001',
                    country: 'US'
                }
            },
            debug: true
        };
        expect(strict(obj, Schema, true)).toBe(true);
        expect(obj).toEqual({
            user: {
                name: 'Alice',
                //@ts-ignore
                address: { city: 'NY' }
            }
        });
    });
});

describe('strict strip: arrays of objects', () => {
    let Item = t.object({ id: NUMBER });
    let Schema = t.object({ items: t.array(Item) });

    test('strips extras from each array element', () => {
        let obj = {
            items: [
                { id: 1, junk: 'a', more: true },
                { id: 2, junk: 'b' },
                { id: 3 }
            ]
        };
        expect(strict(obj, Schema, true)).toBe(true);
        expect(obj.items[0]).toEqual({ id: 1 });
        expect(obj.items[1]).toEqual({ id: 2 });
        expect(obj.items[2]).toEqual({ id: 3 });
    });

    test('strips from outer + inner simultaneously', () => {
        let obj = { items: [{ id: 1, x: 'y' }], extra: true };
        expect(strict(obj, Schema, true)).toBe(true);
        expect('extra' in obj).toBe(false);
        expect('x' in obj.items[0]).toBe(false);
    });
});

describe('strict strip: discriminated unions', () => {
    let ShapeD = t.union('kind', {
        circle: t.object({ kind: STRING, radius: NUMBER }),
        rect: t.object({ kind: STRING, w: NUMBER, h: NUMBER })
    });
    let Schema = t.object({ shape: ShapeD });

    test('strips extras from matched variant', () => {
        let obj = { shape: { kind: 'circle', radius: 5, color: 'red', z: 99 } };
        expect(strict(obj, Schema, true)).toBe(true);
        //@ts-ignore
        expect(obj.shape).toEqual({ kind: 'circle', radius: 5 });
    });

    test('strips from both variant and parent', () => {
        let obj = { shape: { kind: 'rect', w: 10, h: 20, depth: 5 }, meta: 'info' };
        expect(strict(obj, Schema, true)).toBe(true);
        //@ts-ignore
        expect(obj).toEqual({ shape: { kind: 'rect', w: 10, h: 20 } });
    });

    test('still fails on wrong discriminator even in strip mode', () => {
        let obj = { shape: { kind: 'triangle', sides: 3 } };
        expect(strict(obj, Schema, true)).toBe(false);
    });
});

describe('strict strip: complex nested scenario', () => {
    test('API response stripping', () => {
        let UserSchema = t.object({
            id: NUMBER,
            name: STRING,
            email: STRING | NULL
        });
        let ResponseSchema = t.object({
            data: t.array(UserSchema),
            meta: t.object({
                page: NUMBER,
                total: NUMBER
            })
        });

        let response = {
            data: [
                { id: 1, name: 'Alice', email: 'a@b.com', role: 'admin', _internal: true },
                { id: 2, name: 'Bob', email: null, role: 'user', token: 'xyz' }
            ],
            meta: { page: 1, total: 2, hasMore: false, cursor: 'abc' },
            requestId: 'req-123',
            timing: 42
        };

        expect(strict(response, ResponseSchema, true)).toBe(true);
        //@ts-ignore
        expect(response).toEqual({
            data: [
                { id: 1, name: 'Alice', email: 'a@b.com' },
                { id: 2, name: 'Bob', email: null }
            ],
            meta: { page: 1, total: 2 }
        });
    });
});

describe('strict strip: edge cases', () => {
    test('empty object schema strips everything', () => {
        let Schema = t.object({});
        let obj = { a: 1, b: 2, c: 3 };
        expect(strict(obj, Schema, true)).toBe(true);
        //@ts-ignore
        expect(obj).toEqual({});
    });

    test('nullable object at top level — null passes through', () => {
        let Schema = t.object({ a: STRING }) | NULL;
        expect(strict(null, Schema, true)).toBe(true);
    });

    test('strip does not affect primitive arrays', () => {
        let Schema = t.object({ nums: t.array(NUMBER) });
        let obj = { nums: [1, 2, 3], extra: true };
        expect(strict(obj, Schema, true)).toBe(true);
        //@ts-ignore
        expect(obj).toEqual({ nums: [1, 2, 3] });
    });
});