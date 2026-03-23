/// <reference path="../../global.d.ts" />
import { assertIsNumber, ERR_CONFIG_FIELD_MUST_BE_NUMBER } from "./error.js";

const DEFAULT_HEAP = { slab: 16384, shapes: 4096, kinds: 2048, validators: 512 };
const DEFAULT_SCRATCH = { slab: 1024, shapes: 256, kinds: 512, validators: 128 };
/**
 * @type {readonly (keyof uvd.HeapConfig)[]}
 */
const CONFIG_KEYS = ['slab', 'shapes', 'kinds', 'validators'];

/**
 * @param {uvd.Config=} cfg
 * @returns {uvd.Config}
 */
function config(cfg) {
    /** @type {uvd.HeapConfig} */
    let heap = { slab: DEFAULT_HEAP.slab, shapes: DEFAULT_HEAP.shapes, kinds: DEFAULT_HEAP.kinds, validators: DEFAULT_HEAP.validators };
    let scratch = { slab: DEFAULT_SCRATCH.slab, shapes: DEFAULT_SCRATCH.shapes, kinds: DEFAULT_SCRATCH.kinds, validators: DEFAULT_SCRATCH.validators };
    if (cfg) {
        const cfgHeap = cfg.heap;
        if (cfgHeap) {
            for (let i = 0; i < CONFIG_KEYS.length; i++) {
                let key = CONFIG_KEYS[i];
                const val = cfgHeap[key];
                assertIsNumber(val, ERR_CONFIG_FIELD_MUST_BE_NUMBER);
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
        SHAPE_LEN: cfg.shapes,
        SHAPE_COUNT: 0,
        KIND_LEN: cfg.kinds,
        KIND_PTR: 0,
        VAL_LEN: cfg.validators,
        VAL_PTR: 0,
        SLAB: new Uint32Array(cfg.slab),
        SHAPES: new Uint32Array(cfg.shapes),
        KINDS: new Uint32Array(cfg.kinds),
        VALIDATORS: new Float64Array(cfg.validators),
        REGEX_CACHE: [],
        CALLBACKS: [],
    };
}

export { config, heap }
