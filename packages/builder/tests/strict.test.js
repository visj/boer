import { describe, test, expect } from 'bun:test';
import { UNDEFINED, NULL, NUMBER, STRING } from '@boer/core';
import { catalog } from '@boer/validate';
import { allocators } from '@boer/builder';

const cat = catalog();
const { object, array, union } = allocators(cat);
const { validate } = cat;

/**
 * All strict tests now use additionalProperties: false on objects.
 * The validate function rejects extra properties via V_OBJ_NO_ADD.
 */

describe('additionalProperties false: flat objects', () => {
    let Schema = object({ name: STRING, age: NUMBER }, { additionalProperties: false });

    test('exact match passes', () => {
        expect(validate({ name: 'Alice', age: 30 }, Schema)).toBe(true);
    });

    test('extra property fails', () => {
        expect(validate({ name: 'Alice', age: 30, extra: true }, Schema)).toBe(false);
    });

    test('multiple extra properties fail', () => {
        expect(validate({ name: 'Alice', age: 30, a: 1, b: 2, c: 3 }, Schema)).toBe(false);
    });

    test('missing required property fails', () => {
        expect(validate({ name: 'Alice' }, Schema)).toBe(false);
    });

    test('wrong type fails', () => {
        expect(validate({ name: 'Alice', age: '30' }, Schema)).toBe(false);
    });

    test('null for non-nullable fails', () => {
        expect(validate({ name: null, age: 30 }, Schema)).toBe(false);
    });

    test('non-object input fails', () => {
        expect(validate('string', Schema)).toBe(false);
        expect(validate(42, Schema)).toBe(false);
        expect(validate(true, Schema)).toBe(false);
        expect(validate([], Schema)).toBe(false);
    });
});

describe('additionalProperties false: nullable/optional fields', () => {
    let Schema = object({
        required: STRING,
        nullable: STRING | NULL,
        optional: STRING | UNDEFINED,
        both: STRING | NULL | UNDEFINED
    }, { additionalProperties: false });

    test('all present passes', () => {
        expect(validate({ required: 'a', nullable: 'b', optional: 'c', both: 'd' }, Schema)).toBe(true);
    });

    test('nullable field as null passes', () => {
        expect(validate({ required: 'a', nullable: null, optional: 'c', both: 'd' }, Schema)).toBe(true);
    });

    test('optional field missing passes', () => {
        expect(validate({ required: 'a', nullable: 'b', both: 'd' }, Schema)).toBe(true);
    });

    test('both field as null passes', () => {
        expect(validate({ required: 'a', nullable: 'b', both: null }, Schema)).toBe(true);
    });

    test('both field missing passes', () => {
        expect(validate({ required: 'a', nullable: 'b' }, Schema)).toBe(true);
    });

    test('extra prop still rejected', () => {
        expect(validate({ required: 'a', nullable: 'b', extra: 1 }, Schema)).toBe(false);
    });
});

describe('additionalProperties false: nested objects', () => {
    let Schema = object({
        user: object({
            name: STRING,
            address: object({
                city: STRING
            }, { additionalProperties: false })
        }, { additionalProperties: false })
    }, { additionalProperties: false });

    test('exact nested match passes', () => {
        expect(validate({ user: { name: 'Alice', address: { city: 'NY' } } }, Schema)).toBe(true);
    });

    test('extra on outermost fails', () => {
        expect(validate({ user: { name: 'Alice', address: { city: 'NY' } }, extra: 1 }, Schema)).toBe(false);
    });

    test('extra on middle level fails', () => {
        expect(validate({ user: { name: 'Alice', address: { city: 'NY' }, extra: 1 } }, Schema)).toBe(false);
    });

    test('extra on deepest level fails', () => {
        expect(validate({ user: { name: 'Alice', address: { city: 'NY', extra: 1 } } }, Schema)).toBe(false);
    });
});

describe('additionalProperties false: arrays', () => {
    test('array of primitives (no object checking needed)', () => {
        let Schema = object({ tags: array(STRING) }, { additionalProperties: false });
        expect(validate({ tags: ['a', 'b'] }, Schema)).toBe(true);
        expect(validate({ tags: ['a', 'b'], extra: 1 }, Schema)).toBe(false);
    });

    test('array of objects — checks each element', () => {
        let Item = object({ id: NUMBER, name: STRING }, { additionalProperties: false });
        let Schema = object({ items: array(Item) }, { additionalProperties: false });
        expect(validate({ items: [{ id: 1, name: 'A' }] }, Schema)).toBe(true);
        expect(validate({ items: [{ id: 1, name: 'A', extra: true }] }, Schema)).toBe(false);
    });

    test('nested array of objects', () => {
        let Cell = object({ v: NUMBER }, { additionalProperties: false });
        let Schema = object({ grid: array(array(Cell)) }, { additionalProperties: false });
        expect(validate({ grid: [[{ v: 1 }, { v: 2 }]] }, Schema)).toBe(true);
        expect(validate({ grid: [[{ v: 1, x: 'y' }]] }, Schema)).toBe(false);
    });

    test('nullable array — null passes', () => {
        let Schema = object({ data: array(NUMBER) | NULL }, { additionalProperties: false });
        expect(validate({ data: null }, Schema)).toBe(true);
        expect(validate({ data: [1, 2] }, Schema)).toBe(true);
        expect(validate({ data: null, extra: 1 }, Schema)).toBe(false);
    });
});

describe('additionalProperties false: discriminated unions', () => {
    let ShapeD = union('kind', {
        circle: object({ kind: STRING, radius: NUMBER }, { additionalProperties: false }),
        rect: object({ kind: STRING, w: NUMBER, h: NUMBER }, { additionalProperties: false })
    });

    test('valid variant exact match passes', () => {
        let Schema = object({ shape: ShapeD }, { additionalProperties: false });
        expect(validate({ shape: { kind: 'circle', radius: 5 } }, Schema)).toBe(true);
        expect(validate({ shape: { kind: 'rect', w: 10, h: 20 } }, Schema)).toBe(true);
    });

    test('extra on variant fails', () => {
        let Schema = object({ shape: ShapeD }, { additionalProperties: false });
        expect(validate({ shape: { kind: 'circle', radius: 5, color: 'red' } }, Schema)).toBe(false);
    });

    test('extra on parent fails', () => {
        let Schema = object({ shape: ShapeD }, { additionalProperties: false });
        expect(validate({ shape: { kind: 'circle', radius: 5 }, extra: 1 }, Schema)).toBe(false);
    });

    test('nullable discriminated union', () => {
        let Schema = object({ shape: ShapeD | NULL }, { additionalProperties: false });
        expect(validate({ shape: null }, Schema)).toBe(true);
        expect(validate({ shape: { kind: 'circle', radius: 5 } }, Schema)).toBe(true);
        expect(validate({ shape: { kind: 'circle', radius: 5, x: 1 } }, Schema)).toBe(false);
    });

    test('array of discriminated unions', () => {
        let Schema = object({ shapes: array(ShapeD) }, { additionalProperties: false });
        expect(validate({
            shapes: [
                { kind: 'circle', radius: 5 },
                { kind: 'rect', w: 10, h: 20 }
            ]
        }, Schema)).toBe(true);
        expect(validate({
            shapes: [
                { kind: 'circle', radius: 5, extra: 1 }
            ]
        }, Schema)).toBe(false);
    });
});

describe('additionalProperties false: top-level types', () => {
    test('top-level null for nullable object', () => {
        let Schema = object({ a: STRING }, { additionalProperties: false }) | NULL;
        expect(validate(null, Schema)).toBe(true);
    });

    test('top-level undefined for optional object', () => {
        let Schema = object({ a: STRING }, { additionalProperties: false }) | UNDEFINED;
        expect(validate(undefined, Schema)).toBe(true);
    });

    test('top-level primitive delegates to validate', () => {
        expect(validate('hello', STRING)).toBe(true);
        expect(validate(42, STRING)).toBe(false);
    });

    test('top-level array', () => {
        expect(validate([1, 2], array(NUMBER))).toBe(true);
        expect(validate([1, 'x'], array(NUMBER))).toBe(false);
    });
});

describe('additionalProperties false: empty object schema', () => {
    let Empty = object({}, { additionalProperties: false });

    test('empty input passes', () => {
        expect(validate({}, Empty)).toBe(true);
    });

    test('any extra property fails', () => {
        expect(validate({ a: 1 }, Empty)).toBe(false);
    });
});
