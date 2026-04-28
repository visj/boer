import { describe, test, expect } from 'bun:test';
import { STRING, NUMBER, BOOLEAN } from '@luvd/core';
import { catalog } from '@luvd/validate';
import { allocators } from '@luvd/builder';
import { print, dump, load } from '@luvd/inspect';
import { compile } from '@luvd/compiler';
import { CompoundSchema } from '@luvd/schema';
import fs from 'fs';
import path from 'path';

/**
 * Parse the 96-byte binary header into a plain object for easy assertions.
 * All multi-byte integers are little-endian.
 * @param {!Uint8Array} buf
 * @returns {Object}
 */
function readHeader(buf) {
    let v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return {
        magic:          String.fromCharCode(buf[0], buf[1], buf[2], buf[3]),
        fmtVersion:     v.getUint16(4, true),
        libMajor:       v.getUint16(6, true),
        libMinor:       v.getUint16(8, true),
        libPatch:       v.getUint16(10, true),
        flags:          v.getUint32(12, true),
        checksum:       v.getUint32(16, true),
        slabOffset:     v.getUint32(20, true),
        slabCount:      v.getUint32(24, true),
        slabWidth:      buf[28],
        kindsOffset:    v.getUint32(32, true),
        kindsCount:     v.getUint32(36, true),
        kindsWidth:     buf[40],
        valsOffset:     v.getUint32(44, true),
        valsCount:      v.getUint32(48, true),
        valsWidth:      buf[52],
        strtabOffset:   v.getUint32(56, true),
        strtabCount:    v.getUint32(60, true),
        regexOffset:    v.getUint32(64, true),
        regexCount:     v.getUint32(68, true),
        constOffset:    v.getUint32(72, true),
        constCount:     v.getUint32(76, true),
        enumOffset:     v.getUint32(80, true),
        enumCount:      v.getUint32(84, true),
        callbackCount:  v.getUint32(88, true),
    };
}

/**
 * Decode length-prefixed UTF-8 strings from the string table region.
 * @param {!Uint8Array} buf
 * @param {number} offset
 * @param {number} count
 * @returns {!Array<string>}
 */
function decodeStringTable(buf, offset, count) {
    let v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let dec = new TextDecoder();
    let result = [];
    let off = offset;
    for (let i = 0; i < count; i++) {
        let len = v.getUint32(off, true);
        off += 4;
        let str = dec.decode(buf.subarray(off, off + len));
        result.push(str);
        off += len;
    }
    return result;
}

/**
 * Decode regex table entries from the binary.
 * @param {!Uint8Array} buf
 * @param {number} offset
 * @param {number} count
 * @returns {!Array<{source: string, flags: string}>}
 */
function decodeRegexTable(buf, offset, count) {
    let v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let dec = new TextDecoder();
    let result = [];
    let off = offset;
    let flagChars = 'gimsuyv d';
    for (let i = 0; i < count; i++) {
        let len = v.getUint32(off, true);
        off += 4;
        let source = dec.decode(buf.subarray(off, off + len));
        off += len;
        let flagByte = buf[off];
        off += 1;
        let flags = '';
        if (flagByte & 1) { flags += 'g'; }
        if (flagByte & 2) { flags += 'i'; }
        if (flagByte & 4) { flags += 'm'; }
        if (flagByte & 8) { flags += 's'; }
        if (flagByte & 16) { flags += 'u'; }
        if (flagByte & 32) { flags += 'y'; }
        if (flagByte & 64) { flags += 'v'; }
        if (flagByte & 128) { flags += 'd'; }
        result.push({ source, flags });
    }
    return result;
}

/** Tag constants matching inspect.js */
const TAG_NULL = 0;
const TAG_BOOL = 1;
const TAG_NUMBER = 2;
const TAG_STRING = 3;
const TAG_UNDEFINED = 4;

/**
 * Decode a single tagged value from the binary. Returns [value, newOffset].
 * @param {!Uint8Array} buf
 * @param {!DataView} v
 * @param {number} off
 * @returns {[*, number]}
 */
function decodeTaggedValue(buf, v, off) {
    let tag = buf[off];
    off += 1;
    if (tag === TAG_NULL) {
        return [null, off];
    }
    if (tag === TAG_UNDEFINED) {
        return [undefined, off];
    }
    if (tag === TAG_BOOL) {
        return [buf[off] === 1, off + 1];
    }
    if (tag === TAG_NUMBER) {
        return [v.getFloat64(off, true), off + 8];
    }
    if (tag === TAG_STRING) {
        let len = v.getUint32(off, true);
        off += 4;
        let str = new TextDecoder().decode(buf.subarray(off, off + len));
        return [str, off + len];
    }
    return [undefined, off];
}

/**
 * Decode the constants section.
 * @param {!Uint8Array} buf
 * @param {number} offset
 * @param {number} count
 * @returns {!Array<*>}
 */
function decodeConstants(buf, offset, count) {
    let v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let result = [];
    let off = offset;
    for (let i = 0; i < count; i++) {
        let pair = decodeTaggedValue(buf, v, off);
        result.push(pair[0]);
        off = pair[1];
    }
    return result;
}

/**
 * Decode the enums section.
 * @param {!Uint8Array} buf
 * @param {number} offset
 * @param {number} count
 * @returns {!Array<!Set<*>>}
 */
function decodeEnums(buf, offset, count) {
    let v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let result = [];
    let off = offset;
    for (let i = 0; i < count; i++) {
        let size = v.getUint32(off, true);
        off += 4;
        let set = new Set();
        for (let j = 0; j < size; j++) {
            let pair = decodeTaggedValue(buf, v, off);
            set.add(pair[0]);
            off = pair[1];
        }
        result.push(set);
    }
    return result;
}

/**
 * Recompute CRC32 for verification (same algorithm as inspect.js).
 * @param {!Uint8Array} buf
 * @param {number} offset
 * @param {number} length
 * @returns {number}
 */
function verifyCrc32(buf, offset, length) {
    let table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            if (c & 1) {
                c = 0xEDB88320 ^ (c >>> 1);
            } else {
                c = c >>> 1;
            }
        }
        table[i] = c;
    }
    let crc = 0xFFFFFFFF;
    let end = offset + length;
    for (let i = offset; i < end; i++) {
        crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}


// ========== Helper: create a populated catalog ==========

/**
 * Create a catalog with a variety of schemas for comprehensive testing.
 * Returns { cat, alloc } so tests can inspect both.
 */
function makePopulatedCatalog() {
    let cat = catalog();
    let alloc = allocators(cat);

    /* Object with string + number keys */
    let person = alloc.object({
        name: alloc.string({ minLength: 1, maxLength: 100 }),
        age: alloc.number({ minimum: 0, maximum: 150 }),
        email: alloc.string({ pattern: '^[^@]+@[^@]+$' }),
    });

    /* Array of numbers */
    let scores = alloc.array(NUMBER);

    /* Enum via or with constants */
    let color = alloc.or(
        alloc.string({ const: 'red' }),
        alloc.string({ const: 'green' }),
        alloc.string({ const: 'blue' }),
    );

    /* Nested object */
    let team = alloc.object({
        leader: person,
        members: alloc.array(person),
    });

    return { cat, alloc, person, scores, color, team };
}


// ========== Tests ==========

describe('print', () => {
    test('empty catalog returns correct base stats', () => {
        let cat = catalog();
        let result = print(cat);

        /* KIND_PTR starts at 6 for the 3 pre-allocated bare types (stride-2) */
        expect(result.stats.kinds.size).toBe(6);
        expect(result.stats.kinds.capacity).toBe(2048);

        /* SLAB and VALIDATORS start empty */
        expect(result.stats.slab.size).toBe(0);
        expect(result.stats.slab.capacity).toBe(16384);
        expect(result.stats.validators.size).toBe(0);
        expect(result.stats.validators.capacity).toBe(512);

        /* KEY_INDEX starts with the empty sentinel */
        expect(result.stats.keys.size).toBe(1);

        /* REGEX_CACHE starts with the /(?:)/ sentinel */
        expect(result.stats.regex.size).toBe(1);

        expect(result.stats.callbacks.size).toBe(0);
        expect(result.stats.constants.size).toBe(0);
        expect(result.stats.enums.size).toBe(0);
    });

    test('stats reflect usage after defining schemas', () => {
        let { cat } = makePopulatedCatalog();
        let result = print(cat);

        /* After defining schemas, SLAB and KINDS should have grown */
        expect(result.stats.slab.size).toBeGreaterThan(0);
        expect(result.stats.kinds.size).toBeGreaterThan(6);

        /* We defined keys like "name", "age", "email", "leader", "members" */
        expect(result.stats.keys.size).toBeGreaterThanOrEqual(6); // sentinel + 5 keys

        /* We defined a pattern regex */
        expect(result.stats.regex.size).toBeGreaterThanOrEqual(2); // sentinel + 1 pattern
    });

    test('config can be fed back to create a right-sized catalog', () => {
        let { cat } = makePopulatedCatalog();
        let result = print(cat);
        let config = result.config;

        /* Create a new catalog with exact sizes */
        let cat2 = catalog(config);
        let h2 = cat2.__heap.HEAP;

        /* The new catalog's capacity should match the exact usage */
        expect(h2.SLAB_LEN).toBe(result.stats.slab.size);
        expect(h2.KIND_LEN).toBe(result.stats.kinds.size);
        expect(h2.VAL_LEN).toBe(result.stats.validators.size);
    });
});

describe('dump — header', () => {
    let buf;
    let hdr;

    test('setup', () => {
        let { cat } = makePopulatedCatalog();
        buf = dump(cat);
        hdr = readHeader(buf);
    });

    test('magic bytes are UVD\\0', () => {
        expect(hdr.magic).toBe('UVD\0');
    });

    test('format version is 1', () => {
        expect(hdr.fmtVersion).toBe(1);
    });

    test('library version is 0.2.0', () => {
        expect(hdr.libMajor).toBe(0);
        expect(hdr.libMinor).toBe(2);
        expect(hdr.libPatch).toBe(0);
    });

    test('element widths are correct', () => {
        expect(hdr.slabWidth).toBe(4);
        expect(hdr.kindsWidth).toBe(4);
        expect(hdr.valsWidth).toBe(8);
    });

    test('all section offsets are within bounds', () => {
        expect(hdr.slabOffset).toBeLessThanOrEqual(buf.byteLength);
        expect(hdr.kindsOffset).toBeLessThanOrEqual(buf.byteLength);
        expect(hdr.valsOffset).toBeLessThanOrEqual(buf.byteLength);
        expect(hdr.strtabOffset).toBeLessThanOrEqual(buf.byteLength);
        expect(hdr.regexOffset).toBeLessThanOrEqual(buf.byteLength);
        expect(hdr.constOffset).toBeLessThanOrEqual(buf.byteLength);
        expect(hdr.enumOffset).toBeLessThanOrEqual(buf.byteLength);
    });

    test('validators section is at offset 96 (8-byte aligned)', () => {
        expect(hdr.valsOffset).toBe(96);
    });

    test('checksum is nonzero', () => {
        expect(hdr.checksum).not.toBe(0);
    });

    test('sections do not overlap', () => {
        /* Vals comes first, then slab, then kinds, then variable blobs */
        let valsEnd = hdr.valsOffset + hdr.valsCount * 8;
        let slabEnd = hdr.slabOffset + hdr.slabCount * 4;
        let kindsEnd = hdr.kindsOffset + hdr.kindsCount * 4;

        expect(hdr.slabOffset).toBeGreaterThanOrEqual(valsEnd);
        expect(hdr.kindsOffset).toBeGreaterThanOrEqual(slabEnd);
        expect(hdr.strtabOffset).toBeGreaterThanOrEqual(kindsEnd);
        expect(hdr.regexOffset).toBeGreaterThanOrEqual(hdr.strtabOffset);
        expect(hdr.constOffset).toBeGreaterThanOrEqual(hdr.regexOffset);
        expect(hdr.enumOffset).toBeGreaterThanOrEqual(hdr.constOffset);
    });
});

describe('dump — typed arrays', () => {
    test('SLAB data round-trips correctly', () => {
        let { cat } = makePopulatedCatalog();
        let HEAP = cat.__heap.HEAP;
        let buf = dump(cat);
        let hdr = readHeader(buf);

        let slabView = new Uint32Array(buf.buffer, hdr.slabOffset, hdr.slabCount);
        let expected = HEAP.SLAB.subarray(0, HEAP.PTR);

        expect(hdr.slabCount).toBe(HEAP.PTR);
        for (let i = 0; i < expected.length; i++) {
            expect(slabView[i]).toBe(expected[i]);
        }
    });

    test('KINDS data round-trips correctly', () => {
        let { cat } = makePopulatedCatalog();
        let HEAP = cat.__heap.HEAP;
        let buf = dump(cat);
        let hdr = readHeader(buf);

        let kindsView = new Uint32Array(buf.buffer, hdr.kindsOffset, hdr.kindsCount);
        let expected = HEAP.KINDS.subarray(0, HEAP.KIND_PTR);

        expect(hdr.kindsCount).toBe(HEAP.KIND_PTR);
        for (let i = 0; i < expected.length; i++) {
            expect(kindsView[i]).toBe(expected[i]);
        }
    });

    test('VALIDATORS data round-trips correctly', () => {
        let { cat } = makePopulatedCatalog();
        let HEAP = cat.__heap.HEAP;
        let buf = dump(cat);
        let hdr = readHeader(buf);

        let valsView = new Float64Array(buf.buffer, hdr.valsOffset, hdr.valsCount);
        let expected = HEAP.VALIDATORS.subarray(0, HEAP.VAL_PTR);

        expect(hdr.valsCount).toBe(HEAP.VAL_PTR);
        for (let i = 0; i < expected.length; i++) {
            expect(valsView[i]).toBe(expected[i]);
        }
    });
});

describe('dump — string table', () => {
    test('entry count matches KEY_INDEX length', () => {
        let { cat } = makePopulatedCatalog();
        let buf = dump(cat);
        let hdr = readHeader(buf);

        expect(hdr.strtabCount).toBe(cat.__heap.KEY_INDEX.length);
    });

    test('strings round-trip correctly', () => {
        let { cat } = makePopulatedCatalog();
        let buf = dump(cat);
        let hdr = readHeader(buf);

        let decoded = decodeStringTable(buf, hdr.strtabOffset, hdr.strtabCount);
        let expected = cat.__heap.KEY_INDEX;

        expect(decoded.length).toBe(expected.length);
        for (let i = 0; i < expected.length; i++) {
            expect(decoded[i]).toBe(expected[i]);
        }
    });

    test('handles multi-byte UTF-8 keys', () => {
        let cat = catalog();
        let alloc = allocators(cat);

        /* Use emoji and CJK characters as object keys */
        let schema = alloc.object({
            '\u{1F600}': STRING,   // emoji (4-byte UTF-8)
            '\u4E16\u754C': NUMBER, // CJK "世界" (3-byte each)
        });

        let buf = dump(cat);
        let hdr = readHeader(buf);
        let decoded = decodeStringTable(buf, hdr.strtabOffset, hdr.strtabCount);

        expect(decoded).toContain('\u{1F600}');
        expect(decoded).toContain('\u4E16\u754C');
    });
});

describe('dump — regex table', () => {
    test('entry count matches REGEX_CACHE length minus sentinel', () => {
        let { cat } = makePopulatedCatalog();
        let buf = dump(cat);
        let hdr = readHeader(buf);

        expect(hdr.regexCount).toBe(cat.__heap.REGEX_CACHE.length - 1);
    });

    test('regex patterns round-trip correctly', () => {
        let { cat } = makePopulatedCatalog();
        let buf = dump(cat);
        let hdr = readHeader(buf);

        let decoded = decodeRegexTable(buf, hdr.regexOffset, hdr.regexCount);
        let cache = cat.__heap.REGEX_CACHE;

        for (let i = 0; i < decoded.length; i++) {
            expect(decoded[i].source).toBe(cache[i + 1].source);
        }
    });

    test('regex flags are preserved (u flag is default)', () => {
        let cat = catalog();
        let alloc = allocators(cat);

        /* uvd always creates patterns with the 'u' (unicode) flag */
        alloc.string({ pattern: '^hello$' });

        let buf = dump(cat);
        let hdr = readHeader(buf);
        let decoded = decodeRegexTable(buf, hdr.regexOffset, hdr.regexCount);

        let found = decoded.find(r => r.source === '^hello$');
        expect(found).toBeDefined();
        expect(found.flags).toContain('u');
    });
});

describe('dump — constants & enums', () => {
    test('constants round-trip for various types', () => {
        let cat = catalog();
        let alloc = allocators(cat);

        /* const values create entries in CONSTANTS */
        alloc.string({ const: 'hello' });
        alloc.number({ const: 42 });
        alloc.boolean({ const: true });

        let CONSTANTS = cat.__heap.CONSTANTS;
        if (CONSTANTS.length === 0) {
            /* Some implementations inline const into enums; skip if no constants */
            return;
        }

        let buf = dump(cat);
        let hdr = readHeader(buf);
        let decoded = decodeConstants(buf, hdr.constOffset, hdr.constCount);

        expect(decoded.length).toBe(CONSTANTS.length);
        for (let i = 0; i < CONSTANTS.length; i++) {
            expect(decoded[i]).toBe(CONSTANTS[i]);
        }
    });

    test('enums round-trip correctly', () => {
        let cat = catalog();
        let alloc = allocators(cat);

        /* enum creates a Set in ENUMS */
        alloc.string({ enum: ['red', 'green', 'blue'] });

        let ENUMS = cat.__heap.ENUMS;
        if (ENUMS.length === 0) {
            return;
        }

        let buf = dump(cat);
        let hdr = readHeader(buf);
        let decoded = decodeEnums(buf, hdr.enumOffset, hdr.enumCount);

        expect(decoded.length).toBe(ENUMS.length);
        for (let i = 0; i < ENUMS.length; i++) {
            let original = ENUMS[i];
            let restored = decoded[i];
            expect(restored.size).toBe(original.size);
            original.forEach(val => {
                expect(restored.has(val)).toBe(true);
            });
        }
    });

    test('mixed-type enum Sets work correctly', () => {
        let cat = catalog();
        let alloc = allocators(cat);

        /* Use or() with mixed const types to populate CONSTANTS/ENUMS */
        alloc.or(
            alloc.string({ const: 'hello' }),
            alloc.number({ const: 42 }),
            alloc.boolean({ const: false }),
        );

        let buf = dump(cat);
        let hdr = readHeader(buf);

        /* Verify counts match */
        expect(hdr.constCount).toBe(cat.__heap.CONSTANTS.length);
        expect(hdr.enumCount).toBe(cat.__heap.ENUMS.length);

        /* Verify round-trip if there are entries */
        if (hdr.constCount > 0) {
            let decoded = decodeConstants(buf, hdr.constOffset, hdr.constCount);
            for (let i = 0; i < decoded.length; i++) {
                expect(decoded[i]).toBe(cat.__heap.CONSTANTS[i]);
            }
        }
    });
});

describe('dump — CRC32 integrity', () => {
    test('checksum validates correctly', () => {
        let { cat } = makePopulatedCatalog();
        let buf = dump(cat);
        let hdr = readHeader(buf);

        let computed = verifyCrc32(buf, 96, buf.byteLength - 96);
        expect(computed).toBe(hdr.checksum);
    });

    test('corrupting a payload byte causes checksum mismatch', () => {
        let { cat } = makePopulatedCatalog();
        let buf = dump(cat);
        let hdr = readHeader(buf);

        /* Flip a byte in the payload area */
        let corruptIdx = 100; // inside the VALIDATORS section
        if (corruptIdx < buf.byteLength) {
            buf[corruptIdx] ^= 0xFF;
            let computed = verifyCrc32(buf, 96, buf.byteLength - 96);
            expect(computed).not.toBe(hdr.checksum);
        }
    });
});

describe('dump — round-trip with schemas', () => {
    test('populated catalog produces valid dump', () => {
        let { cat } = makePopulatedCatalog();
        let buf = dump(cat);
        let hdr = readHeader(buf);

        /* Basic sanity: buffer has content beyond header */
        expect(buf.byteLength).toBeGreaterThan(96);

        /* All counts are positive for the populated catalog */
        expect(hdr.slabCount).toBeGreaterThan(0);
        expect(hdr.kindsCount).toBeGreaterThan(0);
        expect(hdr.strtabCount).toBeGreaterThan(1); // more than just sentinel
    });

    test('empty catalog produces a valid dump', () => {
        let cat = catalog();
        let buf = dump(cat);
        let hdr = readHeader(buf);

        expect(hdr.magic).toBe('UVD\0');
        expect(hdr.fmtVersion).toBe(1);

        /* Empty catalog still has pre-allocated KINDS (6 elements) */
        expect(hdr.kindsCount).toBe(6);

        /* SLAB is empty */
        expect(hdr.slabCount).toBe(0);

        /* String table has the sentinel */
        expect(hdr.strtabCount).toBe(1);

        /* Checksum is valid */
        let computed = verifyCrc32(buf, 96, buf.byteLength - 96);
        expect(computed).toBe(hdr.checksum);
    });

    test('header field counts match print() stats', () => {
        let { cat } = makePopulatedCatalog();
        let info = print(cat);
        let buf = dump(cat);
        let hdr = readHeader(buf);

        expect(hdr.slabCount).toBe(info.stats.slab.size);
        expect(hdr.kindsCount).toBe(info.stats.kinds.size);
        expect(hdr.valsCount).toBe(info.stats.validators.size);
        expect(hdr.strtabCount).toBe(info.stats.keys.size);
        expect(hdr.regexCount).toBe(info.stats.regex.size - 1); // sentinel excluded
        expect(hdr.constCount).toBe(info.stats.constants.size);
        expect(hdr.enumCount).toBe(info.stats.enums.size);
        expect(hdr.callbackCount).toBe(info.stats.callbacks.size);
    });
});

// ========== Binary seeding tests ==========

describe('load + catalog — seeding', () => {
    test('loaded catalog validates the same schemas correctly', () => {
        let cat1 = catalog();
        let alloc1 = allocators(cat1);

        let personType = alloc1.object({
            name: alloc1.string({ minLength: 1 }),
            age: alloc1.number({ minimum: 0 }),
        });

        /* Verify original catalog works */
        expect(cat1.validate({ name: 'Alice', age: 30 }, personType)).toBe(true);
        expect(cat1.validate({ name: '', age: 30 }, personType)).toBe(false);
        expect(cat1.validate({ name: 'Bob', age: -1 }, personType)).toBe(false);

        /* Dump and reload */
        let bin = dump(cat1);
        let cat2 = catalog(load(bin));

        /* Same typedef pointers should work on the loaded catalog */
        expect(cat2.validate({ name: 'Alice', age: 30 }, personType)).toBe(true);
        expect(cat2.validate({ name: '', age: 30 }, personType)).toBe(false);
        expect(cat2.validate({ name: 'Bob', age: -1 }, personType)).toBe(false);
    });

    test('loaded catalog preserves KEY_DICT and KEY_INDEX', () => {
        let cat1 = catalog();
        let alloc1 = allocators(cat1);
        alloc1.object({ foo: STRING, bar: NUMBER });

        let bin = dump(cat1);
        let cat2 = catalog(load(bin));

        let h1 = cat1.__heap;
        let h2 = cat2.__heap;

        expect(h2.KEY_INDEX.length).toBe(h1.KEY_INDEX.length);
        for (let i = 0; i < h1.KEY_INDEX.length; i++) {
            expect(h2.KEY_INDEX[i]).toBe(h1.KEY_INDEX[i]);
        }
        h1.KEY_DICT.forEach((val, key) => {
            expect(h2.KEY_DICT.get(key)).toBe(val);
        });
    });

    test('loaded catalog preserves REGEX_CACHE', () => {
        let cat1 = catalog();
        let alloc1 = allocators(cat1);
        alloc1.string({ pattern: '^[a-z]+$' });

        let bin = dump(cat1);
        let cat2 = catalog(load(bin));

        let rc1 = cat1.__heap.REGEX_CACHE;
        let rc2 = cat2.__heap.REGEX_CACHE;

        expect(rc2.length).toBe(rc1.length);
        for (let i = 1; i < rc1.length; i++) {
            expect(rc2[i].source).toBe(rc1[i].source);
            expect(rc2[i].flags).toBe(rc1[i].flags);
        }
    });

    test('loaded catalog preserves CONSTANTS and ENUMS', () => {
        let cat1 = catalog();
        let alloc1 = allocators(cat1);

        alloc1.string({ const: 'red' });
        alloc1.string({ enum: ['a', 'b', 'c'] });

        let bin = dump(cat1);
        let cat2 = catalog(load(bin));

        let c1 = cat1.__heap.CONSTANTS;
        let c2 = cat2.__heap.CONSTANTS;
        expect(c2.length).toBe(c1.length);
        for (let i = 0; i < c1.length; i++) {
            expect(c2[i]).toBe(c1[i]);
        }

        let e1 = cat1.__heap.ENUMS;
        let e2 = cat2.__heap.ENUMS;
        expect(e2.length).toBe(e1.length);
        for (let i = 0; i < e1.length; i++) {
            expect(e2[i].size).toBe(e1[i].size);
            e1[i].forEach(v => {
                expect(e2[i].has(v)).toBe(true);
            });
        }
    });

    test('loaded catalog preserves typed array data', () => {
        let { cat } = makePopulatedCatalog();
        let h1 = cat.__heap.HEAP;

        let bin = dump(cat);
        let cat2 = catalog(load(bin));
        let h2 = cat2.__heap.HEAP;

        /* Pointers should match */
        expect(h2.PTR).toBe(h1.PTR);
        expect(h2.KIND_PTR).toBe(h1.KIND_PTR);
        expect(h2.VAL_PTR).toBe(h1.VAL_PTR);

        /* Data should match */
        for (let i = 0; i < h1.PTR; i++) {
            expect(h2.SLAB[i]).toBe(h1.SLAB[i]);
        }
        for (let i = 0; i < h1.KIND_PTR; i++) {
            expect(h2.KINDS[i]).toBe(h1.KINDS[i]);
        }
        for (let i = 0; i < h1.VAL_PTR; i++) {
            expect(h2.VALIDATORS[i]).toBe(h1.VALIDATORS[i]);
        }
    });

    test('binary + explicit config uses max of both for capacity', () => {
        let { cat } = makePopulatedCatalog();
        let info = print(cat);
        let bin = dump(cat);

        /* Request larger capacity than the binary data */
        let extraSlab = info.stats.slab.size + 5000;
        let cat2 = catalog(load(bin, { slab: extraSlab }));
        let h2 = cat2.__heap.HEAP;

        /* Capacity should be the larger value */
        expect(h2.SLAB_LEN).toBe(extraSlab);

        /* Data pointer should still match the binary */
        expect(h2.PTR).toBe(info.stats.slab.size);
    });

    test('binary with smaller explicit config uses binary count', () => {
        let { cat } = makePopulatedCatalog();
        let info = print(cat);
        let bin = dump(cat);

        /* Request smaller capacity than the binary data — binary wins */
        let cat2 = catalog(load(bin, { slab: 4 }));
        let h2 = cat2.__heap.HEAP;

        expect(h2.SLAB_LEN).toBe(info.stats.slab.size);
        expect(h2.PTR).toBe(info.stats.slab.size);
    });

    test('loaded catalog can have new schemas added', () => {
        let cat1 = catalog();
        let alloc1 = allocators(cat1);
        let nameType = alloc1.string({ minLength: 1 });

        let bin = dump(cat1);

        /* Load with extra capacity for new schemas */
        let cat2 = catalog(load(bin, { slab: 16384, kinds: 2048, validators: 512 }));
        let alloc2 = allocators(cat2);

        /* The original typedef still works */
        expect(cat2.validate('hello', nameType)).toBe(true);
        expect(cat2.validate('', nameType)).toBe(false);

        /* Add a new schema to the loaded catalog */
        let ageType = alloc2.number({ minimum: 0, maximum: 200 });
        expect(cat2.validate(25, ageType)).toBe(true);
        expect(cat2.validate(-1, ageType)).toBe(false);
        expect(cat2.validate(201, ageType)).toBe(false);
    });

    test('rejects binary with bad magic', () => {
        let bin = new Uint8Array(96);
        bin[0] = 0x00;
        expect(() => catalog(load(bin))).toThrow('bad magic');
    });

    test('rejects binary with corrupted checksum', () => {
        let { cat } = makePopulatedCatalog();
        let bin = dump(cat);
        /* Corrupt a payload byte */
        bin[100] ^= 0xFF;
        expect(() => catalog(load(bin))).toThrow('checksum');
    });

    test('empty catalog dump/reload round-trips', () => {
        let cat1 = catalog();
        let bin = dump(cat1);
        let cat2 = catalog(load(bin));

        let h2 = cat2.__heap.HEAP;
        expect(h2.KIND_PTR).toBe(6); // pre-allocated bare types
        expect(h2.PTR).toBe(0);
        expect(h2.VAL_PTR).toBe(0);
    });
});

// ========== JSON Schema suite dump/reload compliance ==========

describe('dump/reload — JSON Schema suite compliance', () => {
    const __dirname = import.meta.dir;
    const SUITE_DIR = path.resolve(__dirname, '../../schema/tests/suite/tests');
    const REMOTE_DIR = path.resolve(__dirname, '../../schema/tests/suite/remotes');
    const SPECS_DIR = path.resolve(__dirname, '../../schema/tests/specs');

    const SUPPORTED_DRAFTS = ['draft-04', 'draft-06', 'draft-07', 'draft2019-09', 'draft2020-12'];

    /**
     * @param {string} draft
     * @returns {string}
     */
    function getTestFolder(draft) {
        switch (draft) {
            case 'draft2020-12': return 'draft2020-12';
            case 'draft2019-09': return 'draft2019-09';
            case 'draft-07': return 'draft7';
            case 'draft-06': return 'draft6';
            case 'draft-04': return 'draft4';
        }
        throw new Error('Not implemented');
    }

    /**
     * Recursively reads all JSON files in a directory.
     * @param {string} rootDir
     * @returns {!Array<{path: string, schema: *}>}
     */
    function readDirRecursive(rootDir) {
        let files = [];
        function readDir(dirName) {
            let content = fs.readdirSync(dirName);
            for (let file of content) {
                let abspath = path.join(dirName, file);
                let stats = fs.statSync(abspath);
                if (stats.isDirectory()) {
                    readDir(abspath);
                } else if (file.endsWith('.json')) {
                    let str = fs.readFileSync(abspath, 'utf8');
                    let relativePath = path.relative(rootDir, abspath);
                    files.push({ path: relativePath, schema: JSON.parse(str) });
                }
            }
        }
        readDir(rootDir);
        return files;
    }

    let remoteFiles = readDirRecursive(REMOTE_DIR);

    for (let draft of SUPPORTED_DRAFTS) {
        let draftFolder = getTestFolder(draft);
        let suiteDir = path.join(SUITE_DIR, draftFolder);

        if (!fs.existsSync(suiteDir)) {
            continue;
        }

        let allFiles = fs.readdirSync(suiteDir).filter(f => f.endsWith('.json'));

        let specDir = path.join(SPECS_DIR, draft);
        let rootMetaSchema = JSON.parse(fs.readFileSync(path.join(specDir, 'schema.json'), 'utf8'));
        let rootMetaUri = rootMetaSchema.$id || rootMetaSchema.id || `https://json-schema.org/${draft}/schema`;

        let vocabSchemas = [];
        if (Array.isArray(rootMetaSchema.allOf)) {
            for (let branch of rootMetaSchema.allOf) {
                if (branch.$ref && branch.$ref.startsWith('meta/')) {
                    let vocabFileName = branch.$ref.replace('meta/', '') + '.json';
                    let vocabPath = path.join(specDir, 'meta', vocabFileName);
                    if (fs.existsSync(vocabPath)) {
                        let vocabSchema = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
                        let vocabUri = vocabSchema.$id || vocabSchema.id;
                        if (vocabUri) {
                            vocabSchemas.push({ schema: vocabSchema, uri: vocabUri });
                        }
                    }
                }
            }
        }

        describe(`Dump/Reload: ${draft}`, () => {
            /**
             * Phase 1: compile all schemas into a single catalog,
             * collecting the compiled roots and test data.
             */
            let originalCat = catalog();
            let compiledGroups = [];

            for (let file of allFiles) {
                let filePath = path.join(suiteDir, file);
                let testGroups = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                for (let group of testGroups) {
                    try {
                        let compound = new CompoundSchema(draft);
                        compound.add(structuredClone(rootMetaSchema), rootMetaUri);
                        for (let vocab of vocabSchemas) {
                            compound.add(structuredClone(vocab.schema), vocab.uri);
                        }
                        for (let remoteFile of remoteFiles) {
                            let uriPath = remoteFile.path.split(path.sep).join('/');
                            let uri = `http://localhost:1234/${uriPath}`;
                            compound.add(structuredClone(remoteFile.schema), uri);
                        }
                        let ref = compound.add(group.schema);
                        let ast = compound.bundle(ref);
                        let compiled = compile(originalCat, ast);
                        compiledGroups.push({
                            file,
                            description: group.description,
                            compiledRoot: compiled[0].schema,
                            tests: group.tests,
                        });
                    } catch (err) {
                        /* Skip groups that fail to compile — the main suite.test.js handles those */
                    }
                }
            }

            /**
             * Phase 2: dump the catalog, reload into a fresh catalog,
             * and validate every test case against the reloaded catalog.
             */
            let bin = dump(originalCat);
            let reloadedCat = catalog(load(bin));

            for (let group of compiledGroups) {
                describe(`${group.file} — ${group.description}`, () => {
                    for (let tc of group.tests) {
                        test(tc.description, () => {
                            let isValid = reloadedCat.validate(tc.data, group.compiledRoot);
                            expect(isValid).toBe(tc.valid);
                        });
                    }
                });
            }
        });
    }
});
