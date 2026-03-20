/// <reference path="../global.d.ts" />
import { resolve } from "uri-js";
import { ANY, NEVER, STRING, NUMBER, INTEGER, BOOLEAN, NULLABLE, ARRAY, OBJECT } from "./const.js";

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
export const N_REF = 12;

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
 * Returns the number of Unicode code points in a string.
 * JSON Schema counts code points, not UTF-16 code units.
 * @param {string} str
 * @returns {number}
 */
function codePointLength(str) {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) {
            i++; // skip low surrogate
        }
        len++;
    }
    return len;
}

/**
 * Collects validator callbacks from a JSON Schema object.
 * Each callback returns true if valid, implementing the "ignores non-matching types" semantics.
 * @param {object} schema
 * @returns {Array<(data: any) => boolean>}
 */
function collectValidators(schema) {
    let checks = [];

    // String validators
    if ('minLength' in schema) {
        let n = schema.minLength;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'string' || codePointLength(d) >= n);
    }
    if ('maxLength' in schema) {
        let n = schema.maxLength;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'string' || codePointLength(d) <= n);
    }
    if ('pattern' in schema) {
        let re = new RegExp(schema.pattern);
        checks.push(/** @param {*} d */ (d) => typeof d !== 'string' || re.test(d));
    }

    // Number validators
    if ('minimum' in schema) {
        let n = schema.minimum;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'number' || d >= n);
    }
    if ('maximum' in schema) {
        let n = schema.maximum;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'number' || d <= n);
    }
    if ('exclusiveMinimum' in schema) {
        let n = schema.exclusiveMinimum;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'number' || d > n);
    }
    if ('exclusiveMaximum' in schema) {
        let n = schema.exclusiveMaximum;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'number' || d < n);
    }
    if ('multipleOf' in schema) {
        let n = schema.multipleOf;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'number' || d % n === 0);
    }

    // Array validators
    if ('minItems' in schema) {
        let n = schema.minItems;
        checks.push(/** @param {*} d */ (d) => !Array.isArray(d) || d.length >= n);
    }
    if ('maxItems' in schema) {
        let n = schema.maxItems;
        checks.push(/** @param {*} d */ (d) => !Array.isArray(d) || d.length <= n);
    }
    if ('uniqueItems' in schema && schema.uniqueItems) {
        checks.push(/** @param {*} d */ (d) => {
            if (!Array.isArray(d)) return true;
            let seen = new Set();
            for (let i = 0; i < d.length; i++) {
                let key = typeof d[i] === 'object' ? JSON.stringify(d[i]) : d[i];
                if (seen.has(key)) return false;
                seen.add(key);
            }
            return true;
        });
    }

    // Object validators
    if ('minProperties' in schema) {
        let n = schema.minProperties;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'object' || d === null || Array.isArray(d) || Object.keys(d).length >= n);
    }
    if ('maxProperties' in schema) {
        let n = schema.maxProperties;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'object' || d === null || Array.isArray(d) || Object.keys(d).length <= n);
    }

    // Enum
    if ('enum' in schema) {
        let values = schema.enum;
        checks.push(/** @param {*} d */ (d) => {
            for (let i = 0; i < values.length; i++) {
                if (d === values[i]) return true;
                if (typeof d === 'object' && d !== null && JSON.stringify(d) === JSON.stringify(values[i])) return true;
            }
            return false;
        });
    }

    // Const
    if ('const' in schema) {
        let val = schema.const;
        checks.push(/** @param {*} d */ (d) => {
            if (d === val) return true;
            if (typeof d === 'object' && d !== null) return JSON.stringify(d) === JSON.stringify(val);
            return false;
        });
    }

    return checks;
}

/**
 * Maps a single JSON Schema type string to a primitive bitmask or a kind constant.
 * Returns [isPrimitive, value] where value is either a bitmask or a kind.
 * @param {string} type
 * @returns {number} primitive bitmask
 */
function mapSingleTypePrim(type) {
    switch (type) {
        case 'string':  return STRING;
        case 'number':  return NUMBER;
        case 'integer': return INTEGER;
        case 'boolean': return BOOLEAN;
        case 'null':    return NULLABLE;
        case 'object':  return OBJECT;
        case 'array':   return ARRAY;
    }
    throw new Error('Unknown JSON Schema type: ' + type);
}

/**
 * Parses a JSON Schema object into a FlatAst suitable for compile().
 * Two-pass: Parse (iterative walk) then Link ($ref resolution).
 * @param {import('json-schema-typed').JSONSchema | boolean} schema
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
    let listChildren = [];
    /** @type {number[]} */
    let condSlots = [];
    /** @type {Array<(data: any) => boolean>} */
    let callbacks = [];

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
        newKinds.set(astKinds);
        newFlags.set(astFlags);
        newChild0.set(astChild0);
        newChild1.set(astChild1);
        astKinds = newKinds;
        astFlags = newFlags;
        astChild0 = newChild0;
        astChild1 = newChild1;
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

        // --- type keyword + validators ---
        let checks = collectValidators(sch);
        let hasType = 'type' in sch;

        if (!hasType && checks.length === 0) {
            // Empty schema {} → matches everything
            astKinds[nodeId] = N_PRIM;
            astFlags[nodeId] = (ANY | NULLABLE) >>> 0;
            continue;
        }

        // Build the type node
        let typeNodeId = nodeId; // by default, write directly to this node

        // If we have validators, we need to wrap in N_REFINE
        if (checks.length > 0) {
            let fn = checks.length === 1 ? checks[0] :
                /** @param {*} d */ (d) => {
                    for (let i = 0; i < checks.length; i++) {
                        if (!checks[i](d)) return false;
                    }
                    return true;
                };
            let cbIdx = callbacks.length;
            callbacks.push(fn);

            // nodeId becomes the REFINE wrapper
            astKinds[nodeId] = N_REFINE;
            astChild1[nodeId] = cbIdx;

            if (hasType) {
                // Create a new inner node for the type
                let innerId = allocNode();
                astChild0[nodeId] = innerId;
                typeNodeId = innerId;
            } else {
                // No type → inner is "any"
                let anyId = allocNode();
                astKinds[anyId] = N_PRIM;
                astFlags[anyId] = (ANY | NULLABLE) >>> 0;
                astChild0[nodeId] = anyId;
                continue;
            }
        }

        if (hasType) {
            let type = sch.type;

            if (typeof type === 'string') {
                astKinds[typeNodeId] = N_PRIM;
                astFlags[typeNodeId] = mapSingleTypePrim(type) >>> 0;
            } else if (type.length === 1) {
                astKinds[typeNodeId] = N_PRIM;
                astFlags[typeNodeId] = mapSingleTypePrim(type[0]) >>> 0;
            } else {
                // Multiple types → merge into a single N_PRIM bitmask
                let merged = 0;
                for (let i = 0; i < type.length; i++) {
                    merged |= mapSingleTypePrim(type[i]);
                }
                astKinds[typeNodeId] = N_PRIM;
                astFlags[typeNodeId] = merged >>> 0;
            }
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
        propNames,
        propChildren,
        listChildren,
        condSlots,
        callbacks,
        rootId,
        defIds,
        defNames,
        nodeCount: nc,
    };
}
