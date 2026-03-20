/// <reference path="../global.d.ts" />
import { U16 } from "./const.js";
import { assertIsNumber, ERR_CONFIG_FIELD_MUST_BE_NUMBER } from "./error.js";

const DEFAULT_T = { slab: 16384, objects: 4096, arrays: 256, unions: 128, tuples: 128, matches: 256, kinds: 2048, validators: 512 };
const DEFAULT_V = { slab: 1024, objects: 256, arrays: 64, unions: 32, tuples: 32, matches: 64, kinds: 512, validators: 128 };
/**
 * @type {readonly (keyof uvd.cat.HeapConfig)[]}
 */
const CONFIG_KEYS = ['slab', 'objects', 'arrays', 'unions', 'tuples', 'matches', 'kinds', 'validators'];

/**
 * @param {uvd.cat.Config=} cfg
 * @returns {uvd.cat.Config}
 */
function config(cfg) {
    /** @type {uvd.cat.HeapConfig} */
    let t = { slab: DEFAULT_T.slab, objects: DEFAULT_T.objects, arrays: DEFAULT_T.arrays, unions: DEFAULT_T.unions, tuples: DEFAULT_T.tuples, matches: DEFAULT_T.matches, kinds: DEFAULT_T.kinds, validators: DEFAULT_T.validators };
    let v = { slab: DEFAULT_V.slab, objects: DEFAULT_V.objects, arrays: DEFAULT_V.arrays, unions: DEFAULT_V.unions, tuples: DEFAULT_V.tuples, matches: DEFAULT_V.matches, kinds: DEFAULT_V.kinds, validators: DEFAULT_V.validators };
    if (cfg) {
        const cfg_t = cfg.t;
        if (cfg_t) {
            for (let i = 0; i < CONFIG_KEYS.length; i++) {
                let key = CONFIG_KEYS[i];
                const val = cfg_t[key];
                assertIsNumber(val, 0);
                t[key] = val;
            }
        }
        const cfg_v = cfg.v;
        if (cfg_v) {
            for (let i = 0; i < CONFIG_KEYS.length; i++) {
                let key = CONFIG_KEYS[i];
                const val = cfg_v[key];
                assertIsNumber(val, ERR_CONFIG_FIELD_MUST_BE_NUMBER);
                v[key] = val;
            }
        }
    }
    return { t, v };
}

/**
 * 
 * @param {uvd.cat.HeapConfig} cfg 
 * @returns {uvd.cat.Heap}
 */
function malloc(cfg) {
    return {
        PTR: 0,
        SLAB_LEN: cfg.slab,
        OBJ_LEN: cfg.objects,
        OBJ_TYPE: U16,
        OBJ_COUNT: 0,
        ARR_LEN: cfg.arrays,
        ARR_COUNT: 0,
        UNION_LEN: cfg.unions,
        UNION_COUNT: 0,
        TUP_LEN: cfg.tuples,
        TUP_TYPE: U16,
        TUP_COUNT: 0,
        MAT_LEN: cfg.matches,
        MAT_TYPE: U16,
        MAT_COUNT: 0,
        KIND_LEN: cfg.kinds,
        KIND_PTR: 0,
        VAL_LEN: cfg.validators,
        VAL_PTR: 0,
        SLAB: new Uint32Array(cfg.slab),
        OBJECTS: new Uint16Array(cfg.objects),
        ARRAYS: new Uint32Array(cfg.arrays),
        UNIONS: new Uint32Array(cfg.unions),
        TUPLES: new Uint16Array(cfg.tuples),
        MATCHES: new Uint16Array(cfg.matches),
        KINDS: new Uint32Array(cfg.kinds),
        VALIDATORS: new Float64Array(cfg.validators),
        REGEX_CACHE: [],
        CALLBACKS: [],
    };
}

export { config, malloc }