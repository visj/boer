/// <reference path="../../global.d.ts" />
import { assertIsNumber, ERR_CONFIG_FIELD_MUST_BE_NUMBER } from "./error.js";

const DEFAULT_HEAP = { slab: 16384, objects: 4096, arrays: 256, unions: 128, tuples: 128, matches: 256, kinds: 2048, validators: 512 };
const DEFAULT_SCRATCH = { slab: 1024, objects: 256, arrays: 64, unions: 32, tuples: 32, matches: 64, kinds: 512, validators: 128 };
/**
 * @type {readonly (keyof uvd.HeapConfig)[]}
 */
const CONFIG_KEYS = ['slab', 'objects', 'arrays', 'unions', 'tuples', 'matches', 'kinds', 'validators'];

/**
 * @param {uvd.Config=} cfg
 * @returns {uvd.Config}
 */
function config(cfg) {
    /** @type {uvd.HeapConfig} */
    let heap = { slab: DEFAULT_HEAP.slab, objects: DEFAULT_HEAP.objects, arrays: DEFAULT_HEAP.arrays, unions: DEFAULT_HEAP.unions, tuples: DEFAULT_HEAP.tuples, matches: DEFAULT_HEAP.matches, kinds: DEFAULT_HEAP.kinds, validators: DEFAULT_HEAP.validators };
    let scratch = { slab: DEFAULT_SCRATCH.slab, objects: DEFAULT_SCRATCH.objects, arrays: DEFAULT_SCRATCH.arrays, unions: DEFAULT_SCRATCH.unions, tuples: DEFAULT_SCRATCH.tuples, matches: DEFAULT_SCRATCH.matches, kinds: DEFAULT_SCRATCH.kinds, validators: DEFAULT_SCRATCH.validators };
    if (cfg) {
        const cfgHeap = cfg.heap;
        if (cfgHeap) {
            for (let i = 0; i < CONFIG_KEYS.length; i++) {
                let key = CONFIG_KEYS[i];
                const val = cfgHeap[key];
                assertIsNumber(val, 0);
                heap[key] = val;
            }
        }
        const cfgScratch = cfg.scratch;
        if (cfgScratch) {
            for (let i = 0; i < CONFIG_KEYS.length; i++) {
                let key = CONFIG_KEYS[i];
                const val = cfgScratch[key];
                assertIsNumber(val, ERR_CONFIG_FIELD_MUST_BE_NUMBER);
                scratch[key] = val;
            }
        }
    }
    return { heap, scratch };
}

/**
 * 
 * @param {uvd.HeapConfig} cfg 
 * @returns {uvd.Heap}
 */
function heap(cfg) {
    return {
        PTR: 0,
        SLAB_LEN: cfg.slab,
        OBJ_LEN: cfg.objects,
        OBJ_COUNT: 0,
        ARR_LEN: cfg.arrays,
        ARR_COUNT: 0,
        UNION_LEN: cfg.unions,
        UNION_COUNT: 0,
        TUP_LEN: cfg.tuples,
        TUP_COUNT: 0,
        MAT_LEN: cfg.matches,
        MAT_COUNT: 0,
        KIND_LEN: cfg.kinds,
        KIND_PTR: 0,
        VAL_LEN: cfg.validators,
        VAL_PTR: 0,
        SLAB: new Uint32Array(cfg.slab),
        OBJECTS: new Uint32Array(cfg.objects),
        ARRAYS: new Uint32Array(cfg.arrays),
        UNIONS: new Uint32Array(cfg.unions),
        TUPLES: new Uint32Array(cfg.tuples),
        MATCHES: new Uint32Array(cfg.matches),
        KINDS: new Uint32Array(cfg.kinds),
        VALIDATORS: new Float64Array(cfg.validators),
        REGEX_CACHE: [],
        CALLBACKS: [],
    };
}

export { config, heap }