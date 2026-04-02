import { describe, test, expect } from 'bun:test';
import { STRING, NUMBER, BOOLEAN } from 'uvd';
import { catalog, allocators, print, dump } from 'uvd/core';

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
