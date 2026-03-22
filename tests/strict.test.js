import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, NUMBER, STRING, STRICT_DELETE,
    STRICT_REJECT
} from 'uvd';
import { catalog, allocators } from 'uvd/core';

const cat = catalog();
const { object, array, union } = allocators(cat);
const { validate } = cat;

function strictDelete(obj, schema) {
    return validate(obj, schema, STRICT_DELETE);
}

function strictReject(obj, schema) {
    return validate(obj, schema, STRICT_REJECT);
}

describe('strict reject: flat objects', () => {
    let Schema = object({ name: STRING, age: NUMBER });

    test('exact match passes', () => {
        expect(strictReject({ name: 'Alice', age: 30 }, Schema)).toBe(true);
    });

    test('extra property fails', () => {
        expect(strictReject({ name: 'Alice', age: 30, extra: true }, Schema)).toBe(false);
    });

    test('multiple extra properties fail', () => {
        expect(strictReject({ name: 'Alice', age: 30, a: 1, b: 2, c: 3 }, Schema)).toBe(false);
    });

    test('missing required property fails', () => {
        expect(strictReject({ name: 'Alice' }, Schema)).toBe(false);
    });

    test('wrong type fails', () => {
        expect(strictReject({ name: 'Alice', age: '30' }, Schema)).toBe(false);
    });

    test('null for non-nullable fails', () => {
        expect(strictReject({ name: null, age: 30 }, Schema)).toBe(false);
    });

    test('non-object input fails', () => {
        expect(strictReject('string', Schema)).toBe(false);
        expect(strictReject(42, Schema)).toBe(false);
        expect(strictReject(true, Schema)).toBe(false);
        expect(strictReject([], Schema)).toBe(false);
    });
});

describe('strict reject: nullable/optional fields', () => {
    let Schema = object({
        required: STRING,
        nullable: STRING | NULL,
        optional: STRING | UNDEFINED,
        both: STRING | NULL | UNDEFINED
    });

    test('all present passes', () => {
        expect(strictReject({ required: 'a', nullable: 'b', optional: 'c', both: 'd' }, Schema)).toBe(true);
    });

    test('nullable field as null passes', () => {
        expect(strictReject({ required: 'a', nullable: null, optional: 'c', both: 'd' }, Schema)).toBe(true);
    });

    test('optional field missing passes', () => {
        debugger;
        expect(strictReject({ required: 'a', nullable: 'b', both: 'd' }, Schema)).toBe(true);
    });

    test('both field as null passes', () => {
        expect(strictReject({ required: 'a', nullable: 'b', both: null }, Schema)).toBe(true);
    });

    test('both field missing passes', () => {
        expect(strictReject({ required: 'a', nullable: 'b' }, Schema)).toBe(true);
    });

    test('extra prop still rejected', () => {
        expect(strictReject({ required: 'a', nullable: 'b', extra: 1 }, Schema)).toBe(false);
    });
});

describe('strict reject: nested objects', () => {
    let Schema = object({
        user: object({
            name: STRING,
            address: object({
                city: STRING
            })
        })
    });

    test('exact nested match passes', () => {
        expect(strictReject({ user: { name: 'Alice', address: { city: 'NY' } } }, Schema)).toBe(true);
    });

    test('extra on outermost fails', () => {
        expect(strictReject({ user: { name: 'Alice', address: { city: 'NY' } }, extra: 1 }, Schema)).toBe(false);
    });

    test('extra on middle level fails', () => {
        expect(strictReject({ user: { name: 'Alice', address: { city: 'NY' }, extra: 1 } }, Schema)).toBe(false);
    });

    test('extra on deepest level fails', () => {
        expect(strictReject({ user: { name: 'Alice', address: { city: 'NY', extra: 1 } } }, Schema)).toBe(false);
    });
});

describe('strict reject: arrays', () => {
    test('array of primitives (no object checking needed)', () => {
        let Schema = object({ tags: array(STRING) });
        expect(strictReject({ tags: ['a', 'b'] }, Schema)).toBe(true);
        expect(strictReject({ tags: ['a', 'b'], extra: 1 }, Schema)).toBe(false);
    });

    test('array of objects — checks each element', () => {
        let Item = object({ id: NUMBER, name: STRING });
        let Schema = object({ items: array(Item) });
        expect(strictReject({ items: [{ id: 1, name: 'A' }] }, Schema)).toBe(true);
        expect(strictReject({ items: [{ id: 1, name: 'A', extra: true }] }, Schema)).toBe(false);
    });

    test('nested array of objects', () => {
        let Cell = object({ v: NUMBER });
        let Schema = object({ grid: array(array(Cell)) });
        expect(strictReject({ grid: [[{ v: 1 }, { v: 2 }]] }, Schema)).toBe(true);
        expect(strictReject({ grid: [[{ v: 1, x: 'y' }]] }, Schema)).toBe(false);
    });

    test('nullable array — null passes', () => {
        let Schema = object({ data: array(NUMBER) | NULL });
        expect(strictReject({ data: null }, Schema)).toBe(true);
        expect(strictReject({ data: [1, 2] }, Schema)).toBe(true);
        expect(strictReject({ data: null, extra: 1 }, Schema)).toBe(false);
    });
});

describe('strict reject: discriminated unions', () => {
    let ShapeD = union('kind', {
        circle: object({ kind: STRING, radius: NUMBER }),
        rect: object({ kind: STRING, w: NUMBER, h: NUMBER })
    });

    test('valid variant exact match passes', () => {
        let Schema = object({ shape: ShapeD });
        expect(strictReject({ shape: { kind: 'circle', radius: 5 } }, Schema)).toBe(true);
        expect(strictReject({ shape: { kind: 'rect', w: 10, h: 20 } }, Schema)).toBe(true);
    });

    test('extra on variant fails', () => {
        let Schema = object({ shape: ShapeD });
        expect(strictReject({ shape: { kind: 'circle', radius: 5, color: 'red' } }, Schema)).toBe(false);
    });

    test('extra on parent fails', () => {
        let Schema = object({ shape: ShapeD });
        expect(strictReject({ shape: { kind: 'circle', radius: 5 }, extra: 1 }, Schema)).toBe(false);
    });

    test('nullable discriminated union', () => {
        let Schema = object({ shape: ShapeD | NULL });
        expect(strictReject({ shape: null }, Schema)).toBe(true);
        expect(strictReject({ shape: { kind: 'circle', radius: 5 } }, Schema)).toBe(true);
        expect(strictReject({ shape: { kind: 'circle', radius: 5, x: 1 } }, Schema)).toBe(false);
    });

    test('array of discriminated unions', () => {
        let Schema = object({ shapes: array(ShapeD) });
        expect(strictReject({
            shapes: [
                { kind: 'circle', radius: 5 },
                { kind: 'rect', w: 10, h: 20 }
            ]
        }, Schema)).toBe(true);
        expect(strictReject({
            shapes: [
                { kind: 'circle', radius: 5, extra: 1 }
            ]
        }, Schema)).toBe(false);
    });
});

describe('strict reject: top-level types', () => {
    test('top-level null for nullable object', () => {
        let Schema = object({ a: STRING }) | NULL;
        expect(strictReject(null, Schema)).toBe(true);
    });

    test('top-level undefined for optional object', () => {
        let Schema = object({ a: STRING }) | UNDEFINED;
        expect(strictReject(undefined, Schema)).toBe(true);
    });

    test('top-level primitive delegates to validate', () => {
        expect(strictReject('hello', STRING)).toBe(true);
        expect(strictReject(42, STRING)).toBe(false);
    });

    test('top-level array', () => {
        expect(strictReject([1, 2], array(NUMBER))).toBe(true);
        expect(strictReject([1, 'x'], array(NUMBER))).toBe(false);
    });
});

describe('strict reject: empty object schema', () => {
    let Empty = object({});

    test('empty input passes', () => {
        expect(strictReject({}, Empty)).toBe(true);
    });

    test('any extra property fails', () => {
        expect(strictReject({ a: 1 }, Empty)).toBe(false);
    });
});

describe('strict strip: flat objects', () => {
    let Schema = object({ name: STRING, age: NUMBER });

    test('strips extra properties and returns true', () => {
        let obj = { name: 'Alice', age: 30, extra1: true, extra2: 'bye' };
        expect(strictDelete(obj, Schema)).toBe(true);
        //@ts-ignore
        expect(obj).toEqual({ name: 'Alice', age: 30 });
    });

    test('no extras — no mutation', () => {
        let obj = { name: 'Alice', age: 30 };
        expect(strictDelete(obj, Schema)).toBe(true);
        expect(obj).toEqual({ name: 'Alice', age: 30 });
    });

    test('still fails on type errors even in strip mode', () => {
        let obj = { name: 42, age: 30, extra: true };
        expect(strictDelete(obj, Schema)).toBe(false);
    });

    test('still fails on missing required fields', () => {
        let obj = { name: 'Alice', extra: true };
        expect(strictDelete(obj, Schema)).toBe(false);
    });

    test('strips many extra properties', () => {
        let obj = { name: 'Alice', age: 30 };
        for (let i = 0; i < 50; i++) {
            //@ts-ignore
            obj['extra_' + i] = i;
        }
        expect(Object.keys(obj).length).toBe(52);
        expect(strictDelete(obj, Schema)).toBe(true);
        expect(Object.keys(obj).length).toBe(2);
        expect(obj.name).toBe('Alice');
        expect(obj.age).toBe(30);
    });
});

describe('strict strip: nested objects', () => {
    let Schema = object({
        user: object({
            name: STRING,
            address: object({
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
        expect(strictDelete(obj, Schema)).toBe(true);
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
    let Item = object({ id: NUMBER });
    let Schema = object({ items: array(Item) });

    test('strips extras from each array element', () => {
        let obj = {
            items: [
                { id: 1, junk: 'a', more: true },
                { id: 2, junk: 'b' },
                { id: 3 }
            ]
        };
        expect(strictDelete(obj, Schema)).toBe(true);
        expect(obj.items[0]).toEqual({ id: 1 });
        expect(obj.items[1]).toEqual({ id: 2 });
        expect(obj.items[2]).toEqual({ id: 3 });
    });

    test('strips from outer + inner simultaneously', () => {
        let obj = { items: [{ id: 1, x: 'y' }], extra: true };
        expect(strictDelete(obj, Schema)).toBe(true);
        expect('extra' in obj).toBe(false);
        expect('x' in obj.items[0]).toBe(false);
    });
});

describe('strict strip: discriminated unions', () => {
    let ShapeD = union('kind', {
        circle: object({ kind: STRING, radius: NUMBER }),
        rect: object({ kind: STRING, w: NUMBER, h: NUMBER })
    });
    let Schema = object({ shape: ShapeD });

    test('strips extras from matched variant', () => {
        let obj = { shape: { kind: 'circle', radius: 5, color: 'red', z: 99 } };
        expect(strictDelete(obj, Schema)).toBe(true);
        //@ts-ignore
        expect(obj.shape).toEqual({ kind: 'circle', radius: 5 });
    });

    test('strips from both variant and parent', () => {
        let obj = { shape: { kind: 'rect', w: 10, h: 20, depth: 5 }, meta: 'info' };
        expect(strictDelete(obj, Schema)).toBe(true);
        //@ts-ignore
        expect(obj).toEqual({ shape: { kind: 'rect', w: 10, h: 20 } });
    });

    test('still fails on wrong discriminator even in strip mode', () => {
        let obj = { shape: { kind: 'triangle', sides: 3 } };
        expect(strictDelete(obj, Schema)).toBe(false);
    });
});

describe('strict strip: complex nested scenario', () => {
    test('API response stripping', () => {
        let UserSchema = object({
            id: NUMBER,
            name: STRING,
            email: STRING | NULL
        });
        let ResponseSchema = object({
            data: array(UserSchema),
            meta: object({
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

        expect(strictDelete(response, ResponseSchema)).toBe(true);
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
        let Schema = object({});
        let obj = { a: 1, b: 2, c: 3 };
        expect(strictDelete(obj, Schema)).toBe(true);
        //@ts-ignore
        expect(obj).toEqual({});
    });

    test('nullable object at top level — null passes through', () => {
        let Schema = object({ a: STRING }) | NULL;
        expect(strictDelete(null, Schema)).toBe(true);
    });

    test('strip does not affect primitive arrays', () => {
        let Schema = object({ nums: array(NUMBER) });
        let obj = { nums: [1, 2, 3], extra: true };
        expect(strictDelete(obj, Schema)).toBe(true);
        //@ts-ignore
        expect(obj).toEqual({ nums: [1, 2, 3] });
    });
});