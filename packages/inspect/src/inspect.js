/** CRC32 lookup table (IEEE 802.3, reflected polynomial 0xEDB88320) */
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
        if (c & 1) {
            c = 0xEDB88320 ^ (c >>> 1);
        } else {
            c = c >>> 1;
        }
    }
    CRC_TABLE[i] = c;
}

/**
 * Compute CRC32 over a region of a Uint8Array.
 * @param {!Uint8Array} buf
 * @param {number} offset
 * @param {number} length
 * @returns {number}
 */
function crc32(buf, offset, length) {
    let crc = 0xFFFFFFFF;
    let end = offset + length;
    for (let i = offset; i < end; i++) {
        crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

/** Hardcoded library version — must be updated with package.json */
const LIB_MAJOR = 0;
const LIB_MINOR = 2;
const LIB_PATCH = 0;

/** Binary format version */
const FMT_VERSION = 1;

/** Header size in bytes */
const HEADER_SIZE = 96;

/** Tagged value type tags for constants/enums serialization */
const TAG_NULL = 0;
const TAG_BOOL = 1;
const TAG_NUMBER = 2;
const TAG_STRING = 3;
const TAG_UNDEFINED = 4;

/** Regex flag bits */
const FLAG_G = 1;
const FLAG_I = 2;
const FLAG_M = 4;
const FLAG_S = 8;
const FLAG_U = 16;
const FLAG_Y = 32;
const FLAG_V = 64;
const FLAG_D = 128;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Decode a regex flag byte back into a flags string.
 * @param {number} bits
 * @returns {string}
 */
function decodeRegexFlags(bits) {
    let flags = '';
    if (bits & FLAG_G) { flags += 'g'; }
    if (bits & FLAG_I) { flags += 'i'; }
    if (bits & FLAG_M) { flags += 'm'; }
    if (bits & FLAG_S) { flags += 's'; }
    if (bits & FLAG_U) { flags += 'u'; }
    if (bits & FLAG_Y) { flags += 'y'; }
    if (bits & FLAG_V) { flags += 'v'; }
    if (bits & FLAG_D) { flags += 'd'; }
    return flags;
}

/**
 * Read a tagged value from the binary at the given offset.
 * Returns [value, newOffset].
 * @param {!Uint8Array} buf
 * @param {!DataView} view
 * @param {number} off
 * @returns {[*, number]}
 */
function readTaggedValue(buf, view, off) {
    let tag = buf[off];
    off += 1;
    if (tag === TAG_NULL) {
        return [null, off];
    }
    if (tag === TAG_UNDEFINED) {
        return [void 0, off];
    }
    if (tag === TAG_BOOL) {
        return [buf[off] === 1, off + 1];
    }
    if (tag === TAG_NUMBER) {
        return [view.getFloat64(off, true), off + 8];
    }
    if (tag === TAG_STRING) {
        let len = view.getUint32(off, true);
        off += 4;
        let str = decoder.decode(buf.subarray(off, off + len));
        return [str, off + len];
    }
    return [void 0, off];
}

/**
 * Parse a binary dump and return a fully initialized seed object
 * that can be passed directly to `catalog()`. The optional config
 * allows reserving extra capacity beyond what the binary contains,
 * so users can seed from binary but still add schemas dynamically.
 *
 * When both binary data and config values are present, the larger
 * of the two is used for each typed array capacity.
 *
 * @param {!Uint8Array} bin
 * @param {uvd.Config=} cfg
 * @returns {Object} A seed object accepted by catalog()
 */
function load(bin, cfg) {
    /* Validate magic bytes */
    if (bin.length < HEADER_SIZE ||
        bin[0] !== 0x55 || bin[1] !== 0x56 || bin[2] !== 0x44 || bin[3] !== 0x00) {
        throw new Error('Invalid UVD binary: bad magic bytes');
    }

    let view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);

    /* Verify checksum */
    let storedChecksum = view.getUint32(16, true);
    let computedChecksum = crc32(bin, HEADER_SIZE, bin.byteLength - HEADER_SIZE);
    if (storedChecksum !== computedChecksum) {
        throw new Error('Invalid UVD binary: checksum mismatch');
    }

    /* Read header fields */
    let slabOffset = view.getUint32(20, true);
    let slabCount = view.getUint32(24, true);
    let kindsOffset = view.getUint32(32, true);
    let kindsCount = view.getUint32(36, true);
    let valsOffset = view.getUint32(44, true);
    let valsCount = view.getUint32(48, true);
    let strtabOffset = view.getUint32(56, true);
    let strtabCount = view.getUint32(60, true);
    let regexOffset = view.getUint32(64, true);
    let regexCount = view.getUint32(68, true);
    let constOffset = view.getUint32(72, true);
    let constCount = view.getUint32(76, true);
    let enumOffset = view.getUint32(80, true);
    let enumCount = view.getUint32(84, true);
    let callbackCount = view.getUint32(88, true);

    /**
     * Compute final capacities: max of binary data count and config value.
     * This lets users reserve extra room for dynamically added schemas.
     */
    let c = cfg !== void 0 ? cfg : null;
    let cfgSlab = (c !== null && c.slab !== void 0) ? c.slab : 0;
    let cfgKinds = (c !== null && c.kinds !== void 0) ? c.kinds : 0;
    let cfgVals = (c !== null && c.validators !== void 0) ? c.validators : 0;

    let slabLen = cfgSlab > slabCount ? cfgSlab : slabCount;
    let kindsLen = cfgKinds > kindsCount ? cfgKinds : kindsCount;
    let valsLen = cfgVals > valsCount ? cfgVals : valsCount;

    /* Allocate typed arrays at final capacity and fill from binary */
    let SLAB = new Uint32Array(slabLen);
    if (slabCount > 0) {
        SLAB.set(new Uint32Array(bin.buffer, bin.byteOffset + slabOffset, slabCount));
    }

    let KINDS = new Uint32Array(kindsLen);
    if (kindsCount > 0) {
        KINDS.set(new Uint32Array(bin.buffer, bin.byteOffset + kindsOffset, kindsCount));
    }

    let VALIDATORS = new Float64Array(valsLen);
    if (valsCount > 0) {
        VALIDATORS.set(new Float64Array(bin.buffer, bin.byteOffset + valsOffset, valsCount));
    }

    /* Build KEY_INDEX and KEY_DICT from string table */
    /** @type {!Array<string>} */
    let KEY_INDEX = new Array(strtabCount);
    /** @type {!Map<string,number>} */
    let KEY_DICT = new Map();
    let off = strtabOffset;
    for (let i = 0; i < strtabCount; i++) {
        let len = view.getUint32(off, true);
        off += 4;
        let key = decoder.decode(bin.subarray(off, off + len));
        KEY_INDEX[i] = key;
        if (i > 0) {
            KEY_DICT.set(key, i);
        }
        off += len;
    }

    /* Build REGEX_CACHE with sentinel at index 0 */
    /** @type {!Array<RegExp>} */
    let REGEX_CACHE = [/(?:)/];
    off = regexOffset;
    for (let i = 0; i < regexCount; i++) {
        let len = view.getUint32(off, true);
        off += 4;
        let source = decoder.decode(bin.subarray(off, off + len));
        off += len;
        let flagByte = bin[off];
        off += 1;
        REGEX_CACHE[i + 1] = new RegExp(source, decodeRegexFlags(flagByte));
    }

    /* Decode constants */
    /** @type {!Array<*>} */
    let CONSTANTS = new Array(constCount);
    off = constOffset;
    for (let i = 0; i < constCount; i++) {
        let pair = readTaggedValue(bin, view, off);
        CONSTANTS[i] = pair[0];
        off = pair[1];
    }

    /* Decode enums */
    /** @type {!Array<!Set<*>>} */
    let ENUMS = new Array(enumCount);
    off = enumOffset;
    for (let i = 0; i < enumCount; i++) {
        let size = view.getUint32(off, true);
        off += 4;
        let set = new Set();
        for (let j = 0; j < size; j++) {
            let pair = readTaggedValue(bin, view, off);
            set.add(pair[0]);
            off = pair[1];
        }
        ENUMS[i] = set;
    }

    /**
     * Return a seed object that catalog() accepts directly.
     * The HEAP property signals to catalog that this is a pre-built seed.
     */
    return {
        HEAP: {
            PTR: slabCount,
            SLAB_LEN: slabLen,
            KIND_LEN: kindsLen,
            KIND_PTR: kindsCount,
            VAL_LEN: valsLen,
            VAL_PTR: valsCount,
            SLAB, KINDS, VALIDATORS,
        },
        KEY_INDEX, KEY_DICT,
        keyseq: strtabCount,
        REGEX_CACHE,
        CONSTANTS, ENUMS,
        callbackCount,
    };
}

/**
 * Inspect a catalog and return allocation statistics and an optimized config.
 * The optimized config contains exact sizes needed to hold the current schemas
 * without wasting any memory.
 * @param {uvd.Catalog<any>} cat
 * @returns {{ stats: Object, config: Object }}
 */
function print(cat) {
    let h = cat.__heap;
    let HEAP = h.HEAP;
    return {
        stats: {
            slab:       { size: HEAP.PTR,       capacity: HEAP.SLAB_LEN },
            kinds:      { size: HEAP.KIND_PTR,   capacity: HEAP.KIND_LEN },
            validators: { size: HEAP.VAL_PTR,    capacity: HEAP.VAL_LEN },
            keys:       { size: h.KEY_INDEX.length },
            regex:      { size: h.REGEX_CACHE.length },
            callbacks:  { size: h.CALLBACKS.length },
            constants:  { size: h.CONSTANTS.length },
            enums:      { size: h.ENUMS.length },
        },
        config: {
            slab:       HEAP.PTR,
            kinds:      HEAP.KIND_PTR,
            validators: HEAP.VAL_PTR,
        }
    };
}

/**
 * Encode a regex flags string into a single byte bitfield.
 * @param {string} flags
 * @returns {number}
 */
function encodeRegexFlags(flags) {
    let bits = 0;
    for (let i = 0; i < flags.length; i++) {
        let ch = flags.charCodeAt(i);
        if (ch === 103) {
            bits |= FLAG_G;
        } else if (ch === 105) {
            bits |= FLAG_I;
        } else if (ch === 109) {
            bits |= FLAG_M;
        } else if (ch === 115) {
            bits |= FLAG_S;
        } else if (ch === 117) {
            bits |= FLAG_U;
        } else if (ch === 121) {
            bits |= FLAG_Y;
        } else if (ch === 118) {
            bits |= FLAG_V;
        } else if (ch === 100) {
            bits |= FLAG_D;
        }
    }
    return bits;
}

/**
 * Compute the serialized byte size of a tagged value (used for constants and enum entries).
 * Format: [u8 tag][payload].
 * @param {*} val
 * @returns {number}
 */
function taggedValueSize(val) {
    if (val === null) {
        return 1;
    }
    if (val === void 0) {
        return 1;
    }
    let t = typeof val;
    if (t === 'boolean') {
        return 2; // tag + u8
    }
    if (t === 'number') {
        return 9; // tag + f64
    }
    if (t === 'string') {
        return 1 + 4 + encoder.encode(val).byteLength; // tag + u32 len + utf8
    }
    return 1; // fallback: treat as undefined
}

/**
 * Write a tagged value into buf at the given offset. Returns new offset.
 * @param {!DataView} view
 * @param {!Uint8Array} buf
 * @param {number} off
 * @param {*} val
 * @returns {number}
 */
function writeTaggedValue(view, buf, off, val) {
    if (val === null) {
        buf[off] = TAG_NULL;
        return off + 1;
    }
    if (val === void 0) {
        buf[off] = TAG_UNDEFINED;
        return off + 1;
    }
    let t = typeof val;
    if (t === 'boolean') {
        buf[off] = TAG_BOOL;
        buf[off + 1] = val ? 1 : 0;
        return off + 2;
    }
    if (t === 'number') {
        buf[off] = TAG_NUMBER;
        view.setFloat64(off + 1, val, true);
        return off + 9;
    }
    if (t === 'string') {
        buf[off] = TAG_STRING;
        let encoded = encoder.encode(val);
        view.setUint32(off + 1, encoded.byteLength, true);
        buf.set(encoded, off + 5);
        return off + 5 + encoded.byteLength;
    }
    buf[off] = TAG_UNDEFINED;
    return off + 1;
}

/**
 * Serialize the catalog's internal state into a compact binary format.
 * The binary can be loaded later to reconstruct the catalog without
 * re-parsing any schemas.
 *
 * Layout: 96-byte header, then data sections in descending alignment order:
 * Float64 (VALIDATORS), Uint32 (SLAB, KINDS), then variable-length blobs
 * (string table, regex, constants, enums).
 *
 * @param {uvd.Catalog<any>} cat
 * @returns {!Uint8Array}
 */
function dump(cat) {
    let h = cat.__heap;
    let HEAP = h.HEAP;
    let KEY_INDEX = h.KEY_INDEX;
    let REGEX_CACHE = h.REGEX_CACHE;
    let CONSTANTS = h.CONSTANTS;
    let ENUMS = h.ENUMS;
    let CALLBACKS = h.CALLBACKS;

    let slabCount = HEAP.PTR;
    let kindsCount = HEAP.KIND_PTR;
    let valCount = HEAP.VAL_PTR;

    // --- Pre-encode variable-length sections to compute sizes ---

    /**
     * String table: encode all KEY_INDEX entries as length-prefixed UTF-8.
     * We keep index 0 (empty sentinel) so that keyId indices stay consistent.
     */
    let strtabEncodedStrings = new Array(KEY_INDEX.length);
    let strtabBytes = 0;
    for (let i = 0; i < KEY_INDEX.length; i++) {
        let enc = encoder.encode(KEY_INDEX[i]);
        strtabEncodedStrings[i] = enc;
        strtabBytes += 4 + enc.byteLength; // u32 length prefix + data
    }

    /**
     * Regex table: encode REGEX_CACHE entries starting at index 1
     * (index 0 is the /(?:)/ sentinel, skipped).
     * Format per entry: [u32 patternByteLength][UTF-8 pattern][u8 flags]
     */
    let regexCount = REGEX_CACHE.length - 1;
    let regexEncodedPatterns = new Array(regexCount);
    let regexFlagBytes = new Uint8Array(regexCount);
    let regexBytes = 0;
    for (let i = 0; i < regexCount; i++) {
        let rx = REGEX_CACHE[i + 1];
        let enc = encoder.encode(rx.source);
        regexEncodedPatterns[i] = enc;
        regexFlagBytes[i] = encodeRegexFlags(rx.flags);
        regexBytes += 4 + enc.byteLength + 1; // u32 len + pattern + u8 flags
    }

    /**
     * Constants: tagged format [u8 tag][payload]
     */
    let constantsBytes = 0;
    for (let i = 0; i < CONSTANTS.length; i++) {
        constantsBytes += taggedValueSize(CONSTANTS[i]);
    }

    /**
     * Enums: each Set serialized as [u32 setSize][...tagged values]
     */
    let enumsBytes = 0;
    for (let i = 0; i < ENUMS.length; i++) {
        enumsBytes += 4; // u32 set size
        ENUMS[i].forEach(function (/** @type {*} */ val) {
            enumsBytes += taggedValueSize(val);
        });
    }

    // --- Compute section offsets in descending alignment order ---
    let valsOffset = HEADER_SIZE;                              // 96, 8-byte aligned
    let slabOffset = valsOffset + valCount * 8;
    let kindsOffset = slabOffset + slabCount * 4;
    let strtabOffset = kindsOffset + kindsCount * 4;
    let regexOffset = strtabOffset + strtabBytes;
    let constOffset = regexOffset + regexBytes;
    let enumOffset = constOffset + constantsBytes;
    let totalSize = enumOffset + enumsBytes;

    // --- Allocate output buffer and create views ---
    let out = new Uint8Array(totalSize);
    let view = new DataView(out.buffer);

    // --- Write header (96 bytes, all little-endian) ---

    /* [0] Magic "UVD\0" */
    out[0] = 0x55; // U
    out[1] = 0x56; // V
    out[2] = 0x44; // D
    out[3] = 0x00; // \0

    /* [4] Format version */
    view.setUint16(4, FMT_VERSION, true);

    /* [6-11] Library version */
    view.setUint16(6, LIB_MAJOR, true);
    view.setUint16(8, LIB_MINOR, true);
    view.setUint16(10, LIB_PATCH, true);

    /* [12] Flags */
    view.setUint32(12, 0, true);

    /* [16] Checksum — written last */

    /* [20-31] SLAB section descriptor */
    view.setUint32(20, slabOffset, true);
    view.setUint32(24, slabCount, true);
    out[28] = 4; // slab_width: 4 bytes per element (Uint32)

    /* [32-43] KINDS section descriptor */
    view.setUint32(32, kindsOffset, true);
    view.setUint32(36, kindsCount, true);
    out[40] = 4; // kinds_width: 4 bytes per element (Uint32)

    /* [44-55] VALIDATORS section descriptor */
    view.setUint32(44, valsOffset, true);
    view.setUint32(48, valCount, true);
    out[52] = 8; // vals_width: 8 bytes per element (Float64)

    /* [56-63] String table descriptor */
    view.setUint32(56, strtabOffset, true);
    view.setUint32(60, KEY_INDEX.length, true);

    /* [64-71] Regex descriptor */
    view.setUint32(64, regexOffset, true);
    view.setUint32(68, regexCount, true);

    /* [72-79] Constants descriptor */
    view.setUint32(72, constOffset, true);
    view.setUint32(76, CONSTANTS.length, true);

    /* [80-87] Enums descriptor */
    view.setUint32(80, enumOffset, true);
    view.setUint32(84, ENUMS.length, true);

    /* [88] Callback count (verification only, not serialized) */
    view.setUint32(88, CALLBACKS.length, true);

    /* [92] Padding to align header to 96 bytes — already zero */

    // --- Write typed array sections ---

    /* VALIDATORS (Float64Array) at valsOffset, 8-byte aligned */
    if (valCount > 0) {
        new Float64Array(out.buffer, valsOffset, valCount).set(
            HEAP.VALIDATORS.subarray(0, valCount)
        );
    }

    /* SLAB (Uint32Array) at slabOffset */
    if (slabCount > 0) {
        new Uint32Array(out.buffer, slabOffset, slabCount).set(
            HEAP.SLAB.subarray(0, slabCount)
        );
    }

    /* KINDS (Uint32Array) at kindsOffset */
    if (kindsCount > 0) {
        new Uint32Array(out.buffer, kindsOffset, kindsCount).set(
            HEAP.KINDS.subarray(0, kindsCount)
        );
    }

    // --- Write string table ---
    let off = strtabOffset;
    for (let i = 0; i < strtabEncodedStrings.length; i++) {
        let enc = strtabEncodedStrings[i];
        view.setUint32(off, enc.byteLength, true);
        off += 4;
        out.set(enc, off);
        off += enc.byteLength;
    }

    // --- Write regex table ---
    for (let i = 0; i < regexCount; i++) {
        let enc = regexEncodedPatterns[i];
        view.setUint32(off, enc.byteLength, true);
        off += 4;
        out.set(enc, off);
        off += enc.byteLength;
        out[off] = regexFlagBytes[i];
        off += 1;
    }

    // --- Write constants ---
    for (let i = 0; i < CONSTANTS.length; i++) {
        off = writeTaggedValue(view, out, off, CONSTANTS[i]);
    }

    // --- Write enums ---
    for (let i = 0; i < ENUMS.length; i++) {
        let s = ENUMS[i];
        view.setUint32(off, s.size, true);
        off += 4;
        s.forEach(function (/** @type {*} */ val) {
            off = writeTaggedValue(view, out, off, val);
        });
    }

    // --- Compute and write CRC32 checksum over payload (everything after header) ---
    let checksum = crc32(out, HEADER_SIZE, totalSize - HEADER_SIZE);
    view.setUint32(16, checksum, true);

    return out;
}

export { print, dump, load, crc32 };
