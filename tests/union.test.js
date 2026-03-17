import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, NUMBER, STRING, DATE,
    object, array, union, conform, check
} from '../dist';

describe('discriminated: schema builder', () => {
    test('returns a complex typedef (bit 31 set)', () => {
        let t = union('kind', { a: object({ kind: STRING }), b: object({ kind: STRING }) });
        expect(typeof t).toBe('number');
        expect(t >>> 31).toBe(1);
    });

    test('throws on null variants', () => {
        expect(() => union('kind', null)).toThrow();
    });

    test('throws on array variants', () => {
        expect(() => union('kind', [])).toThrow();
    });

    test('throws on non-string discriminator', () => {
        expect(() => union(42, { a: object({ kind: STRING }) })).toThrow();
        expect(() => union(null, { a: object({ kind: STRING }) })).toThrow();
    });

    test('throws on non-number variant types', () => {
        expect(() => union('kind', { a: 'not-a-type' })).toThrow();
    });
});

describe('validate: basic unions', () => {
    let ShapeUnion = union('type', {
        circle: object({ type: STRING, radius: NUMBER }),
        rect: object({ type: STRING, w: NUMBER, h: NUMBER })
    });

    test('matches correct variant', () => {
        expect(check({ type: 'circle', radius: 5 }, ShapeUnion)).toBe(true);
        expect(check({ type: 'rect', w: 10, h: 20 }, ShapeUnion)).toBe(true);
    });

    test('rejects unknown discriminator value', () => {
        expect(check({ type: 'triangle', sides: 3 }, ShapeUnion)).toBe(false);
    });

    test('rejects correct discriminator but wrong fields', () => {
        expect(check({ type: 'circle', radius: 'five' }, ShapeUnion)).toBe(false);
        expect(check({ type: 'rect', w: 10, h: 'twenty' }, ShapeUnion)).toBe(false);
    });

    test('rejects missing discriminator', () => {
        expect(check({ radius: 5 }, ShapeUnion)).toBe(false);
    });

    test('rejects non-object inputs', () => {
        expect(check(null, ShapeUnion)).toBe(false);
        expect(check(undefined, ShapeUnion)).toBe(false);
        expect(check('circle', ShapeUnion)).toBe(false);
        expect(check(42, ShapeUnion)).toBe(false);
        expect(check([], ShapeUnion)).toBe(false);
        expect(check(true, ShapeUnion)).toBe(false);
    });
});

describe('validate: union with many variants', () => {
    let EventUnion = union('event', {
        click: object({ event: STRING, x: NUMBER, y: NUMBER }),
        keypress: object({ event: STRING, key: STRING, code: NUMBER }),
        scroll: object({ event: STRING, dx: NUMBER, dy: NUMBER }),
        resize: object({ event: STRING, width: NUMBER, height: NUMBER })
    });

    test('each variant validates correctly', () => {
        expect(check({ event: 'click', x: 10, y: 20 }, EventUnion)).toBe(true);
        expect(check({ event: 'keypress', key: 'a', code: 65 }, EventUnion)).toBe(true);
        expect(check({ event: 'scroll', dx: 0, dy: -10 }, EventUnion)).toBe(true);
        expect(check({ event: 'resize', width: 800, height: 600 }, EventUnion)).toBe(true);
    });

    test('wrong fields for variant', () => {
        expect(check({ event: 'click', key: 'a' }, EventUnion)).toBe(false);
    });
});

describe('validate: union with rich types', () => {
    let LogEntry = union('level', {
        info: object({ level: STRING, message: STRING, ts: DATE }),
        error: object({ level: STRING, message: STRING, ts: DATE, stack: STRING })
    });

    test('validates with Date instances', () => {
        expect(check({ level: 'info', message: 'ok', ts: new Date() }, LogEntry)).toBe(true);
        expect(check({ level: 'error', message: 'fail', ts: new Date(), stack: 'at...' }, LogEntry)).toBe(true);
    });

    test('rejects with string dates (validate is strict)', () => {
        expect(check({ level: 'info', message: 'ok', ts: '2024-01-01' }, LogEntry)).toBe(false);
    });
});

describe('validate: nullable unions', () => {
    let ShapeUnion = union('type', {
        circle: object({ type: STRING, radius: NUMBER }),
        square: object({ type: STRING, side: NUMBER })
    });

    test('Union | NULL', () => {
        let t = ShapeUnion | NULL;
        expect(check(null, t)).toBe(true);
        expect(check({ type: 'circle', radius: 5 }, t)).toBe(true);
        expect(check(undefined, t)).toBe(false);
    });

    test('Union | UNDEFINED', () => {
        let t = ShapeUnion | UNDEFINED;
        expect(check(undefined, t)).toBe(true);
        expect(check({ type: 'circle', radius: 5 }, t)).toBe(true);
        expect(check(null, t)).toBe(false);
    });

    test('Union | NULL | UNDEFINED', () => {
        let t = ShapeUnion | NULL | UNDEFINED;
        expect(check(null, t)).toBe(true);
        expect(check(undefined, t)).toBe(true);
        expect(check({ type: 'square', side: 10 }, t)).toBe(true);
        expect(check({ type: 'triangle' }, t)).toBe(false);
        expect(check('string', t)).toBe(false);
    });
});

describe('validate: union as object field', () => {
    let ActionUnion = union('action', {
        create: object({ action: STRING, name: STRING }),
        delete: object({ action: STRING, id: NUMBER })
    });

    test('required union field', () => {
        let schema = object({ op: ActionUnion });
        expect(check({ op: { action: 'create', name: 'item' } }, schema)).toBe(true);
        expect(check({ op: { action: 'delete', id: 42 } }, schema)).toBe(true);
        expect(check({ op: null }, schema)).toBe(false);
        expect(check({}, schema)).toBe(false);
    });

    test('nullable union field', () => {
        let schema = object({ op: ActionUnion | NULL });
        expect(check({ op: null }, schema)).toBe(true);
        expect(check({ op: { action: 'create', name: 'item' } }, schema)).toBe(true);
    });

    test('optional union field', () => {
        let schema = object({ op: ActionUnion | UNDEFINED });
        expect(check({}, schema)).toBe(true);
        expect(check({ op: { action: 'delete', id: 1 } }, schema)).toBe(true);
    });

    test('nullable optional union field', () => {
        let schema = object({ op: ActionUnion | NULL | UNDEFINED });
        expect(check({}, schema)).toBe(true);
        expect(check({ op: null }, schema)).toBe(true);
        expect(check({ op: { action: 'create', name: 'x' } }, schema)).toBe(true);
    });
});

describe('validate: array of unions', () => {
    let MsgUnion = union('type', {
        text: object({ type: STRING, body: STRING }),
        image: object({ type: STRING, url: STRING, width: NUMBER })
    });

    test('Array<Union>', () => {
        let t = array(MsgUnion);
        expect(check([
            { type: 'text', body: 'hello' },
            { type: 'image', url: 'https://vilhelm.se/a.png', width: 200 }
        ], t)).toBe(true);
        expect(check([], t)).toBe(true);
    });

    test('Array<Union | null>', () => {
        let t = array(MsgUnion | NULL);
        expect(check([
            { type: 'text', body: 'hello' },
            null,
            { type: 'image', url: 'https://vilhelm.se/a.png', width: 200 }
        ], t)).toBe(true);
    });

    test('Array<Union | null> | null', () => {
        let t = array(MsgUnion | NULL) | NULL;
        expect(check(null, t)).toBe(true);
        expect(check([null, { type: 'text', body: 'hi' }], t)).toBe(true);
    });

    test('Array<Union> rejects invalid variants in array', () => {
        let t = array(MsgUnion);
        expect(check([
            { type: 'text', body: 'hello' },
            { type: 'video', src: 'x.mp4' }  // unknown variant
        ], t)).toBe(false);
    });
});

describe('parse: unions', () => {
    let ItemUnion = union('kind', {
        product: object({ kind: STRING, name: STRING, price: NUMBER }),
        service: object({ kind: STRING, name: STRING, hourly: NUMBER, since: DATE })
    });

    test('parse validates native types strictly', () => {
        expect(conform({ kind: 'product', name: 'Widget', price: 9.99 }, ItemUnion)).toBe(true);
        expect(conform({ kind: 'product', name: 'Widget', price: '9.99' }, ItemUnion)).toBe(false);
    });

    test('parse casts rich types (Date)', () => {
        let obj = { kind: 'service', name: 'Consulting', hourly: 150, since: '2024-01-01' };
        expect(conform(obj, ItemUnion)).toBe(true);
        expect(obj.since).toBeInstanceOf(Date);
    });

    test('parse nullable union', () => {
        expect(conform(null, ItemUnion | NULL)).toBe(true);
    });
});

describe('union: edge cases', () => {
    test('single variant union', () => {
        let t = union('kind', { only: object({ kind: STRING, val: NUMBER }) });
        expect(check({ kind: 'only', val: 42 }, t)).toBe(true);
        expect(check({ kind: 'other', val: 42 }, t)).toBe(false);
    });

    test('union variants with optional/nullable fields', () => {
        let t = union('mode', {
            full: object({ mode: STRING, a: NUMBER, b: NUMBER }),
            partial: object({ mode: STRING, a: NUMBER, b: NUMBER | UNDEFINED })
        });
        expect(check({ mode: 'partial', a: 1 }, t)).toBe(true);
        expect(check({ mode: 'full', a: 1 }, t)).toBe(false); // b required for 'full'
    });

    test('union with extra properties on input (ignored)', () => {
        let t = union('kind', {
            x: object({ kind: STRING, val: NUMBER })
        });
        expect(check({ kind: 'x', val: 1, extra: 'ignored' }, t)).toBe(true);
    });

    test('union where variant has array field', () => {
        let t = union('type', {
            list: object({ type: STRING, items: array(NUMBER) }),
            single: object({ type: STRING, item: NUMBER })
        });
        expect(check({ type: 'list', items: [1, 2, 3] }, t)).toBe(true);
        expect(check({ type: 'single', item: 42 }, t)).toBe(true);
        expect(check({ type: 'list', items: [1, '2'] }, t)).toBe(false);
    });

    test('union where variant has nested union field', () => {
        let InnerUnion = union('inner', {
            a: object({ inner: STRING, val: NUMBER }),
            b: object({ inner: STRING, val: STRING })
        });
        let OuterUnion = union('outer', {
            wrap: object({ outer: STRING, child: InnerUnion })
        });
        expect(check({
            outer: 'wrap',
            child: { inner: 'a', val: 42 }
        }, OuterUnion)).toBe(true);
        expect(check({
            outer: 'wrap',
            child: { inner: 'b', val: 'hello' }
        }, OuterUnion)).toBe(true);
        expect(check({
            outer: 'wrap',
            child: { inner: 'a', val: 'wrong' }
        }, OuterUnion)).toBe(false);
    });
});