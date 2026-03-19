/// <reference path="../global.d.ts" />
import {
    COMPLEX, NULLABLE, OPTIONAL, VOLATILE,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_UNION, K_REFINE, K_TUPLE,
    K_RECORD, K_OR, K_EXCLUSIVE, K_INTERSECT, K_NOT, K_CONDITIONAL,
    HAS_VALIDATOR, sortByKeyId,
} from "./catalog.js";

const K_REF = 12;
const KIND_MASK = 0x0FFFFFFF;

/**
 * @template R
 * Compiles an AST root into the catalog's heap storage.
 * @param {uvd.cat.Catalog<R>} cat - a catalog instance returned by catalog()
 * @param {uvd.ast.AstRoot} ast 
 * @returns {{ root: number, defs: Record<string, number> }}
 */
export function compile(cat, ast) {
    let heap = cat.__heap;
    let HEAP = heap.HEAP;
    let allocKind = heap.allocKind;
    let allocValidator = heap.allocValidator;
    let allocOnSlab = heap.allocOnSlab;
    let lookup = heap.lookup;
    let registerObject = heap.registerObject;
    let registerArray = heap.registerArray;
    let registerUnion = heap.registerUnion;

    let volatile = false;
    let defs = ast.defs || [];
    let names = ast.names || [];
    let defCache = new Uint32Array(defs.length).fill(0xFFFFFFFF);

    /**
     * Decodes the char-code encoded validator object into an allocValidator call.
     * Keys are sorted alphabetically to ensure ascending bit order.
     * @param {!Record<string, number | true>} v
     * @returns {number} validator index
     */
    function decodeValidators(v) {
        let vHeader = 0;
        /** @type {!Array<number>} */
        let payloads = [];
        let keys = Object.keys(v).sort();
        for (let i = 0; i < keys.length; i++) {
            let bit = 1 << (keys[i].charCodeAt(0) - 97);
            vHeader |= bit;
            if (v[keys[i]] !== true) {
                payloads.push(v[keys[i]]);
            }
        }
        return allocValidator(vHeader, payloads, volatile);
    }

    /**
     * @param {number | uvd.ast.AstNode} node
     * @returns {number}
     */
    function compileNode(node) {
        if (typeof node === 'number') {
            return node;
        }

        switch (node.k) {
            case K_OBJECT: {
                let keys = Object.keys(node.p);
                let count = keys.length;
                let resolved = new Array(count * 2);
                for (let i = 0; i < count; i++) {
                    resolved[i * 2] = lookup(keys[i]);
                    resolved[i * 2 + 1] = compileNode(node.p[keys[i]]) >>> 0;
                }
                sortByKeyId(resolved);

                let valIdx = 0;
                const hasValidator = node.v !== void 0;
                if (hasValidator) {
                    valIdx = decodeValidators(node.v);
                }

                let objId = registerObject(resolved, count, volatile);
                let kindHeader = hasValidator ? (K_OBJECT | HAS_VALIDATOR) : K_OBJECT;
                let slots = hasValidator ? 3 : 2;
                let kindPtr = allocKind(kindHeader, objId, volatile, slots);
                if (hasValidator) {
                    HEAP.KINDS[kindPtr + 2] = valIdx;
                }
                return (COMPLEX | kindPtr) >>> 0;
            }

            case K_ARRAY: {
                let elemType = compileNode(node.i);
                let valIdx = 0;
                const hasValidator = node.v !== void 0;
                if (hasValidator) {
                    valIdx = decodeValidators(node.v);
                }

                let arrId = registerArray(elemType, volatile);
                let kindHeader = hasValidator ? (K_ARRAY | HAS_VALIDATOR) : K_ARRAY;
                let slots = hasValidator ? 3 : 2;
                let kindPtr = allocKind(kindHeader, arrId, volatile, slots);
                if (hasValidator) {
                    HEAP.KINDS[kindPtr + 2] = valIdx;
                }
                return (COMPLEX | kindPtr) >>> 0;
            }

            case K_UNION: {
                let discKeyId = lookup(node.d);
                let variantKeys = Object.keys(node.m);
                let count = variantKeys.length;
                let resolved = new Array(count * 2);
                for (let i = 0; i < count; i++) {
                    resolved[i * 2] = lookup(variantKeys[i]);
                    resolved[i * 2 + 1] = compileNode(node.m[variantKeys[i]]) >>> 0;
                }
                let unionId = registerUnion(resolved, count, discKeyId, volatile);
                let kindPtr = allocKind(K_UNION, unionId, volatile, 2);
                return (COMPLEX | kindPtr) >>> 0;
            }

            case K_REFINE: {
                let innerType = compileNode(node.i);
                let callbacks = HEAP.CALLBACKS;
                let callbackIdx = callbacks.push(node.f) - 1;
                let kindPtr = allocKind(K_REFINE, innerType >>> 0, volatile, 3);
                HEAP.KINDS[kindPtr + 2] = callbackIdx;
                let flags = COMPLEX | kindPtr;
                if (innerType & NULLABLE) {
                    flags |= NULLABLE;
                }
                if (innerType & OPTIONAL) {
                    flags |= OPTIONAL;
                }
                return flags >>> 0;
            }

            case K_TUPLE: {
                let types = new Array(node.i.length);
                for (let i = 0; i < node.i.length; i++) {
                    types[i] = compileNode(node.i[i]);
                }
                let tupleId = allocOnSlab(types, volatile, 'tuple');
                let kindPtr = allocKind(K_TUPLE, tupleId, volatile, 2);
                return (COMPLEX | kindPtr) >>> 0;
            }

            case K_RECORD: {
                let valueType = compileNode(node.i);
                let kindPtr = allocKind(K_RECORD, valueType >>> 0, volatile, 2);
                return (COMPLEX | kindPtr) >>> 0;
            }

            case K_OR: {
                let types = new Array(node.i.length);
                let allPrimitive = true;
                let merged = 0;
                for (let i = 0; i < node.i.length; i++) {
                    types[i] = compileNode(node.i[i]);
                    if (types[i] & COMPLEX) {
                        allPrimitive = false;
                    } else {
                        merged |= types[i];
                    }
                }
                if (allPrimitive) {
                    return merged >>> 0;
                }
                let matchId = allocOnSlab(types, volatile, 'match');
                let kindPtr = allocKind(K_OR, matchId, volatile, 2);
                return (COMPLEX | kindPtr) >>> 0;
            }

            case K_EXCLUSIVE: {
                let types = new Array(node.i.length);
                for (let i = 0; i < node.i.length; i++) {
                    types[i] = compileNode(node.i[i]);
                }
                let matchId = allocOnSlab(types, volatile, 'match');
                let kindPtr = allocKind(K_EXCLUSIVE, matchId, volatile, 2);
                return (COMPLEX | kindPtr) >>> 0;
            }

            case K_INTERSECT: {
                let types = new Array(node.i.length);
                for (let i = 0; i < node.i.length; i++) {
                    types[i] = compileNode(node.i[i]);
                }
                let matchId = allocOnSlab(types, volatile, 'match');
                let kindPtr = allocKind(K_INTERSECT, matchId, volatile, 2);
                return (COMPLEX | kindPtr) >>> 0;
            }

            case K_NOT: {
                let innerType = compileNode(node.i);
                let kindPtr = allocKind(K_NOT, innerType >>> 0, volatile, 2);
                return (COMPLEX | kindPtr) >>> 0;
            }

            case K_CONDITIONAL: {
                let ifType = compileNode(node.if);
                let thenType = node.then !== void 0 ? compileNode(node.then) : 0;
                let elseType = node.else !== void 0 ? compileNode(node.else) : 0;
                let types = [ifType, thenType, elseType];
                let matchId = allocOnSlab(types, volatile, 'match');
                let kindPtr = allocKind(K_CONDITIONAL, matchId, volatile, 2);
                return (COMPLEX | kindPtr) >>> 0;
            }

            case K_REF: {
                return compileRef(node);
            }
        }
        throw new Error('Unknown AST node kind: ' + node.k);
    }

    /**
     * Handles forward declarations for $ref-style cross-references between defs.
     * Reserves KIND slots upfront, stores placeholder in defCache, then patches after compilation.
     * @param {uvd.ast.AstRef} node - { k: 12, r: number }
     * @returns {number}
     */
    function compileRef(node) {
        let cached = defCache[node.r];
        if (cached !== 0xFFFFFFFF) {
            return cached;
        }

        // Reserve 2 KIND slots for forward declaration
        let kindPtr = HEAP.KIND_PTR;
        HEAP.KIND_PTR += 2;
        let typedef = (COMPLEX | kindPtr) >>> 0;
        defCache[node.r] = typedef;

        // Compile the actual definition
        let compiled = compileNode(defs[node.r]);

        // Patch the reserved KIND slots
        if (typeof compiled === 'number' && (compiled & COMPLEX) === 0) {
            // Raw primitive — promote to K_PRIMITIVE with prim bits in header
            HEAP.KINDS[kindPtr] = K_PRIMITIVE | compiled;
            HEAP.KINDS[kindPtr + 1] = 0;
        } else {
            // Complex type — copy the real kind entry
            let realPtr = compiled & KIND_MASK;
            HEAP.KINDS[kindPtr] = HEAP.KINDS[realPtr];
            HEAP.KINDS[kindPtr + 1] = HEAP.KINDS[realPtr + 1];
        }
        return typedef;
    }

    // Compile all defs to populate defCache
    for (let i = 0; i < defs.length; i++) {
        if (defCache[i] === 0xFFFFFFFF) {
            compileRef({ k: K_REF, r: i });
        }
    }

    let root = compileNode(ast.root);

    /** @type {Record<string, number>} */
    let resultDefs = {};
    for (let i = 0; i < names.length; i++) {
        resultDefs[names[i]] = defCache[i];
    }

    return { root, defs: resultDefs };
}

export { K_REF };
