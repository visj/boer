import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, BOOLEAN, NUMBER,
    STRING, BIGINT, DATE, URI, ARRAY,
    object, array, union, conform, check
} from '../';

describe('array: schema builder', () => {
    test('returns a number', () => {
        expect(typeof array(NUMBER)).toBe('number');
    });

    test('has ARRAY bit set', () => {
        expect((array(NUMBER) & ARRAY) === ARRAY).toBe(true);
    });

    test('throws on non-number element type', () => {
        expect(() => array('string')).toThrow();
        expect(() => array(null)).toThrow();
        expect(() => array(undefined)).toThrow();
    });
});

describe('validate: basic arrays', () => {
    test('Array<string>', () => {
        let t = array(STRING);
        expect(check(['a', 'b', 'c'], t)).toBe(true);
        expect(check([], t)).toBe(true);
        expect(check([1, 2], t)).toBe(false);
        expect(check(['a', 1], t)).toBe(false);
        expect(check('not-array', t)).toBe(false);
        expect(check(null, t)).toBe(false);
        expect(check(undefined, t)).toBe(false);
    });

    test('Array<number>', () => {
        let t = array(NUMBER);
        expect(check([1, 2, 3], t)).toBe(true);
        expect(check([0, -1, 3.14, NaN, Infinity], t)).toBe(true);
        expect(check([], t)).toBe(true);
        expect(check([1, '2'], t)).toBe(false);
    });

    test('Array<boolean>', () => {
        let t = array(BOOLEAN);
        expect(check([true, false, true], t)).toBe(true);
        expect(check([true, 0], t)).toBe(false);
    });

    test('Array<bigint>', () => {
        let t = array(BIGINT);
        expect(check([BigInt(1), BigInt(2)], t)).toBe(true);
        expect(check([1, 2], t)).toBe(false);
    });

    test('Array<Date>', () => {
        let t = array(DATE);
        expect(check([new Date(), new Date('2024-01-01')], t)).toBe(true);
        expect(check(['2024-01-01'], t)).toBe(false);
    });

    test('Array<URL>', () => {
        let t = array(URI);
        expect(check([new URL('https://vilhelm.se')], t)).toBe(true);
        expect(check(['https://vilhelm.se'], t)).toBe(false);
    });
});

describe('validate: array nullability disambiguation', () => {
    test('array(NUMBER): no nulls anywhere', () => {
        let t = array(NUMBER);
        expect(check([1, 2, 3], t)).toBe(true);
        expect(check(null, t)).toBe(false);
        expect(check([1, null, 3], t)).toBe(false);
    });

    test('array(NUMBER) | NULL: outer null, elements non-null', () => {
        let t = array(NUMBER) | NULL;
        expect(check(null, t)).toBe(true);           // outer null OK
        expect(check([1, 2, 3], t)).toBe(true);
        expect(check([1, null, 3], t)).toBe(false);   // element null NOT OK
    });

    test('array(NUMBER) | UNDEFINED: outer undefined OK', () => {
        let t = array(NUMBER) | UNDEFINED;
        expect(check(undefined, t)).toBe(true);
        expect(check([1, 2], t)).toBe(true);
        expect(check(null, t)).toBe(false);
    });

    test('array(NUMBER | NULL): element null, outer non-null', () => {
        let t = array(NUMBER | NULL);
        expect(check([1, null, 3], t)).toBe(true);   // element null OK
        expect(check([1, 2, 3], t)).toBe(true);
        expect(check(null, t)).toBe(false);           // outer null NOT OK
    });

    test('array(NUMBER | NULL) | NULL | UNDEFINED: both levels nullable', () => {
        let t = array(NUMBER | NULL) | NULL | UNDEFINED;
        expect(check(null, t)).toBe(true);            // outer null
        expect(check(undefined, t)).toBe(true);       // outer undefined
        expect(check([1, null, 3], t)).toBe(true);    // element null
        expect(check([1, 2, 3], t)).toBe(true);
        expect(check([1, 'two', 3], t)).toBe(false);  // wrong element type
    });

    test('array(NUMBER | NULL) | NULL vs array(NUMBER) | NULL', () => {
        let withElemNull = array(NUMBER | NULL) | NULL;
        let withoutElemNull = array(NUMBER) | NULL;

        expect(check(null, withElemNull)).toBe(true);
        expect(check(null, withoutElemNull)).toBe(true);

        expect(check([1, 2], withElemNull)).toBe(true);
        expect(check([1, 2], withoutElemNull)).toBe(true);

        expect(check([1, null], withElemNull)).toBe(true);
        expect(check([1, null], withoutElemNull)).toBe(false);
    });

    test('array(STRING | UNDEFINED): elements can be undefined', () => {
        let t = array(STRING | UNDEFINED);
        expect(check(['a', undefined, 'b'], t)).toBe(true);
        expect(check(['a', null, 'b'], t)).toBe(false);
    });
});

describe('validate: array with type union elements', () => {
    test('Array<string | number>', () => {
        let t = array(STRING | NUMBER);
        expect(check([1, 'two', 3, 'four'], t)).toBe(true);
        expect(check([1, 2, 3], t)).toBe(true);
        expect(check(['a', 'b'], t)).toBe(true);
        expect(check([1, true], t)).toBe(false);
    });

    test('Array<string | number | boolean>', () => {
        let t = array(STRING | NUMBER | BOOLEAN);
        expect(check([1, 'two', true], t)).toBe(true);
        expect(check([null], t)).toBe(false);
    });

    test('Array<string | number | null>', () => {
        let t = array(STRING | NUMBER | NULL);
        expect(check([1, 'two', null], t)).toBe(true);
        expect(check([true], t)).toBe(false);
    });

    test('Array<Date | string>', () => {
        let t = array(DATE | STRING);
        expect(check([new Date(), 'hello'], t)).toBe(true);
        expect(check([42], t)).toBe(false);
    });
});

describe('validate: array of objects', () => {
    test('Array<Object>', () => {
        let Point = object({ x: NUMBER, y: NUMBER });
        let t = array(Point);
        expect(check([{ x: 1, y: 2 }, { x: 3, y: 4 }], t)).toBe(true);
        expect(check([], t)).toBe(true);
        expect(check([{ x: 1, y: '2' }], t)).toBe(false);
        expect(check([null], t)).toBe(false);
    });

    test('Array<Object | null>', () => {
        let Point = object({ x: NUMBER, y: NUMBER });
        let t = array(Point | NULL);
        expect(check([{ x: 1, y: 2 }, null, { x: 3, y: 4 }], t)).toBe(true);
        expect(check([null, null], t)).toBe(true);
        expect(check([{ x: 1, y: '2' }], t)).toBe(false);
    });

    test('Array<Object> | null', () => {
        let Point = object({ x: NUMBER, y: NUMBER });
        let t = array(Point) | NULL;
        expect(check(null, t)).toBe(true);
        expect(check([{ x: 1, y: 2 }], t)).toBe(true);
        expect(check([null], t)).toBe(false); // element null not allowed
    });
});

describe('validate: nested arrays', () => {
    test('Array<Array<number>>', () => {
        let t = array(array(NUMBER));
        expect(check([[1, 2], [3, 4]], t)).toBe(true);
        expect(check([], t)).toBe(true);
        expect(check([[]], t)).toBe(true);
        expect(check([1, 2], t)).toBe(false);
        expect(check([[1, '2']], t)).toBe(false);
    });

    test('Array<Array<number>> | null', () => {
        let t = array(array(NUMBER)) | NULL;
        expect(check(null, t)).toBe(true);
        expect(check([[1, 2]], t)).toBe(true);
        expect(check([null], t)).toBe(false);
    });

    test('Array<Array<number> | null>', () => {
        let t = array(array(NUMBER) | NULL);
        expect(check([[1, 2], null, [3]], t)).toBe(true);
        expect(check(null, t)).toBe(false);
    });

    test('Array<Array<number | null> | null> | null (triple nullable)', () => {
        let t = array(array(NUMBER | NULL) | NULL) | NULL;
        expect(check(null, t)).toBe(true);           // outer null
        expect(check([null, [1, null]], t)).toBe(true); // inner array null + element null
        expect(check([[1, 2], [3]], t)).toBe(true);
        expect(check([[1, 'x']], t)).toBe(false);
    });

    test('Array<Array<Array<string>>>', () => {
        let t = array(array(array(STRING)));
        expect(check([[['a', 'b'], ['c']], [['d']]], t)).toBe(true);
        expect(check([[['a', 1]]], t)).toBe(false);
    });
});

describe('validate: array of unions', () => {
    let ShapeUnion = union('kind', {
        circle: object({ kind: STRING, radius: NUMBER }),
        rect: object({ kind: STRING, w: NUMBER, h: NUMBER })
    });

    test('Array<Union>', () => {
        let t = array(ShapeUnion);
        expect(check([
            { kind: 'circle', radius: 5 },
            { kind: 'rect', w: 10, h: 20 }
        ], t)).toBe(true);
        expect(check([], t)).toBe(true);
        expect(check([{ kind: 'triangle' }], t)).toBe(false);
    });

    test('Array<Union> | null', () => {
        let t = array(ShapeUnion) | NULL;
        expect(check(null, t)).toBe(true);
        expect(check([{ kind: 'circle', radius: 5 }], t)).toBe(true);
    });

    test('Array<Union | null>', () => {
        let t = array(ShapeUnion | NULL);
        expect(check([{ kind: 'circle', radius: 5 }, null], t)).toBe(true);
        expect(check(null, t)).toBe(false);
    });
});

describe('parse: arrays', () => {
    test('Array<Date> casts date strings', () => {
        let t = array(DATE);
        let arr = ['2024-01-01', '2024-06-15'];
        expect(conform(arr, t)).toBe(true);
        expect(arr[0]).toBeInstanceOf(Date);
        expect(arr[1]).toBeInstanceOf(Date);
    });

    test('Array<Date | null> casts with nulls', () => {
        let t = array(DATE | NULL);
        let arr = ['2024-01-01', null, '2024-12-25'];
        expect(conform(arr, t)).toBe(true);
        expect(arr[0]).toBeInstanceOf(Date);
        expect(arr[1]).toBe(null);
        expect(arr[2]).toBeInstanceOf(Date);
    });

    test('Array<Date | null> | null returns true for null', () => {
        let t = array(DATE | NULL) | NULL;
        expect(conform(null, t)).toBe(true);
    });

    test('Array<URI> casts URL strings', () => {
        let t = array(URI);
        let arr = ['https://a.com', 'https://b.com'];
        expect(conform(arr, t)).toBe(true);
        expect(arr[0]).toBeInstanceOf(URL);
        expect(arr[1]).toBeInstanceOf(URL);
    });

    test('Array<BIGINT> casts from strings', () => {
        let t = array(BIGINT);
        let arr = ['123', '456'];
        expect(conform(arr, t)).toBe(true);
        expect(typeof arr[0]).toBe('bigint');
    });

    test('Array<DATE | STRING> casts dates, keeps non-date strings', () => {
        let t = array(DATE | STRING);
        let arr = ['2024-01-01', 'hello', '2024-06-15'];
        expect(conform(arr, t)).toBe(true);
        expect(arr[0]).toBeInstanceOf(Date);
        expect(typeof arr[1]).toBe('string');
        expect(arr[2]).toBeInstanceOf(Date);
    });

    test('Array<Object> parses object elements with rich types', () => {
        let Item = object({ name: STRING, created: DATE });
        let t = array(Item);
        let arr = [
            { name: 'A', created: '2024-01-01' },
            { name: 'B', created: '2024-06-15' }
        ];
        expect(conform(arr, t)).toBe(true);
        expect(arr[0].created).toBeInstanceOf(Date);
        expect(arr[1].created).toBeInstanceOf(Date);
    });

    test('nested Array<Array<Date>> parses deeply', () => {
        let t = array(array(DATE));
        let arr = [['2024-01-01', '2024-02-01'], ['2024-03-01']];
        expect(conform(arr, t)).toBe(true);
        expect(arr[0][0]).toBeInstanceOf(Date);
        expect(arr[0][1]).toBeInstanceOf(Date);
        expect(arr[1][0]).toBeInstanceOf(Date);
    });
});

describe('validate: arrays as object fields', () => {
    test('object with required array field', () => {
        let schema = object({ tags: array(STRING), name: STRING });
        expect(check({ tags: ['a', 'b'], name: 'Alice' }, schema)).toBe(true);
        expect(check({ tags: [], name: 'Alice' }, schema)).toBe(true);
        expect(check({ tags: null, name: 'Alice' }, schema)).toBe(false);
        expect(check({ name: 'Alice' }, schema)).toBe(false);
    });

    test('object with optional array field', () => {
        let schema = object({ tags: array(STRING) | UNDEFINED, name: STRING });
        expect(check({ name: 'Alice' }, schema)).toBe(true);
        expect(check({ tags: ['a'], name: 'Alice' }, schema)).toBe(true);
    });

    test('object with nullable array field', () => {
        let schema = object({ tags: array(STRING) | NULL, name: STRING });
        expect(check({ tags: null, name: 'Alice' }, schema)).toBe(true);
        expect(check({ tags: ['a'], name: 'Alice' }, schema)).toBe(true);
        expect(check({ name: 'Alice' }, schema)).toBe(false);
    });

    test('object with nullable optional array with nullable elements', () => {
        let schema = object({
            data: array(NUMBER | NULL) | NULL | UNDEFINED
        });
        expect(check({}, schema)).toBe(true);
        expect(check({ data: null }, schema)).toBe(true);
        expect(check({ data: [1, null, 3] }, schema)).toBe(true);
        expect(check({ data: [1, 2, 3] }, schema)).toBe(true);
        expect(check({ data: [1, 'two'] }, schema)).toBe(false);
    });

    test('object with array of objects field', () => {
        let Item = object({ id: NUMBER, name: STRING });
        let schema = object({ items: array(Item) });
        expect(check({ items: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }] }, schema)).toBe(true);
        expect(check({ items: [] }, schema)).toBe(true);
        expect(check({ items: [{ id: 1, name: 42 }] }, schema)).toBe(false);
    });

    test('parse object with array of dates field', () => {
        let schema = object({ dates: array(DATE) | NULL });
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
        expect(check([], array(NUMBER))).toBe(true);
        expect(check([], array(STRING | NULL))).toBe(true);
        expect(check([], array(array(NUMBER)))).toBe(true);
        expect(conform([], array(DATE))).toBe(true);
    });

    test('single element arrays', () => {
        expect(check([42], array(NUMBER))).toBe(true);
        expect(check(['x'], array(NUMBER))).toBe(false);
        expect(check([null], array(NULL))).toBe(true);
        expect(check([undefined], array(UNDEFINED))).toBe(true);
    });

    test('large arrays', () => {
        let big = Array.from({ length: 10000 }, (_, i) => i);
        expect(check(big, array(NUMBER))).toBe(true);
        //@ts-ignore
        big[5000] = 'oops';
        expect(check(big, array(NUMBER))).toBe(false);
    });

    test('non-array types rejected', () => {
        let t = array(NUMBER);
        expect(check({}, t)).toBe(false);
        expect(check('string', t)).toBe(false);
        expect(check(42, t)).toBe(false);
        expect(check(true, t)).toBe(false);
        expect(check(new Set([1, 2]), t)).toBe(false);
    });

    test('array with all undefined elements', () => {
        let t = array(UNDEFINED);
        expect(check([undefined, undefined], t)).toBe(true);
        expect(check([null], t)).toBe(false);
    });

    test('array with all null elements', () => {
        let t = array(NULL);
        expect(check([null, null, null], t)).toBe(true);
        expect(check([null, 0], t)).toBe(false);
    });
});