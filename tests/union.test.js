import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, NUMBER, STRING, DATE, registry
} from 'uvd/core';

const { t, check, conform } = registry();

describe('discriminated: schema builder', () => {
    test('returns a complex typedef (bit 31 set)', () => {
        let type = t.union('kind', { a: t.object({ kind: STRING }), b: t.object({ kind: STRING }) });
        expect(typeof type).toBe('number');
        expect(type >>> 31).toBe(1);
    });

    test('throws on null variants', () => {
        expect(() => t.union('kind', null)).toThrow();
    });

    test('throws on array variants', () => {
        expect(() => t.union('kind', [])).toThrow();
    });

    test('throws on non-string discriminator', () => {
        expect(() => t.union(42, { a: t.object({ kind: STRING }) })).toThrow();
        expect(() => t.union(null, { a: t.object({ kind: STRING }) })).toThrow();
    });

    test('throws on non-number variant types', () => {
        expect(() => t.union('kind', { a: 'not-a-type' })).toThrow();
    });
});

describe('validate: basic unions', () => {
    let ShapeUnion = t.union('type', {
        circle: t.object({ type: STRING, radius: NUMBER }),
        rect: t.object({ type: STRING, w: NUMBER, h: NUMBER })
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
    let EventUnion = t.union('event', {
        click: t.object({ event: STRING, x: NUMBER, y: NUMBER }),
        keypress: t.object({ event: STRING, key: STRING, code: NUMBER }),
        scroll: t.object({ event: STRING, dx: NUMBER, dy: NUMBER }),
        resize: t.object({ event: STRING, width: NUMBER, height: NUMBER })
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
    let LogEntry = t.union('level', {
        info: t.object({ level: STRING, message: STRING, ts: DATE }),
        error: t.object({ level: STRING, message: STRING, ts: DATE, stack: STRING })
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
    let ShapeUnion = t.union('type', {
        circle: t.object({ type: STRING, radius: NUMBER }),
        square: t.object({ type: STRING, side: NUMBER })
    });

    test('Union | NULL', () => {
        let type = ShapeUnion | NULL;
        expect(check(null, type)).toBe(true);
        expect(check({ type: 'circle', radius: 5 }, type)).toBe(true);
        expect(check(undefined, type)).toBe(false);
    });

    test('Union | UNDEFINED', () => {
        let type = ShapeUnion | UNDEFINED;
        expect(check(undefined, type)).toBe(true);
        expect(check({ type: 'circle', radius: 5 }, type)).toBe(true);
        expect(check(null, type)).toBe(false);
    });

    test('Union | NULL | UNDEFINED', () => {
        let type = ShapeUnion | NULL | UNDEFINED;
        expect(check(null, type)).toBe(true);
        expect(check(undefined, type)).toBe(true);
        expect(check({ type: 'square', side: 10 }, type)).toBe(true);
        expect(check({ type: 'triangle' }, type)).toBe(false);
        expect(check('string', type)).toBe(false);
    });
});

describe('validate: union as object field', () => {
    let ActionUnion = t.union('action', {
        create: t.object({ action: STRING, name: STRING }),
        delete: t.object({ action: STRING, id: NUMBER })
    });

    test('required union field', () => {
        let schema = t.object({ op: ActionUnion });
        expect(check({ op: { action: 'create', name: 'item' } }, schema)).toBe(true);
        expect(check({ op: { action: 'delete', id: 42 } }, schema)).toBe(true);
        expect(check({ op: null }, schema)).toBe(false);
        expect(check({}, schema)).toBe(false);
    });

    test('nullable union field', () => {
        let schema = t.object({ op: ActionUnion | NULL });
        expect(check({ op: null }, schema)).toBe(true);
        expect(check({ op: { action: 'create', name: 'item' } }, schema)).toBe(true);
    });

    test('optional union field', () => {
        let schema = t.object({ op: ActionUnion | UNDEFINED });
        expect(check({}, schema)).toBe(true);
        expect(check({ op: { action: 'delete', id: 1 } }, schema)).toBe(true);
    });

    test('nullable optional union field', () => {
        let schema = t.object({ op: ActionUnion | NULL | UNDEFINED });
        expect(check({}, schema)).toBe(true);
        expect(check({ op: null }, schema)).toBe(true);
        expect(check({ op: { action: 'create', name: 'x' } }, schema)).toBe(true);
    });
});

describe('validate: array of unions', () => {
    let MsgUnion = t.union('type', {
        text: t.object({ type: STRING, body: STRING }),
        image: t.object({ type: STRING, url: STRING, width: NUMBER })
    });

    test('Array<Union>', () => {
        let type = t.array(MsgUnion);
        expect(check([
            { type: 'text', body: 'hello' },
            { type: 'image', url: 'https://vilhelm.se/a.png', width: 200 }
        ], type)).toBe(true);
        expect(check([], type)).toBe(true);
    });

    test('Array<Union | null>', () => {
        let type = t.array(MsgUnion | NULL);
        expect(check([
            { type: 'text', body: 'hello' },
            null,
            { type: 'image', url: 'https://vilhelm.se/a.png', width: 200 }
        ], type)).toBe(true);
    });

    test('Array<Union | null> | null', () => {
        let type = t.array(MsgUnion | NULL) | NULL;
        expect(check(null, type)).toBe(true);
        expect(check([null, { type: 'text', body: 'hi' }], type)).toBe(true);
    });

    test('Array<Union> rejects invalid variants in array', () => {
        let type = t.array(MsgUnion);
        expect(check([
            { type: 'text', body: 'hello' },
            { type: 'video', src: 'x.mp4' }  // unknown variant
        ], type)).toBe(false);
    });
});

describe('parse: unions', () => {
    let ItemUnion = t.union('kind', {
        product: t.object({ kind: STRING, name: STRING, price: NUMBER }),
        service: t.object({ kind: STRING, name: STRING, hourly: NUMBER, since: DATE })
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
        let type = t.union('kind', { only: t.object({ kind: STRING, val: NUMBER }) });
        expect(check({ kind: 'only', val: 42 }, type)).toBe(true);
        expect(check({ kind: 'other', val: 42 }, type)).toBe(false);
    });

    test('union variants with optional/nullable fields', () => {
        let type = t.union('mode', {
            full: t.object({ mode: STRING, a: NUMBER, b: NUMBER }),
            partial: t.object({ mode: STRING, a: NUMBER, b: NUMBER | UNDEFINED })
        });
        expect(check({ mode: 'partial', a: 1 }, type)).toBe(true);
        expect(check({ mode: 'full', a: 1 }, type)).toBe(false); // b required for 'full'
    });

    test('union with extra properties on input (ignored)', () => {
        let type = t.union('kind', {
            x: t.object({ kind: STRING, val: NUMBER })
        });
        expect(check({ kind: 'x', val: 1, extra: 'ignored' }, type)).toBe(true);
    });

    test('union where variant has array field', () => {
        let type = t.union('type', {
            list: t.object({ type: STRING, items: t.array(NUMBER) }),
            single: t.object({ type: STRING, item: NUMBER })
        });
        expect(check({ type: 'list', items: [1, 2, 3] }, type)).toBe(true);
        expect(check({ type: 'single', item: 42 }, type)).toBe(true);
        expect(check({ type: 'list', items: [1, '2'] }, type)).toBe(false);
    });

    test('union where variant has nested union field', () => {
        let InnerUnion = t.union('inner', {
            a: t.object({ inner: STRING, val: NUMBER }),
            b: t.object({ inner: STRING, val: STRING })
        });
        let OuterUnion = t.union('outer', {
            wrap: t.object({ outer: STRING, child: InnerUnion })
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