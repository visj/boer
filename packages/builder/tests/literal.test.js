import { describe, test, expect } from 'bun:test';
import { catalog } from '@boer/validate';
import { allocators } from '@boer/builder';

const cat = catalog();
const t = allocators(cat);
const { validate } = cat;

describe('t.literal — boolean and null fast paths', () => {
    test('literal(null) validates null only', () => {
        const NullType = t.literal(null);
        expect(validate(null, NullType)).toBe(true);
        expect(validate(undefined, NullType)).toBe(false);
        expect(validate(0, NullType)).toBe(false);
        expect(validate('', NullType)).toBe(false);
        expect(validate(false, NullType)).toBe(false);
    });

    test('literal(true) validates true only', () => {
        const TrueType = t.literal(true);
        expect(validate(true, TrueType)).toBe(true);
        expect(validate(false, TrueType)).toBe(false);
        expect(validate(1, TrueType)).toBe(false);
        expect(validate(null, TrueType)).toBe(false);
    });

    test('literal(false) validates false only', () => {
        const FalseType = t.literal(false);
        expect(validate(false, FalseType)).toBe(true);
        expect(validate(true, FalseType)).toBe(false);
        expect(validate(0, FalseType)).toBe(false);
        expect(validate(null, FalseType)).toBe(false);
    });
});

describe('t.literal — string fast path (V_ENUM binary search)', () => {
    test('literal("admin") accepts only "admin"', () => {
        const AdminType = t.literal('admin');
        expect(validate('admin', AdminType)).toBe(true);
        expect(validate('ADMIN', AdminType)).toBe(false);
        expect(validate('', AdminType)).toBe(false);
        expect(validate('adm', AdminType)).toBe(false);
        expect(validate(null, AdminType)).toBe(false);
        expect(validate(42, AdminType)).toBe(false);
    });

    test('literal("") accepts only empty string', () => {
        const EmptyStr = t.literal('');
        expect(validate('', EmptyStr)).toBe(true);
        expect(validate(' ', EmptyStr)).toBe(false);
        expect(validate(null, EmptyStr)).toBe(false);
    });
});

describe('t.literal — number fast path (V_ENUM binary search)', () => {
    test('literal(42) accepts only 42', () => {
        const FortyTwo = t.literal(42);
        expect(validate(42, FortyTwo)).toBe(true);
        expect(validate(42.0, FortyTwo)).toBe(true);
        expect(validate(43, FortyTwo)).toBe(false);
        expect(validate(0, FortyTwo)).toBe(false);
        expect(validate('42', FortyTwo)).toBe(false);
        expect(validate(null, FortyTwo)).toBe(false);
    });

    test('literal(0) accepts only 0', () => {
        const Zero = t.literal(0);
        expect(validate(0, Zero)).toBe(true);
        expect(validate(-0, Zero)).toBe(true);
        expect(validate(1, Zero)).toBe(false);
        expect(validate(false, Zero)).toBe(false);
    });
});

describe('t.literal — object structural desugaring', () => {
    test('literal({a: 1}) validates exact object', () => {
        const ObjType = t.literal({ a: 1 });
        expect(validate({ a: 1 }, ObjType)).toBe(true);
        expect(validate({ a: 2 }, ObjType)).toBe(false);
        expect(validate({ a: 1, b: 2 }, ObjType)).toBe(false);
        expect(validate({}, ObjType)).toBe(false);
        expect(validate(null, ObjType)).toBe(false);
        expect(validate('hello', ObjType)).toBe(false);
    });

    test('literal({}) validates empty object', () => {
        const EmptyObj = t.literal({});
        expect(validate({}, EmptyObj)).toBe(true);
        expect(validate({ a: 1 }, EmptyObj)).toBe(false);
        expect(validate(null, EmptyObj)).toBe(false);
    });
});

describe('t.literal — array structural desugaring', () => {
    test('literal([1, 2]) validates exact tuple', () => {
        const ArrType = t.literal([1, 2]);
        expect(validate([1, 2], ArrType)).toBe(true);
        expect(validate([1, 3], ArrType)).toBe(false);
        expect(validate([1], ArrType)).toBe(false);
        expect(validate([1, 2, 3], ArrType)).toBe(false);
        expect(validate([], ArrType)).toBe(false);
        expect(validate(null, ArrType)).toBe(false);
    });
});

describe('t.enum — homogeneous string enum', () => {
    test('enum(["idle", "running", "failed"]) — sorted keyId binary search', () => {
        const Status = t.enum(['idle', 'running', 'failed']);
        expect(validate('idle', Status)).toBe(true);
        expect(validate('running', Status)).toBe(true);
        expect(validate('failed', Status)).toBe(true);
        expect(validate('stopped', Status)).toBe(false);
        expect(validate('', Status)).toBe(false);
        expect(validate(null, Status)).toBe(false);
        expect(validate(42, Status)).toBe(false);
    });

    test('enum(["a"]) single string', () => {
        const OneStr = t.enum(['a']);
        expect(validate('a', OneStr)).toBe(true);
        expect(validate('b', OneStr)).toBe(false);
        expect(validate(null, OneStr)).toBe(false);
    });
});

describe('t.enum — homogeneous number enum', () => {
    test('enum([80, 443, 8080]) — sorted float64 binary search', () => {
        const Ports = t.enum([80, 443, 8080]);
        expect(validate(80, Ports)).toBe(true);
        expect(validate(443, Ports)).toBe(true);
        expect(validate(8080, Ports)).toBe(true);
        expect(validate(8081, Ports)).toBe(false);
        expect(validate(0, Ports)).toBe(false);
        expect(validate('80', Ports)).toBe(false);
        expect(validate(null, Ports)).toBe(false);
    });
});

describe('t.enum — mixed primitive enum (Rule C.1)', () => {
    test('enum(["alice", 1, null]) — unified primitive branch', () => {
        const Mixed = t.enum(['alice', 1, null]);
        expect(validate('alice', Mixed)).toBe(true);
        expect(validate(1, Mixed)).toBe(true);
        expect(validate(null, Mixed)).toBe(true);
        expect(validate('bob', Mixed)).toBe(false);
        expect(validate(2, Mixed)).toBe(false);
        expect(validate(undefined, Mixed)).toBe(false);
        expect(validate(true, Mixed)).toBe(false);
    });

    test('enum([true, false]) — boolean bits, no validator', () => {
        const BoolEnum = t.enum([true, false]);
        expect(validate(true, BoolEnum)).toBe(true);
        expect(validate(false, BoolEnum)).toBe(true);
        expect(validate(1, BoolEnum)).toBe(false);
        expect(validate(0, BoolEnum)).toBe(false);
        expect(validate(null, BoolEnum)).toBe(false);
    });

    test('enum([null]) — nullable bit only', () => {
        const NullEnum = t.enum([null]);
        expect(validate(null, NullEnum)).toBe(true);
        expect(validate(undefined, NullEnum)).toBe(false);
        expect(validate(0, NullEnum)).toBe(false);
        expect(validate('', NullEnum)).toBe(false);
    });
});

describe('t.enum — complex type splitting (Rule C.2)', () => {
    test('enum([{a: 1}, {b: 2}]) — two K_OBJECT branches in K_OR', () => {
        const ObjEnum = t.enum([{ a: 1 }, { b: 2 }]);
        expect(validate({ a: 1 }, ObjEnum)).toBe(true);
        expect(validate({ b: 2 }, ObjEnum)).toBe(true);
        expect(validate({ a: 2 }, ObjEnum)).toBe(false);
        expect(validate({ a: 1, b: 2 }, ObjEnum)).toBe(false);
        expect(validate(null, ObjEnum)).toBe(false);
        expect(validate('hello', ObjEnum)).toBe(false);
    });

    test('enum([{a: 1}, "alice"]) — K_OR with object branch and string branch', () => {
        const Mixed = t.enum([{ a: 1 }, 'alice']);
        expect(validate({ a: 1 }, Mixed)).toBe(true);
        expect(validate('alice', Mixed)).toBe(true);
        expect(validate({ a: 2 }, Mixed)).toBe(false);
        expect(validate('bob', Mixed)).toBe(false);
        expect(validate(null, Mixed)).toBe(false);
    });

    test('enum([]) — empty enum → NEVER', () => {
        const EmptyEnum = t.enum([]);
        expect(validate(null, EmptyEnum)).toBe(false);
        expect(validate(0, EmptyEnum)).toBe(false);
        expect(validate('', EmptyEnum)).toBe(false);
        expect(validate(true, EmptyEnum)).toBe(false);
    });
});
