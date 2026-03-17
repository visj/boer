import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, BOOLEAN, NUMBER,
    STRING, BIGINT, DATE, URI, registry
} from '../';

const { t, check, conform } = registry();

describe('arrays.test.js', () => {

    describe('array: schema builder', () => {
        test('returns a number', () => {
            expect(typeof t.array(NUMBER)).toBe('number');
        });

        test('returns a complex typedef (bit 31 set)', () => {
            expect(t.array(NUMBER) >>> 31).toBe(1);
        });

        test('throws on non-number element type', () => {
            expect(() => t.array('string')).toThrow();
            expect(() => t.array(null)).toThrow();
            expect(() => t.array(undefined)).toThrow();
        });
    });

    describe('validate: basic arrays', () => {
        test('Array<string>', () => {
            let type = t.array(STRING);
            expect(check(['a', 'b', 'c'], type)).toBe(true);
            expect(check([], type)).toBe(true);
            expect(check([1, 2], type)).toBe(false);
            expect(check(['a', 1], type)).toBe(false);
            expect(check('not-array', type)).toBe(false);
            expect(check(null, type)).toBe(false);
            expect(check(undefined, type)).toBe(false);
        });

        test('Array<number>', () => {
            let type = t.array(NUMBER);
            expect(check([1, 2, 3], type)).toBe(true);
            expect(check([0, -1, 3.14, NaN, Infinity], type)).toBe(true);
            expect(check([], type)).toBe(true);
            expect(check([1, '2'], type)).toBe(false);
        });

        test('Array<boolean>', () => {
            let type = t.array(BOOLEAN);
            expect(check([true, false, true], type)).toBe(true);
            expect(check([true, 0], type)).toBe(false);
        });

        test('Array<bigint>', () => {
            let type = t.array(BIGINT);
            expect(check([BigInt(1), BigInt(2)], type)).toBe(true);
            expect(check([1, 2], type)).toBe(false);
        });

        test('Array<Date>', () => {
            let type = t.array(DATE);
            expect(check([new Date(), new Date('2024-01-01')], type)).toBe(true);
            expect(check(['2024-01-01'], type)).toBe(false);
        });

        test('Array<URL>', () => {
            let type = t.array(URI);
            expect(check([new URL('https://vilhelm.se')], type)).toBe(true);
            expect(check(['https://vilhelm.se'], type)).toBe(false);
        });
    });

    describe('validate: array nullability disambiguation', () => {
        test('t.array(NUMBER): no nulls anywhere', () => {
            let type = t.array(NUMBER);
            expect(check([1, 2, 3], type)).toBe(true);
            expect(check(null, type)).toBe(false);
            expect(check([1, null, 3], type)).toBe(false);
        });

        test('t.array(NUMBER) | NULL: outer null, elements non-null', () => {
            let type = t.array(NUMBER) | NULL;
            expect(check(null, type)).toBe(true);           // outer null OK
            expect(check([1, 2, 3], type)).toBe(true);
            expect(check([1, null, 3], type)).toBe(false);   // element null NOT OK
        });

        test('t.array(NUMBER) | UNDEFINED: outer undefined OK', () => {
            let type = t.array(NUMBER) | UNDEFINED;
            expect(check(undefined, type)).toBe(true);
            expect(check([1, 2], type)).toBe(true);
            expect(check(null, type)).toBe(false);
        });

        test('t.array(NUMBER | NULL): element null, outer non-null', () => {
            let type = t.array(NUMBER | NULL);
            expect(check([1, null, 3], type)).toBe(true);   // element null OK
            expect(check([1, 2, 3], type)).toBe(true);
            expect(check(null, type)).toBe(false);           // outer null NOT OK
        });

        test('t.array(NUMBER | NULL) | NULL | UNDEFINED: both levels nullable', () => {
            let type = t.array(NUMBER | NULL) | NULL | UNDEFINED;
            expect(check(null, type)).toBe(true);            // outer null
            expect(check(undefined, type)).toBe(true);       // outer undefined
            expect(check([1, null, 3], type)).toBe(true);    // element null
            expect(check([1, 2, 3], type)).toBe(true);
            expect(check([1, 'two', 3], type)).toBe(false);  // wrong element type
        });

        test('t.array(NUMBER | NULL) | NULL vs t.array(NUMBER) | NULL', () => {
            let withElemNull = t.array(NUMBER | NULL) | NULL;
            let withoutElemNull = t.array(NUMBER) | NULL;

            expect(check(null, withElemNull)).toBe(true);
            expect(check(null, withoutElemNull)).toBe(true);

            expect(check([1, 2], withElemNull)).toBe(true);
            expect(check([1, 2], withoutElemNull)).toBe(true);

            expect(check([1, null], withElemNull)).toBe(true);
            expect(check([1, null], withoutElemNull)).toBe(false);
        });

        test('t.array(STRING | UNDEFINED): elements can be undefined', () => {
            let type = t.array(STRING | UNDEFINED);
            expect(check(['a', undefined, 'b'], type)).toBe(true);
            expect(check(['a', null, 'b'], type)).toBe(false);
        });
    });

    describe('validate: array with type union elements', () => {
        test('Array<string | number>', () => {
            let type = t.array(STRING | NUMBER);
            expect(check([1, 'two', 3, 'four'], type)).toBe(true);
            expect(check([1, 2, 3], type)).toBe(true);
            expect(check(['a', 'b'], type)).toBe(true);
            expect(check([1, true], type)).toBe(false);
        });

        test('Array<string | number | boolean>', () => {
            let type = t.array(STRING | NUMBER | BOOLEAN);
            expect(check([1, 'two', true], type)).toBe(true);
            expect(check([null], type)).toBe(false);
        });

        test('Array<string | number | null>', () => {
            let type = t.array(STRING | NUMBER | NULL);
            expect(check([1, 'two', null], type)).toBe(true);
            expect(check([true], type)).toBe(false);
        });

        test('Array<Date | string>', () => {
            let type = t.array(DATE | STRING);
            expect(check([new Date(), 'hello'], type)).toBe(true);
            expect(check([42], type)).toBe(false);
        });
    });

    describe('validate: array of objects', () => {
        test('Array<Object>', () => {
            let Point = t.object({ x: NUMBER, y: NUMBER });
            let type = t.array(Point);
            expect(check([{ x: 1, y: 2 }, { x: 3, y: 4 }], type)).toBe(true);
            expect(check([], type)).toBe(true);
            expect(check([{ x: 1, y: '2' }], type)).toBe(false);
            expect(check([null], type)).toBe(false);
        });

        test('Array<Object | null>', () => {
            let Point = t.object({ x: NUMBER, y: NUMBER });
            let type = t.array(Point | NULL);
            expect(check([{ x: 1, y: 2 }, null, { x: 3, y: 4 }], type)).toBe(true);
            expect(check([null, null], type)).toBe(true);
            expect(check([{ x: 1, y: '2' }], type)).toBe(false);
        });

        test('Array<Object> | null', () => {
            let Point = t.object({ x: NUMBER, y: NUMBER });
            let type = t.array(Point) | NULL;
            expect(check(null, type)).toBe(true);
            expect(check([{ x: 1, y: 2 }], type)).toBe(true);
            expect(check([null], type)).toBe(false); // element null not allowed
        });
    });

    describe('validate: nested arrays', () => {
        test('Array<Array<number>>', () => {
            let type = t.array(t.array(NUMBER));
            expect(check([[1, 2], [3, 4]], type)).toBe(true);
            expect(check([], type)).toBe(true);
            expect(check([[]], type)).toBe(true);
            expect(check([1, 2], type)).toBe(false);
            expect(check([[1, '2']], type)).toBe(false);
        });

        test('Array<Array<number>> | null', () => {
            let type = t.array(t.array(NUMBER)) | NULL;
            expect(check(null, type)).toBe(true);
            expect(check([[1, 2]], type)).toBe(true);
            expect(check([null], type)).toBe(false);
        });

        test('Array<Array<number> | null>', () => {
            let type = t.array(t.array(NUMBER) | NULL);
            expect(check([[1, 2], null, [3]], type)).toBe(true);
            expect(check(null, type)).toBe(false);
        });

        test('Array<Array<number | null> | null> | null (triple nullable)', () => {
            let type = t.array(t.array(NUMBER | NULL) | NULL) | NULL;
            expect(check(null, type)).toBe(true);           // outer null
            expect(check([null, [1, null]], type)).toBe(true); // inner array null + element null
            expect(check([[1, 2], [3]], type)).toBe(true);
            expect(check([[1, 'x']], type)).toBe(false);
        });

        test('Array<Array<Array<string>>>', () => {
            let type = t.array(t.array(t.array(STRING)));
            expect(check([[['a', 'b'], ['c']], [['d']]], type)).toBe(true);
            expect(check([[['a', 1]]], type)).toBe(false);
        });
    });

    describe('validate: array of unions', () => {
        let ShapeUnion = t.union('kind', {
            circle: t.object({ kind: STRING, radius: NUMBER }),
            rect: t.object({ kind: STRING, w: NUMBER, h: NUMBER })
        });

        test('Array<Union>', () => {
            let type = t.array(ShapeUnion);
            expect(check([
                { kind: 'circle', radius: 5 },
                { kind: 'rect', w: 10, h: 20 }
            ], type)).toBe(true);
            expect(check([], type)).toBe(true);
            expect(check([{ kind: 'triangle' }], type)).toBe(false);
        });

        test('Array<Union> | null', () => {
            let type = t.array(ShapeUnion) | NULL;
            expect(check(null, type)).toBe(true);
            expect(check([{ kind: 'circle', radius: 5 }], type)).toBe(true);
        });

        test('Array<Union | null>', () => {
            let type = t.array(ShapeUnion | NULL);
            expect(check([{ kind: 'circle', radius: 5 }, null], type)).toBe(true);
            expect(check(null, type)).toBe(false);
        });
    });

    describe('parse: arrays', () => {
        test('Array<Date> casts date strings', () => {
            let type = t.array(DATE);
            let arr = ['2024-01-01', '2024-06-15'];
            expect(conform(arr, type)).toBe(true);
            expect(arr[0]).toBeInstanceOf(Date);
            expect(arr[1]).toBeInstanceOf(Date);
        });

        test('Array<Date | null> casts with nulls', () => {
            let type = t.array(DATE | NULL);
            let arr = ['2024-01-01', null, '2024-12-25'];
            expect(conform(arr, type)).toBe(true);
            expect(arr[0]).toBeInstanceOf(Date);
            expect(arr[1]).toBe(null);
            expect(arr[2]).toBeInstanceOf(Date);
        });

        test('Array<Date | null> | null returns true for null', () => {
            let type = t.array(DATE | NULL) | NULL;
            expect(conform(null, type)).toBe(true);
        });

        test('Array<URI> casts URL strings', () => {
            let type = t.array(URI);
            let arr = ['https://a.com', 'https://b.com'];
            expect(conform(arr, type)).toBe(true);
            expect(arr[0]).toBeInstanceOf(URL);
            expect(arr[1]).toBeInstanceOf(URL);
        });

        test('Array<BIGINT> casts from strings', () => {
            let type = t.array(BIGINT);
            let arr = ['123', '456'];
            expect(conform(arr, type)).toBe(true);
            expect(typeof arr[0]).toBe('bigint');
        });

        test('Array<DATE | STRING> casts dates, keeps non-date strings', () => {
            let type = t.array(DATE | STRING);
            let arr = ['2024-01-01', 'hello', '2024-06-15'];
            expect(conform(arr, type)).toBe(true);
            expect(arr[0]).toBeInstanceOf(Date);
            expect(typeof arr[1]).toBe('string');
            expect(arr[2]).toBeInstanceOf(Date);
        });

        test('Array<Object> parses object elements with rich types', () => {
            let Item = t.object({ name: STRING, created: DATE });
            let type = t.array(Item);
            let arr = [
                { name: 'A', created: '2024-01-01' },
                { name: 'B', created: '2024-06-15' }
            ];
            expect(conform(arr, type)).toBe(true);
            expect(arr[0].created).toBeInstanceOf(Date);
            expect(arr[1].created).toBeInstanceOf(Date);
        });

        test('nested Array<Array<Date>> parses deeply', () => {
            let type = t.array(t.array(DATE));
            let arr = [['2024-01-01', '2024-02-01'], ['2024-03-01']];
            expect(conform(arr, type)).toBe(true);
            expect(arr[0][0]).toBeInstanceOf(Date);
            expect(arr[0][1]).toBeInstanceOf(Date);
            expect(arr[1][0]).toBeInstanceOf(Date);
        });
    });

    describe('validate: arrays as object fields', () => {
        test('object with required array field', () => {
            let schema = t.object({ tags: t.array(STRING), name: STRING });
            expect(check({ tags: ['a', 'b'], name: 'Alice' }, schema)).toBe(true);
            expect(check({ tags: [], name: 'Alice' }, schema)).toBe(true);
            expect(check({ tags: null, name: 'Alice' }, schema)).toBe(false);
            expect(check({ name: 'Alice' }, schema)).toBe(false);
        });

        test('object with optional array field', () => {
            let schema = t.object({ tags: t.array(STRING) | UNDEFINED, name: STRING });
            expect(check({ name: 'Alice' }, schema)).toBe(true);
            expect(check({ tags: ['a'], name: 'Alice' }, schema)).toBe(true);
        });

        test('object with nullable array field', () => {
            let schema = t.object({ tags: t.array(STRING) | NULL, name: STRING });
            expect(check({ tags: null, name: 'Alice' }, schema)).toBe(true);
            expect(check({ tags: ['a'], name: 'Alice' }, schema)).toBe(true);
            expect(check({ name: 'Alice' }, schema)).toBe(false);
        });

        test('object with nullable optional array with nullable elements', () => {
            let schema = t.object({
                data: t.array(NUMBER | NULL) | NULL | UNDEFINED
            });
            expect(check({}, schema)).toBe(true);
            expect(check({ data: null }, schema)).toBe(true);
            expect(check({ data: [1, null, 3] }, schema)).toBe(true);
            expect(check({ data: [1, 2, 3] }, schema)).toBe(true);
            expect(check({ data: [1, 'two'] }, schema)).toBe(false);
        });

        test('object with array of objects field', () => {
            let Item = t.object({ id: NUMBER, name: STRING });
            let schema = t.object({ items: t.array(Item) });
            expect(check({ items: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }] }, schema)).toBe(true);
            expect(check({ items: [] }, schema)).toBe(true);
            expect(check({ items: [{ id: 1, name: 42 }] }, schema)).toBe(false);
        });

        test('parse object with array of dates field', () => {
            let schema = t.object({ dates: t.array(DATE) | NULL });
            let obj = { dates: ['2024-01-01', '2024-06-15'] };
            expect(conform(obj, schema)).toBe(true);
            expect(obj.dates[0]).toBeInstanceOf(Date);
            expect(obj.dates[1]).toBeInstanceOf(Date);

            let obj2 = { dates: null };
            expect(conform(obj2, schema)).toBe(true);
        });
    });

    describe('array: edge cases', () => {
        test('empty array always passes', () => {
            expect(check([], t.array(NUMBER))).toBe(true);
            expect(check([], t.array(STRING | NULL))).toBe(true);
            expect(check([], t.array(t.array(NUMBER)))).toBe(true);
            expect(conform([], t.array(DATE))).toBe(true);
        });

        test('single element arrays', () => {
            expect(check([42], t.array(NUMBER))).toBe(true);
            expect(check(['x'], t.array(NUMBER))).toBe(false);
            expect(check([null], t.array(NULL))).toBe(true);
            expect(check([undefined], t.array(UNDEFINED))).toBe(true);
        });

        test('large arrays', () => {
            let big = Array.from({ length: 10000 }, (_, i) => i);
            expect(check(big, t.array(NUMBER))).toBe(true);
            //@ts-ignore
            big[5000] = 'oops';
            expect(check(big, t.array(NUMBER))).toBe(false);
        });

        test('non-array types rejected', () => {
            let type = t.array(NUMBER);
            expect(check({}, type)).toBe(false);
            expect(check('string', type)).toBe(false);
            expect(check(42, type)).toBe(false);
            expect(check(true, type)).toBe(false);
            expect(check(new Set([1, 2]), type)).toBe(false);
        });

        test('array with all undefined elements', () => {
            let type = t.array(UNDEFINED);
            expect(check([undefined, undefined], type)).toBe(true);
            expect(check([null], type)).toBe(false);
        });

        test('array with all null elements', () => {
            let type = t.array(NULL);
            expect(check([null, null, null], type)).toBe(true);
            expect(check([null, 0], type)).toBe(false);
        });
    });
});
