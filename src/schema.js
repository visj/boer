/// <reference path="../global.d.ts" />
import { resolve } from "uri-js";
import {
    ANY, NEVER, STRING, NUMBER, INTEGER, BOOLEAN, NULLABLE, ARRAY, OBJECT,
    V_STR_MIN_LEN, V_STR_MAX_LEN,
    V_NUM_MIN, V_NUM_MAX, V_NUM_MULTIPLE, V_NUM_EX_MIN, V_NUM_EX_MAX,
    V_ARR_MIN, V_ARR_MAX, V_ARR_UNIQUE,
    V_OBJ_MIN, V_OBJ_MAX,
} from "./const.js";

/** @typedef {import('json-schema-typed').JSONSchema} */
let JsonSchema;

// AST node kind constants
export const N_PRIM = 0;
export const N_OBJECT = 1;
export const N_ARRAY = 2;
export const N_REFINE = 4;
export const N_OR = 7;
export const N_EXCLUSIVE = 8;
export const N_INTERSECT = 9;
export const N_NOT = 10;
export const N_CONDITIONAL = 11;
export const N_REF = 255;

// Stack link types (how child connects to parent)
const LINK_ROOT = 0;
const LINK_PROP = 1;
const LINK_LIST = 2;
const LINK_ELEM = 3;
const LINK_COND_IF = 4;
const LINK_COND_THEN = 5;
const LINK_COND_ELSE = 6;
const LINK_DEF = 7;
const LINK_INNER = 8;

const SENTINEL = 0xFFFFFFFF;
const INITIAL_CAPACITY = 256;
const MAX_DEPTH = 512;


/**
 * Collects validators from a JSON Schema object.
 * Built-in validators produce bit flags + payloads. Callbacks remain for enum/const/pattern.
 * Payloads are pushed in ascending bit order so popcount-based offset works.
 * @param {JsonSchema} schema
 * @returns {{vHeader: number, payloads: !Array<number>, callbacks: !Array<function(*): boolean>}}
 */
function collectValidators(schema) {
    let vHeader = 0;
    /** @type {!Array<number>} */
    let payloads = [];
    /** @type {!Array<function(*): boolean>} */
    let callbacks = [];

    // --- Payload flags (in bit order) ---

    // V_STR_MIN_LEN (bit 0)
    if ('minLength' in schema) {
        vHeader |= V_STR_MIN_LEN;
        payloads.push(schema.minLength);
    }
    // V_STR_MAX_LEN (bit 1)
    if ('maxLength' in schema) {
        vHeader |= V_STR_MAX_LEN;
        payloads.push(schema.maxLength);
    }
    // V_STR_PATTERN (bit 2) — leave as callback for now
    // V_STR_FORMAT (bit 3) — leave as callback for now

    // V_NUM_MIN (bit 4) + V_NUM_EX_MIN (bit 16) modifier
    let hasMin = 'minimum' in schema;
    let hasExMin = 'exclusiveMinimum' in schema;
    if (hasMin && hasExMin) {
        if (schema.exclusiveMinimum >= schema.minimum) {
            vHeader |= V_NUM_MIN | V_NUM_EX_MIN;
            payloads.push(schema.exclusiveMinimum);
        } else {
            vHeader |= V_NUM_MIN;
            payloads.push(schema.minimum);
        }
    } else if (hasMin) {
        vHeader |= V_NUM_MIN;
        payloads.push(schema.minimum);
    } else if (hasExMin) {
        vHeader |= V_NUM_MIN | V_NUM_EX_MIN;
        payloads.push(schema.exclusiveMinimum);
    }
    // V_NUM_MAX (bit 5) + V_NUM_EX_MAX (bit 17) modifier
    let hasMax = 'maximum' in schema;
    let hasExMax = 'exclusiveMaximum' in schema;
    if (hasMax && hasExMax) {
        if (schema.exclusiveMaximum <= schema.maximum) {
            vHeader |= V_NUM_MAX | V_NUM_EX_MAX;
            payloads.push(schema.exclusiveMaximum);
        } else {
            vHeader |= V_NUM_MAX;
            payloads.push(schema.maximum);
        }
    } else if (hasMax) {
        vHeader |= V_NUM_MAX;
        payloads.push(schema.maximum);
    } else if (hasExMax) {
        vHeader |= V_NUM_MAX | V_NUM_EX_MAX;
        payloads.push(schema.exclusiveMaximum);
    }
    // V_NUM_MULTIPLE (bit 6)
    if ('multipleOf' in schema) {
        vHeader |= V_NUM_MULTIPLE;
        payloads.push(schema.multipleOf);
    }

    // V_ARR_MIN (bit 7)
    if ('minItems' in schema) {
        vHeader |= V_ARR_MIN;
        payloads.push(schema.minItems);
    }
    // V_ARR_MAX (bit 8)
    if ('maxItems' in schema) {
        vHeader |= V_ARR_MAX;
        payloads.push(schema.maxItems);
    }
    // V_ARR_CONTAINS (bit 9), V_ARR_MIN_CT (bit 10), V_ARR_MAX_CT (bit 11) — later

    // V_OBJ_MIN (bit 12)
    if ('minProperties' in schema) {
        vHeader |= V_OBJ_MIN;
        payloads.push(schema.minProperties);
    }
    // V_OBJ_MAX (bit 13)
    if ('maxProperties' in schema) {
        vHeader |= V_OBJ_MAX;
        payloads.push(schema.maxProperties);
    }

    // --- Boolean flags (no payload) ---

    // V_ARR_UNIQUE (bit 18)
    if ('uniqueItems' in schema && schema.uniqueItems) {
        vHeader |= V_ARR_UNIQUE;
    }

    // --- Callbacks (no bit-flag equivalent) ---

    if ('pattern' in schema) {
        let re = new RegExp(schema.pattern);
        callbacks.push(/** @param {*} d */(d) => typeof d !== 'string' || re.test(d));
    }
    if ('enum' in schema) {
        let values = schema.enum;
        callbacks.push(/** @param {*} d */(d) => {
            for (let i = 0; i < values.length; i++) {
                if (d === values[i]) {
                    return true;
                }
                if (typeof d === 'object' && d !== null && JSON.stringify(d) === JSON.stringify(values[i])) {
                    return true;
                }
            }
            return false;
        });
    }
    if ('const' in schema) {
        let val = schema.const;
        callbacks.push(/** @param {*} d */(d) => {
            if (d === val) {
                return true;
            }
            if (typeof d === 'object' && d !== null) {
                return JSON.stringify(d) === JSON.stringify(val);
            }
            return false;
        });
    }

    return { vHeader, payloads, callbacks };
}

/**
 * Maps a single JSON Schema type string to a primitive bitmask or a kind constant.
 * Returns [isPrimitive, value] where value is either a bitmask or a kind.
 * @param {string} type
 * @returns {number} primitive bitmask
 */
function mapSingleTypePrim(type) {
    switch (type) {
        case 'string': return STRING;
        case 'number': return NUMBER;
        case 'integer': return INTEGER;
        case 'boolean': return BOOLEAN;
        case 'null': return NULLABLE;
        case 'object': return OBJECT;
        case 'array': return ARRAY;
    }
    throw new Error('Unknown JSON Schema type: ' + type);
}

/**
 * Parses a JSON Schema object into a FlatAst suitable for compile().
 * Two-pass: Parse (iterative walk) then Link ($ref resolution).
 * @param {JsonSchema | boolean} schema
 * @returns {uvd.ast.FlatAst}
 */
export function parseJsonSchema(schema) {
    // Flat AST storage
    let capacity = INITIAL_CAPACITY;
    let astKinds = new Uint8Array(capacity);
    let astFlags = new Uint32Array(capacity);
    let astChild0 = new Uint32Array(capacity);
    let astChild1 = new Uint32Array(capacity);

    // Side channels
    /** @type {string[]} */
    let propNames = [];
    /** @type {number[]} */
    let propChildren = [];
    /** @type {number[]} */
    let propFlags = [];
    /** @type {number[]} */
    let listChildren = [];
    /** @type {number[]} */
    let condSlots = [];
    /** @type {Array<(data: any) => boolean>} */
    let callbacks = [];

    // Validator bit-flag storage (per-node)
    let astVHeaders = new Uint32Array(capacity);
    let astVOffset = new Uint32Array(capacity);
    /** @type {number[]} */
    let vPayloads = [];

    /** @type {Map<number, string>} */
    let unresolvedRefs = new Map();
    /** @type {Map<string, number>} */
    let symbolTable = new Map();

    let nextNodeId = 0;

    // Stack (parallel arrays)
    let frameSchema = new Array(MAX_DEPTH);
    let frameNodeId = new Uint32Array(MAX_DEPTH);
    let frameLinkType = new Uint8Array(MAX_DEPTH);
    let frameLinkOffset = new Uint32Array(MAX_DEPTH);
    let tail = 0;

    /** @type {number[]} */
    let defIds = [];
    /** @type {string[]} */
    let defNames = [];

    function growArrays() {
        let newCap = capacity * 2;
        let newKinds = new Uint8Array(newCap);
        let newFlags = new Uint32Array(newCap);
        let newChild0 = new Uint32Array(newCap);
        let newChild1 = new Uint32Array(newCap);
        let newVHeaders = new Uint32Array(newCap);
        let newVOffset = new Uint32Array(newCap);
        newKinds.set(astKinds);
        newFlags.set(astFlags);
        newChild0.set(astChild0);
        newChild1.set(astChild1);
        newVHeaders.set(astVHeaders);
        newVOffset.set(astVOffset);
        astKinds = newKinds;
        astFlags = newFlags;
        astChild0 = newChild0;
        astChild1 = newChild1;
        astVHeaders = newVHeaders;
        astVOffset = newVOffset;
        capacity = newCap;
    }

    function allocNode() {
        let id = nextNodeId++;
        if (id >= capacity) growArrays();
        return id;
    }

    function pushFrame(schemaObj, nodeId, linkType, linkOffset) {
        frameSchema[tail] = schemaObj;
        frameNodeId[tail] = nodeId;
        frameLinkType[tail] = linkType;
        frameLinkOffset[tail] = linkOffset;
        tail++;
    }

    function writeLink(linkType, linkOffset, nodeId) {
        switch (linkType) {
            case LINK_ROOT:
                break;
            case LINK_PROP:
                propChildren[linkOffset] = nodeId;
                break;
            case LINK_LIST:
                listChildren[linkOffset] = nodeId;
                break;
            case LINK_ELEM:
                astChild0[linkOffset] = nodeId;
                break;
            case LINK_COND_IF:
                condSlots[linkOffset] = nodeId;
                break;
            case LINK_COND_THEN:
                condSlots[linkOffset + 1] = nodeId;
                break;
            case LINK_COND_ELSE:
                condSlots[linkOffset + 2] = nodeId;
                break;
            case LINK_DEF:
                break;
            case LINK_INNER:
                astChild0[linkOffset] = nodeId;
                break;
        }
    }

    // --- Pre-scan $defs ---
    if (typeof schema === 'object' && schema !== null && schema.$defs) {
        let defKeys = Object.keys(schema.$defs);
        for (let i = 0; i < defKeys.length; i++) {
            let name = defKeys[i];
            let id = allocNode();
            symbolTable.set('#/$defs/' + name, id);
            defIds.push(id);
            defNames.push(name);
            // Push def schemas — they'll be processed by the main loop
            pushFrame(schema.$defs[name], id, LINK_DEF, 0);
        }
    }

    // Push root
    let rootId = allocNode();
    pushFrame(schema, rootId, LINK_ROOT, 0);

    // --- Main parse loop ---
    while (tail > 0) {
        tail--;
        let sch = frameSchema[tail];
        let nodeId = frameNodeId[tail];
        let linkType = frameLinkType[tail];
        let linkOffset = frameLinkOffset[tail];

        // Clear frame reference to avoid holding schema objects
        frameSchema[tail] = null;

        // Write the linkage from parent
        writeLink(linkType, linkOffset, nodeId);

        // --- Boolean schemas ---
        if (sch === true) {
            astKinds[nodeId] = N_PRIM;
            astFlags[nodeId] = (ANY | NULLABLE) >>> 0;
            continue;
        }
        if (sch === false) {
            astKinds[nodeId] = N_PRIM;
            astFlags[nodeId] = NEVER;
            continue;
        }

        // --- $ref ---
        if (sch.$ref) {
            astKinds[nodeId] = N_REF;
            unresolvedRefs.set(nodeId, sch.$ref);
            continue;
        }

        // --- Composition keywords ---
        if ('allOf' in sch) {
            let items = sch.allOf;
            let listOffset = listChildren.length;
            astKinds[nodeId] = N_INTERSECT;
            astChild0[nodeId] = listOffset;
            astChild1[nodeId] = items.length;
            for (let i = 0; i < items.length; i++) {
                let childId = allocNode();
                listChildren.push(0); // placeholder
                pushFrame(items[i], childId, LINK_LIST, listOffset + i);
            }
            continue;
        }
        if ('anyOf' in sch) {
            let items = sch.anyOf;
            let listOffset = listChildren.length;
            astKinds[nodeId] = N_OR;
            astChild0[nodeId] = listOffset;
            astChild1[nodeId] = items.length;
            for (let i = 0; i < items.length; i++) {
                let childId = allocNode();
                listChildren.push(0); // placeholder
                pushFrame(items[i], childId, LINK_LIST, listOffset + i);
            }
            continue;
        }
        if ('oneOf' in sch) {
            let items = sch.oneOf;
            let listOffset = listChildren.length;
            astKinds[nodeId] = N_EXCLUSIVE;
            astChild0[nodeId] = listOffset;
            astChild1[nodeId] = items.length;
            for (let i = 0; i < items.length; i++) {
                let childId = allocNode();
                listChildren.push(0); // placeholder
                pushFrame(items[i], childId, LINK_LIST, listOffset + i);
            }
            continue;
        }
        if ('not' in sch) {
            let childId = allocNode();
            astKinds[nodeId] = N_NOT;
            astChild0[nodeId] = childId;
            pushFrame(sch.not, childId, LINK_INNER, nodeId);
            continue;
        }
        if ('if' in sch) {
            let condOffset = condSlots.length;
            condSlots.push(SENTINEL, SENTINEL, SENTINEL); // if, then, else placeholders
            astKinds[nodeId] = N_CONDITIONAL;
            astChild0[nodeId] = condOffset;

            let ifId = allocNode();
            pushFrame(sch.if, ifId, LINK_COND_IF, condOffset);

            if (sch.then !== undefined) {
                let thenId = allocNode();
                pushFrame(sch.then, thenId, LINK_COND_THEN, condOffset);
            }
            if (sch.else !== undefined) {
                let elseId = allocNode();
                pushFrame(sch.else, elseId, LINK_COND_ELSE, condOffset);
            }
            continue;
        }

        // --- type keyword + validators + structural keywords ---
        let { vHeader, payloads: vPayloadArr, callbacks: cbs } = collectValidators(sch);
        let hasType = 'type' in sch;
        let hasVHeader = vHeader !== 0;
        let hasCbs = cbs.length > 0;
        let hasProps = 'properties' in sch || 'required' in sch;
        let hasItems = 'items' in sch;

        if (!hasType && !hasVHeader && !hasCbs && !hasProps && !hasItems) {
            // Empty schema {} → matches everything
            astKinds[nodeId] = N_PRIM;
            astFlags[nodeId] = (ANY | NULLABLE) >>> 0;
            continue;
        }

        // Resolve type string for structural dispatch
        let typeStr = null;
        if (hasType) {
            let t = sch.type;
            if (typeof t === 'string') typeStr = t;
            else if (t.length === 1) typeStr = t[0];
        }

        // Build the type node
        let typeNodeId = nodeId;

        // If we have callbacks (enum/const/pattern), wrap in N_REFINE
        if (hasCbs) {
            let fn = cbs.length === 1 ? cbs[0] :
                /** @param {*} d */ (d) => {
                    for (let i = 0; i < cbs.length; i++) {
                        if (!cbs[i](d)) {
                            return false;
                        }
                    }
                    return true;
                };
            let cbIdx = callbacks.length;
            callbacks.push(fn);

            astKinds[nodeId] = N_REFINE;
            astChild1[nodeId] = cbIdx;

            if (hasType || hasVHeader || hasProps || hasItems) {
                let innerId = allocNode();
                astChild0[nodeId] = innerId;
                typeNodeId = innerId;
            } else {
                // No type, no bit-flag validators → inner is "any"
                let anyId = allocNode();
                astKinds[anyId] = N_PRIM;
                astFlags[anyId] = (ANY | NULLABLE) >>> 0;
                astChild0[nodeId] = anyId;
                continue;
            }
        }

        // --- Object structural node (properties / required) ---
        if (hasProps) {
            let props = sch.properties || Object.create(null);
            let propKeys = Object.keys(props);
            let requiredSet = sch.required ? new Set(sch.required) : new Set();

            // Add required-only keys (not in properties) with "any" schema
            if (sch.required) {
                for (let i = 0; i < sch.required.length; i++) {
                    let r = sch.required[i];
                    if (!Object.prototype.hasOwnProperty.call(props, r)) {
                        propKeys.push(r);
                    }
                }
            }

            let isExplicitObject = typeStr === 'object';
            let objNodeId;

            if (isExplicitObject) {
                // type: "object" — N_OBJECT directly on typeNodeId
                objNodeId = typeNodeId;
            } else {
                // No explicit type — wrap in conditional guard
                // N_CONDITIONAL: if (is object) then (validate props) else (pass)
                objNodeId = allocNode();
                let ifId = allocNode();
                astKinds[ifId] = N_PRIM;
                astFlags[ifId] = OBJECT;

                let condOffset = condSlots.length;
                condSlots.push(ifId, objNodeId, SENTINEL);
                astKinds[typeNodeId] = N_CONDITIONAL;
                astChild0[typeNodeId] = condOffset;
            }

            // Create N_OBJECT on objNodeId
            let offset = propNames.length;
            astKinds[objNodeId] = N_OBJECT;
            astChild0[objNodeId] = offset;
            astChild1[objNodeId] = propKeys.length;

            for (let i = 0; i < propKeys.length; i++) {
                let key = propKeys[i];
                let childSchema = key in props ? props[key] : true;
                let childId = allocNode();
                propNames.push(key);
                propChildren.push(0); // placeholder
                propFlags.push(requiredSet.has(key) ? 0 : 1);
                pushFrame(childSchema, childId, LINK_PROP, offset + i);
            }

            // Store validators on the object node
            if (hasVHeader) {
                astVHeaders[objNodeId] = vHeader;
                astVOffset[objNodeId] = vPayloads.length;
                for (let i = 0; i < vPayloadArr.length; i++) {
                    vPayloads.push(vPayloadArr[i]);
                }
            }
            continue;
        }

        // --- Array structural node (items) ---
        if (hasItems) {
            let isExplicitArray = typeStr === 'array';
            let arrNodeId;

            if (isExplicitArray) {
                // type: "array" — N_ARRAY directly on typeNodeId
                arrNodeId = typeNodeId;
            } else {
                // No explicit type — wrap in conditional guard
                arrNodeId = allocNode();
                let ifId = allocNode();
                astKinds[ifId] = N_PRIM;
                astFlags[ifId] = ARRAY;

                let condOffset = condSlots.length;
                condSlots.push(ifId, arrNodeId, SENTINEL);
                astKinds[typeNodeId] = N_CONDITIONAL;
                astChild0[typeNodeId] = condOffset;
            }

            // Create N_ARRAY on arrNodeId
            let elemId = allocNode();
            astKinds[arrNodeId] = N_ARRAY;
            astChild0[arrNodeId] = elemId;
            pushFrame(sch.items, elemId, LINK_ELEM, arrNodeId);

            // Store validators on the array node
            if (hasVHeader) {
                astVHeaders[arrNodeId] = vHeader;
                astVOffset[arrNodeId] = vPayloads.length;
                for (let i = 0; i < vPayloadArr.length; i++) {
                    vPayloads.push(vPayloadArr[i]);
                }
            }
            continue;
        }

        // --- Pure type / validator node (no structural keywords) ---

        // Store bit-flag validators on the type node
        if (hasVHeader) {
            astVHeaders[typeNodeId] = vHeader;
            astVOffset[typeNodeId] = vPayloads.length;
            for (let i = 0; i < vPayloadArr.length; i++) {
                vPayloads.push(vPayloadArr[i]);
            }
        }

        // Set the type on the type node
        if (hasType) {
            let type = sch.type;
            if (typeof type === 'string') {
                astKinds[typeNodeId] = N_PRIM;
                astFlags[typeNodeId] = mapSingleTypePrim(type) >>> 0;
            } else if (type.length === 1) {
                astKinds[typeNodeId] = N_PRIM;
                astFlags[typeNodeId] = mapSingleTypePrim(type[0]) >>> 0;
            } else {
                let merged = 0;
                for (let i = 0; i < type.length; i++) {
                    merged |= mapSingleTypePrim(type[i]);
                }
                astKinds[typeNodeId] = N_PRIM;
                astFlags[typeNodeId] = merged >>> 0;
            }
        } else {
            // Has validators but no type → matches everything
            astKinds[typeNodeId] = N_PRIM;
            astFlags[typeNodeId] = (ANY | NULLABLE) >>> 0;
        }
    }

    // --- Link pass: resolve $refs ---
    for (let [nodeId, uri] of unresolvedRefs) {
        let targetId;
        if (uri.startsWith('#/$defs/')) {
            targetId = symbolTable.get(uri);
        } else {
            // Try direct lookup first, then URI resolution
            targetId = symbolTable.get(uri);
        }
        if (targetId === undefined) {
            throw new Error('Unresolved $ref: ' + uri);
        }
        astChild0[nodeId] = targetId;
    }

    // Trim arrays to actual size
    let nc = nextNodeId;

    return {
        astKinds: astKinds.subarray(0, nc),
        astFlags: astFlags.subarray(0, nc),
        astChild0: astChild0.subarray(0, nc),
        astChild1: astChild1.subarray(0, nc),
        astVHeaders: astVHeaders.subarray(0, nc),
        astVOffset: astVOffset.subarray(0, nc),
        vPayloads,
        propNames,
        propChildren,
        propFlags,
        listChildren,
        condSlots,
        callbacks,
        rootId,
        defIds,
        defNames,
        nodeCount: nc,
    };
}
