import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, BOOLEAN, NUMBER,
    STRING, BIGINT, DATE, URI,
} from 'uvd';
import {
    catalog, allocators, createConform
} from 'uvd/core';

const cat = catalog();
const { object, array, union } = allocators(cat);
const { validate } = cat;
const conform = createConform(cat);

describe('arrays.test.js', () => {

    describe('array: schema builder', () => {
        test('returns a number', () => {
            expect(typeof array(NUMBER)).toBe('number');
        });

        test('returns a complex typedef (bit 31 set)', () => {
            expect(array(NUMBER) >>> 31).toBe(1);
        });

        test('throws on non-number element type', () => {
            expect(() => array('string')).toThrow();
            expect(() => array(null)).toThrow();
            expect(() => array(undefined)).toThrow();
        });
    });

    describe('validate: basic arrays', () => {
        test('Array<string>', () => {
            let type = array(STRING);
            expect(validate(['a', 'b', 'c'], type)).toBe(true);
            expect(validate([], type)).toBe(true);
            expect(validate([1, 2], type)).toBe(false);
            expect(validate(['a', 1], type)).toBe(false);
            expect(validate('not-array', type)).toBe(false);
            expect(validate(null, type)).toBe(false);
            expect(validate(undefined, type)).toBe(false);
        });

        test('Array<number>', () => {
            let type = array(NUMBER);
            expect(validate([1, 2, 3], type)).toBe(true);
            expect(validate([0, -1, 3.14, NaN, Infinity], type)).toBe(true);
            expect(validate([], type)).toBe(true);
            expect(validate([1, '2'], type)).toBe(false);
        });

        test('Array<boolean>', () => {
            let type = array(BOOLEAN);
            expect(validate([true, false, true], type)).toBe(true);
            expect(validate([true, 0], type)).toBe(false);
        });

        test('Array<bigint>', () => {
            let type = array(BIGINT);
            expect(validate([BigInt(1), BigInt(2)], type)).toBe(true);
            expect(validate([1, 2], type)).toBe(false);
        });

        test('Array<Date>', () => {
            let type = array(DATE);
            expect(validate([new Date(), new Date('2024-01-01')], type)).toBe(true);
            expect(validate(['2024-01-01'], type)).toBe(false);
        });

        test('Array<URL>', () => {
            let type = array(URI);
            expect(validate([new URL('https://vilhelm.se')], type)).toBe(true);
            expect(validate(['https://vilhelm.se'], type)).toBe(false);
        });
    });

    describe('validate: array nullability disambiguation', () => {
        test('array(NUMBER): no nulls anywhere', () => {
            let type = array(NUMBER);
            expect(validate([1, 2, 3], type)).toBe(true);
            expect(validate(null, type)).toBe(false);
            expect(validate([1, null, 3], type)).toBe(false);
        });

        test('array(NUMBER) | NULL: outer null, elements non-null', () => {
            let type = array(NUMBER) | NULL;
            expect(validate(null, type)).toBe(true);           // outer null OK
            expect(validate([1, 2, 3], type)).toBe(true);
            expect(validate([1, null, 3], type)).toBe(false);   // element null NOT OK
        });

        test('array(NUMBER) | UNDEFINED: outer undefined OK', () => {
            let type = array(NUMBER) | UNDEFINED;
            expect(validate(undefined, type)).toBe(true);
            expect(validate([1, 2], type)).toBe(true);
            expect(validate(null, type)).toBe(false);
        });

        test('array(NUMBER | NULL): element null, outer non-null', () => {
            let type = array(NUMBER | NULL);
            expect(validate([1, null, 3], type)).toBe(true);   // element null OK
            expect(validate([1, 2, 3], type)).toBe(true);
            expect(validate(null, type)).toBe(false);           // outer null NOT OK
        });

        test('array(NUMBER | NULL) | NULL | UNDEFINED: both levels nullable', () => {
            let type = array(NUMBER | NULL) | NULL | UNDEFINED;
            expect(validate(null, type)).toBe(true);            // outer null
            expect(validate(undefined, type)).toBe(true);       // outer undefined
            expect(validate([1, null, 3], type)).toBe(true);    // element null
            expect(validate([1, 2, 3], type)).toBe(true);
            expect(validate([1, 'two', 3], type)).toBe(false);  // wrong element type
        });

        test('array(NUMBER | NULL) | NULL vs array(NUMBER) | NULL', () => {
            let withElemNull = array(NUMBER | NULL) | NULL;
            let withoutElemNull = array(NUMBER) | NULL;

            expect(validate(null, withElemNull)).toBe(true);
            expect(validate(null, withoutElemNull)).toBe(true);

            expect(validate([1, 2], withElemNull)).toBe(true);
            expect(validate([1, 2], withoutElemNull)).toBe(true);

            expect(validate([1, null], withElemNull)).toBe(true);
            expect(validate([1, null], withoutElemNull)).toBe(false);
        });

        test('array(STRING | UNDEFINED): elements can be undefined', () => {
            let type = array(STRING | UNDEFINED);
            expect(validate(['a', undefined, 'b'], type)).toBe(true);
            expect(validate(['a', null, 'b'], type)).toBe(false);
        });
    });

    describe('validate: array with type union elements', () => {
        test('Array<string | number>', () => {
            let type = array(STRING | NUMBER);
            expect(validate([1, 'two', 3, 'four'], type)).toBe(true);
            expect(validate([1, 2, 3], type)).toBe(true);
            expect(validate(['a', 'b'], type)).toBe(true);
            expect(validate([1, true], type)).toBe(false);
        });

        test('Array<string | number | boolean>', () => {
            let type = array(STRING | NUMBER | BOOLEAN);
            expect(validate([1, 'two', true], type)).toBe(true);
            expect(validate([null], type)).toBe(false);
        });

        test('Array<string | number | null>', () => {
            let type = array(STRING | NUMBER | NULL);
            expect(validate([1, 'two', null], type)).toBe(true);
            expect(validate([true], type)).toBe(false);
        });

        test('Array<Date | string>', () => {
            let type = array(DATE | STRING);
            expect(validate([new Date(), 'hello'], type)).toBe(true);
            expect(validate([42], type)).toBe(false);
        });
    });

    describe('validate: array of objects', () => {
        test('Array<Object>', () => {
            let Point = object({ x: NUMBER, y: NUMBER });
            let type = array(Point);
            expect(validate([{ x: 1, y: 2 }, { x: 3, y: 4 }], type)).toBe(true);
            expect(validate([], type)).toBe(true);
            expect(validate([{ x: 1, y: '2' }], type)).toBe(false);
            expect(validate([null], type)).toBe(false);
        });

        test('Array<Object | null>', () => {
            let Point = object({ x: NUMBER, y: NUMBER });
            let type = array(Point | NULL);
            expect(validate([{ x: 1, y: 2 }, null, { x: 3, y: 4 }], type)).toBe(true);
            expect(validate([null, null], type)).toBe(true);
            expect(validate([{ x: 1, y: '2' }], type)).toBe(false);
        });

        test('Array<Object> | null', () => {
            let Point = object({ x: NUMBER, y: NUMBER });
            let type = array(Point) | NULL;
            expect(validate(null, type)).toBe(true);
            expect(validate([{ x: 1, y: 2 }], type)).toBe(true);
            expect(validate([null], type)).toBe(false); // element null not allowed
        });
    });

    describe('validate: nested arrays', () => {
        test('Array<Array<number>>', () => {
            let type = array(array(NUMBER));
            expect(validate([[1, 2], [3, 4]], type)).toBe(true);
            expect(validate([], type)).toBe(true);
            expect(validate([[]], type)).toBe(true);
            expect(validate([1, 2], type)).toBe(false);
            expect(validate([[1, '2']], type)).toBe(false);
        });

        test('Array<Array<number>> | null', () => {
            let type = array(array(NUMBER)) | NULL;
            expect(validate(null, type)).toBe(true);
            expect(validate([[1, 2]], type)).toBe(true);
            expect(validate([null], type)).toBe(false);
        });

        test('Array<Array<number> | null>', () => {
            let type = array(array(NUMBER) | NULL);
            expect(validate([[1, 2], null, [3]], type)).toBe(true);
            expect(validate(null, type)).toBe(false);
        });

        test('Array<Array<number | null> | null> | null (triple nullable)', () => {
            let type = array(array(NUMBER | NULL) | NULL) | NULL;
            expect(validate(null, type)).toBe(true);           // outer null
            expect(validate([null, [1, null]], type)).toBe(true); // inner array null + element null
            expect(validate([[1, 2], [3]], type)).toBe(true);
            expect(validate([[1, 'x']], type)).toBe(false);
        });

        test('Array<Array<Array<string>>>', () => {
            let type = array(array(array(STRING)));
            expect(validate([[['a', 'b'], ['c']], [['d']]], type)).toBe(true);
            expect(validate([[['a', 1]]], type)).toBe(false);
        });
    });

    describe('validate: array of unions', () => {
        let ShapeUnion = union('kind', {
            circle: object({ kind: STRING, radius: NUMBER }),
            rect: object({ kind: STRING, w: NUMBER, h: NUMBER })
        });

        test('Array<Union>', () => {
            let type = array(ShapeUnion);
            expect(validate([
                { kind: 'circle', radius: 5 },
                { kind: 'rect', w: 10, h: 20 }
            ], type)).toBe(true);
            expect(validate([], type)).toBe(true);
            expect(validate([{ kind: 'triangle' }], type)).toBe(false);
        });

        test('Array<Union> | null', () => {
            let type = array(ShapeUnion) | NULL;
            expect(validate(null, type)).toBe(true);
            expect(validate([{ kind: 'circle', radius: 5 }], type)).toBe(true);
        });

        test('Array<Union | null>', () => {
            let type = array(ShapeUnion | NULL);
            expect(validate([{ kind: 'circle', radius: 5 }, null], type)).toBe(true);
            expect(validate(null, type)).toBe(false);
        });
    });

    describe.skip('parse: arrays', () => {
        test('Array<Date> casts date strings', () => {
            let type = array(DATE);
            let arr = ['2024-01-01', '2024-06-15'];
            expect(conform(arr, type)).toBe(true);
            expect(arr[0]).toBeInstanceOf(Date);
            expect(arr[1]).toBeInstanceOf(Date);
        });

        test('Array<Date | null> casts with nulls', () => {
            let type = array(DATE | NULL);
            let arr = ['2024-01-01', null, '2024-12-25'];
            expect(conform(arr, type)).toBe(true);
            expect(arr[0]).toBeInstanceOf(Date);
            expect(arr[1]).toBe(null);
            expect(arr[2]).toBeInstanceOf(Date);
        });

        test('Array<Date | null> | null returns true for null', () => {
            let type = array(DATE | NULL) | NULL;
            expect(conform(null, type)).toBe(true);
        });

        test('Array<URI> casts URL strings', () => {
            let type = array(URI);
            let arr = ['https://a.com', 'https://b.com'];
            expect(conform(arr, type)).toBe(true);
            expect(arr[0]).toBeInstanceOf(URL);
            expect(arr[1]).toBeInstanceOf(URL);
        });

        test('Array<BIGINT> casts from strings', () => {
            let type = array(BIGINT);
            let arr = ['123', '456'];
            expect(conform(arr, type)).toBe(true);
            expect(typeof arr[0]).toBe('bigint');
        });

        test('Array<DATE | STRING> casts dates, keeps non-date strings', () => {
            let type = array(DATE | STRING);
            let arr = ['2024-01-01', 'hello', '2024-06-15'];
            expect(conform(arr, type)).toBe(true);
            expect(arr[0]).toBeInstanceOf(Date);
            expect(typeof arr[1]).toBe('string');
            expect(arr[2]).toBeInstanceOf(Date);
        });

        test('Array<Object> parses object elements with rich types', () => {
            let Item = object({ name: STRING, created: DATE });
            let type = array(Item);
            let arr = [
                { name: 'A', created: '2024-01-01' },
                { name: 'B', created: '2024-06-15' }
            ];
            expect(conform(arr, type)).toBe(true);
            expect(arr[0].created).toBeInstanceOf(Date);
            expect(arr[1].created).toBeInstanceOf(Date);
        });

        test('nested Array<Array<Date>> parses deeply', () => {
            let type = array(array(DATE));
            let arr = [['2024-01-01', '2024-02-01'], ['2024-03-01']];
            expect(conform(arr, type)).toBe(true);
            expect(arr[0][0]).toBeInstanceOf(Date);
            expect(arr[0][1]).toBeInstanceOf(Date);
            expect(arr[1][0]).toBeInstanceOf(Date);
        });
    });

    describe('validate: arrays as object fields', () => {
        test('object with required array field', () => {
            let schema = object({ tags: array(STRING), name: STRING });
            expect(validate({ tags: ['a', 'b'], name: 'Alice' }, schema)).toBe(true);
            expect(validate({ tags: [], name: 'Alice' }, schema)).toBe(true);
            expect(validate({ tags: null, name: 'Alice' }, schema)).toBe(false);
            expect(validate({ name: 'Alice' }, schema)).toBe(false);
        });

        test('object with optional array field', () => {
            let schema = object({ tags: array(STRING) | UNDEFINED, name: STRING });
            expect(validate({ name: 'Alice' }, schema)).toBe(true);
            expect(validate({ tags: ['a'], name: 'Alice' }, schema)).toBe(true);
        });

        test('object with nullable array field', () => {
            let schema = object({ tags: array(STRING) | NULL, name: STRING });
            expect(validate({ tags: null, name: 'Alice' }, schema)).toBe(true);
            expect(validate({ tags: ['a'], name: 'Alice' }, schema)).toBe(true);
            expect(validate({ name: 'Alice' }, schema)).toBe(false);
        });

        test('object with nullable optional array with nullable elements', () => {
            let schema = object({
                data: array(NUMBER | NULL) | NULL | UNDEFINED
            });
            expect(validate({}, schema)).toBe(true);
            expect(validate({ data: null }, schema)).toBe(true);
            expect(validate({ data: [1, null, 3] }, schema)).toBe(true);
            expect(validate({ data: [1, 2, 3] }, schema)).toBe(true);
            expect(validate({ data: [1, 'two'] }, schema)).toBe(false);
        });

        test('object with array of objects field', () => {
            let Item = object({ id: NUMBER, name: STRING });
            let schema = object({ items: array(Item) });
            expect(validate({ items: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }] }, schema)).toBe(true);
            expect(validate({ items: [] }, schema)).toBe(true);
            expect(validate({ items: [{ id: 1, name: 42 }] }, schema)).toBe(false);
        });

        // test('parse object with array of dates field', () => {
        //     let schema = object({ dates: array(DATE) | NULL });
        //     let obj = { dates: ['2024-01-01', '2024-06-15'] };
        //     expect(conform(obj, schema)).toBe(true);
        //     expect(obj.dates[0]).toBeInstanceOf(Date);
        //     expect(obj.dates[1]).toBeInstanceOf(Date);
        //     let obj2 = { dates: null };
        //     expect(conform(obj2, schema)).toBe(true);
        // });
    });

    describe('array: edge cases', () => {
        test('empty array always passes', () => {
            expect(validate([], array(NUMBER))).toBe(true);
            expect(validate([], array(STRING | NULL))).toBe(true);
            expect(validate([], array(array(NUMBER)))).toBe(true);
            // expect(conform([], array(DATE))).toBe(true);
        });

        test('single element arrays', () => {
            expect(validate([42], array(NUMBER))).toBe(true);
            expect(validate(['x'], array(NUMBER))).toBe(false);
            expect(validate([null], array(NULL))).toBe(true);
            expect(validate([undefined], array(UNDEFINED))).toBe(true);
        });

        test('large arrays', () => {
            let big = Array.from({ length: 10000 }, (_, i) => i);
            expect(validate(big, array(NUMBER))).toBe(true);
            //@ts-ignore
            big[5000] = 'oops';
            expect(validate(big, array(NUMBER))).toBe(false);
        });

        test('non-array types rejected', () => {
            let type = array(NUMBER);
            expect(validate({}, type)).toBe(false);
            expect(validate('string', type)).toBe(false);
            expect(validate(42, type)).toBe(false);
            expect(validate(true, type)).toBe(false);
            expect(validate(new Set([1, 2]), type)).toBe(false);
        });

        test('array with all undefined elements', () => {
            let type = array(UNDEFINED);
            expect(validate([undefined, undefined], type)).toBe(true);
            expect(validate([null], type)).toBe(false);
        });

        test('array with all null elements', () => {
            let type = array(NULL);
            expect(validate([null, null, null], type)).toBe(true);
            expect(validate([null, 0], type)).toBe(false);
        });
    });
});
