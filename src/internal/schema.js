/// <reference path="../../global.d.ts" />
import {
    ANY, NEVER, STRING, NUMBER, INTEGER, BOOLEAN, TRUE, FALSE, NULLABLE, OPTIONAL,
    V_MIN_LENGTH, V_MAX_LENGTH, V_PATTERN, V_FORMAT,
    V_MINIMUM, V_MAXIMUM, V_MULTIPLE_OF, V_EXCLUSIVE_MINIMUM, V_EXCLUSIVE_MAXIMUM,
    V_MIN_ITEMS, V_MAX_ITEMS, V_MIN_CONTAINS, V_MAX_CONTAINS, V_UNIQUE_ITEMS,
    V_MIN_PROPERTIES, V_MAX_PROPERTIES, V_DEPENDENT_REQUIRED,
    V_PATTERN_PROPERTIES, V_ADDITIONAL_PROPERTIES,
    V_ENUM,
    hasOwnProperty
} from "./const.js";
import { packValidators, PAYLOAD_QUEUE } from "./validator.js";

/**
 * @typedef {import("json-schema-typed").JSONSchema} JSONSchema
 */

/**
 * @typedef {Extract<JSONSchema, object>} Schema
 */

/**
 * Validator flags that packValidators can resolve purely from the schema
 * object without needing compiled child type ids. Excludes:
 *   V_CONTAINS, V_UNEVALUATED_ITEMS, V_UNEVALUATED_PROPERTIES — child schema
 *   V_PATTERN_PROPERTIES, V_PROPERTY_NAMES, V_ADDITIONAL_PROPERTIES — child schemas
 *   V_DEPENDENT_SCHEMAS — child schemas
 */
// V_FORMAT is intentionally excluded: per JSON Schema spec, format is an
// annotation only by default and must not affect validation unless explicitly
// opted in. Unknown format values would also throw if included.
const SCHEMA_PURE_MASK = V_MIN_LENGTH | V_MAX_LENGTH | V_PATTERN
    | V_MINIMUM | V_MAXIMUM | V_MULTIPLE_OF | V_EXCLUSIVE_MINIMUM | V_EXCLUSIVE_MAXIMUM
    | V_MIN_ITEMS | V_MAX_ITEMS | V_MIN_CONTAINS | V_MAX_CONTAINS | V_UNIQUE_ITEMS
    | V_MIN_PROPERTIES | V_MAX_PROPERTIES | V_DEPENDENT_REQUIRED;

// ────────────────────────────────────────────────────────────────────────────
// AST Node Kinds
// ────────────────────────────────────────────────────────────────────────────
// Each node in the flat AST has a "kind" stored in astKinds[nodeId].
// These constants identify what the node represents.
//
//   N_PRIM        Leaf node. astFlags holds a primitive bitmask (STRING, NUMBER, etc.)
//   N_OBJECT      Object with named properties. astChild0 → edge offset, astChild1 → prop count.
//   N_ARRAY       Homogeneous array. astChild0 → element node id.
//   N_REFINE      Wraps an inner type + callback. astChild0 → inner node, astChild1 → callback index.
//   N_OR          anyOf. astChild0 → edge offset, astChild1 → branch count.
//   N_EXCLUSIVE   oneOf. Same layout as N_OR.
//   N_INTERSECT   allOf. Same layout as N_OR.
//   N_NOT         Negation. astChild0 → inner node.
//   N_CONDITIONAL if/then/else. astChild0 → edge offset (3 slots: [if, then, else]).
//   N_REF         Reference to a definition. astChild0 → target node id.
// ────────────────────────────────────────────────────────────────────────────

export const N_PRIM = 0;
export const N_OBJECT = 1;
export const N_ARRAY = 2;
export const N_REFINE = 4;
export const N_BARE_ARRAY = 5;
export const N_BARE_OBJECT = 6;
export const N_OR = 7;
export const N_EXCLUSIVE = 8;
export const N_INTERSECT = 9;
export const N_NOT = 10;
export const N_CONDITIONAL = 11;
export const N_TUPLE = 12;
export const N_REF = 255;

// ────────────────────────────────────────────────────────────────────────────
// Stack Link Types
// ────────────────────────────────────────────────────────────────────────────
// When a child frame is pushed onto the parse stack, the link type tells
// writeLink() how to wire the completed child back to its parent.
//
//   LINK_ROOT    Root node — no parent to wire to.
//   LINK_EDGE    Writes edges[linkOffset] = childNodeId.
//                Used for object properties, list members, and conditional slots.
//   LINK_CHILD0  Writes astChild0[linkOffset] = childNodeId.
//                Used for array element types, inner types (not, refine).
//   LINK_DEF     Definition — no wiring needed (compiled separately).
// ────────────────────────────────────────────────────────────────────────────

const LINK_ROOT = 0;
const LINK_EDGE = 1;
const LINK_CHILD0 = 2;
const LINK_DEF = 3;

const SENTINEL = 0xFFFFFFFF;
const INITIAL_CAPACITY = 256;
const MAX_DEPTH = 512;


// Maps a JSON Schema type string ("string", "number", etc.) to the
// corresponding primitive bitmask from const.js.
/**
 * @param {string} type — JSON Schema type keyword
 * @returns {number} primitive bitmask
 */
/**
 * Returns true if the type string is a complex container type
 * ("array" or "object") rather than a primitive type.
 * @param {string} type
 * @returns {boolean}
 */
function isContainerType(type) {
    return type === 'array' || type === 'object';
}

/**
 * @throws
 * @param {string} type 
 * @returns {number}
 */
function mapSingleTypePrim(type) {
    switch (type) {
        case 'string': return STRING;
        case 'number': return NUMBER;
        case 'integer': return INTEGER;
        case 'boolean': return BOOLEAN;
        case 'null': return NULLABLE;
    }
    throw new Error('Unknown JSON Schema type: ' + type);
}

// parseJsonSchema(schema) → FlatAst
//
// Parses a JSON Schema (draft 2020-12) into a FlatAst — a compact,
// structure-of-arrays representation designed for fast compilation into
// the uvd validation engine's heap.
//
// ## Algorithm
//
// The parser uses an iterative depth-first walk with an explicit stack.
// Each stack frame contains: the schema fragment, the pre-allocated node
// id, and wiring info (link type + offset) so completed children are
// connected to their parents.
//
// Phase 1 — Parse: pops frames, classifies each schema, writes the SoA
//   arrays, and pushes child frames for nested schemas.
// Phase 2 — Link: resolves $ref nodes by looking up the symbol table
//   built during the pre-scan of $defs.
//
// ## FlatAst Memory Layout
//
// The AST is stored as parallel typed arrays (SoA):
//
//   astKinds[nodeId]   — Uint8Array  — node kind (N_PRIM, N_OBJECT, etc.)
//   astFlags[nodeId]   — Uint32Array — for N_PRIM: primitive bitmask
//   astChild0[nodeId]  — Uint32Array — primary child pointer:
//       N_PRIM: unused (flags carry the data)
//       N_OBJECT: edge offset into astEdges (start of property triplets)
//       N_ARRAY: element node id
//       N_OR / N_EXCLUSIVE / N_INTERSECT: edge offset (start of child ids)
//       N_NOT: inner node id
//       N_CONDITIONAL: edge offset (3 slots: [if, then, else])
//       N_REFINE: inner node id
//       N_REF: target node id (after link pass)
//   astChild1[nodeId]  — Uint32Array — secondary data:
//       N_OBJECT: property count
//       N_OR / N_EXCLUSIVE / N_INTERSECT: branch count
//       N_REFINE: callback index into callbacks[]
//
// Variable-length edges are stored in a unified slab (astEdges):
//
//   Object properties:  [nameIdx, childId, flags] × count
//     nameIdx — index into propNames[]
//     childId — the AST node id for this property's schema
//     flags   — 0 = required, 1 = optional
//
//   List members (allOf/anyOf/oneOf):  [childId] × count
//
//   Conditional slots:  [ifId, thenId, elseId]  (SENTINEL = absent)
//
// Validator payloads are in a separate slab (vPayloads):
//   astVHeaders[nodeId] — per-node bitmask of V_* flags
//   astVOffset[nodeId]  — start index into vPayloads for this node
//
// ────────────────────────────────────────────────────────────────────────────

/**
 * @param {JSONSchema|boolean} schema — a JSON Schema document (object or boolean)
 * @returns {uvd.FlatAst}
 */
export function parseJsonSchema(schema) {
    // ── Core SoA node arrays ──
    let capacity = INITIAL_CAPACITY;
    let astKinds = new Uint8Array(capacity);
    let astFlags = new Uint32Array(capacity);
    let astChild0 = new Uint32Array(capacity);
    let astChild1 = new Uint32Array(capacity);

    // ── Validator bit-flag storage (per-node) ──
    let astVHeaders = new Uint32Array(capacity);
    let astVOffset = new Uint32Array(capacity);

    /** @type {number[]} */
    let vPayloads = [];

    // ── Unified edge slab ──
    // Replaces the old propChildren, propFlags, listChildren, condSlots arrays.
    // All variable-length child pointers are interleaved here.
    /** @type {number[]} */
    let astEdges = [];

    // ── Property names (strings can't live in a typed array) ──
    /** @type {string[]} */
    let propNames = [];

    // ── Callbacks for enum/const validators ──
    /** @type {Array<(data: any) => boolean>} */
    let callbacks = [];
    /** @type {Array<RegExp>} */
    let regexes = [];

    /**
     * Maps string keys to temporary indices in propNames[]. Used by
     * packValidators (via virtualLookup) for V_DEPENDENT_REQUIRED so that
     * dependency strings get temporary IDs here that the ast.js compiler
     * later re-maps to real catalog keyIds via lookup(propNames[idx]).
     * @type {Map<string, number>}
     */
    let propNameIndex = new Map();

    /**
     * Assigns a temporary index (propNames[] position) to a string key.
     * Re-uses an existing entry if the key was already registered.
     * @param {string} key
     * @returns {number}
     */
    function virtualLookup(key) {
        let idx = propNameIndex.get(key);
        if (idx === void 0) {
            idx = propNames.length;
            propNames.push(key);
            propNameIndex.set(key, idx);
        }
        return idx;
    }

    // ── $ref resolution ──
    /** @type {Map<number, string>} */
    let unresolvedRefs = new Map();
    /** @type {Map<string, number>} */
    let symbolTable = new Map();

    let nextNodeId = 0;

    // ── Explicit parse stack (parallel arrays) ──
    /**
     * @type {Array<JSONSchema | null>}
     */
    let frameSchema = new Array(MAX_DEPTH);
    let frameNodeId = new Uint32Array(MAX_DEPTH);
    let frameLinkType = new Uint8Array(MAX_DEPTH);
    let frameLinkOffset = new Uint32Array(MAX_DEPTH);
    let tail = 0;

    /** @type {number[]} */
    let defIds = [];
    /** @type {string[]} */
    let defNames = [];

    // ── Helpers ──

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

    /**
     * 
     * @param {JSONSchema} schemaObj 
     * @param {number} nodeId 
     * @param {number} linkType 
     * @param {number} linkOffset 
     */
    function pushFrame(schemaObj, nodeId, linkType, linkOffset) {
        frameSchema[tail] = schemaObj;
        frameNodeId[tail] = nodeId;
        frameLinkType[tail] = linkType;
        frameLinkOffset[tail] = linkOffset;
        tail++;
    }

    /**
     * Wires a completed child node back to its parent structure.
     * LINK_EDGE  → writes into the unified edge slab.
     * LINK_CHILD0 → writes into astChild0 (array elem, not inner, etc.).
     * @param {number} linkType
     * @param {number} linkOffset
     * @param {number} nodeId
     */
    function writeLink(linkType, linkOffset, nodeId) {
        switch (linkType) {
            case LINK_ROOT:
            case LINK_DEF:
                break;
            case LINK_EDGE:
                astEdges[linkOffset] = nodeId;
                break;
            case LINK_CHILD0:
                astChild0[linkOffset] = nodeId;
                break;
        }
    }

    /**
     * Writes vHeader + payloads onto a node's validator slots.
     * @param {number} targetNode — the AST node id to attach validators to
     * @param {number} vHeader — bitmask of V_* flags
     * @param {number[]} vPayloadArr — payload values in ascending bit order
     */
    function writeValidators(targetNode, vHeader, vPayloadArr) {
        astVHeaders[targetNode] = vHeader;
        astVOffset[targetNode] = vPayloads.length;
        for (let i = 0; i < vPayloadArr.length; i++) {
            vPayloads.push(vPayloadArr[i]);
        }
    }

    // Pre-scan $defs — allocate node ids so $ref can resolve them.

    if (typeof schema === 'object' && schema !== null) {
        let defs = schema.$defs;
        if (defs !== void 0) {
            let defKeys = Object.keys(defs);
            for (let i = 0; i < defKeys.length; i++) {
                let name = defKeys[i];
                let id = allocNode();
                symbolTable.set('#/$defs/' + name, id);
                defIds.push(id);
                defNames.push(name);
                pushFrame(defs[name], id, LINK_DEF, 0);
            }
        }
    }

    // Push root
    let rootId = allocNode();
    pushFrame(schema, rootId, LINK_ROOT, 0);

    // Phase 1: Iterative depth-first parse

    while (tail > 0) {
        tail--;
        let sch = frameSchema[tail];
        let nodeId = frameNodeId[tail];
        let linkType = frameLinkType[tail];
        let linkOffset = frameLinkOffset[tail];

        // Release reference so the schema object can be GC'd
        frameSchema[tail] = null;

        // Wire this node into its parent
        writeLink(linkType, linkOffset, nodeId);

        // ── Boolean schemas ──
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

        if (sch === null) {
            throw new Error('Compiler error')
        }

        // ── $ref ──
        let ref = sch.$ref;
        if (ref !== void 0) {
            astKinds[nodeId] = N_REF;
            unresolvedRefs.set(nodeId, ref);
            continue;
        }

        // ── Composition keywords ──

        let allOf = sch.allOf;
        let anyOf = sch.anyOf;
        let oneOf = sch.oneOf;
        let notSchema = sch.not;
        let ifSchema = sch.if;
        let hasComposition = allOf !== void 0 || anyOf !== void 0 || oneOf !== void 0
            || notSchema !== void 0 || ifSchema !== void 0;
        // Count how many composition keywords are present
        let compositionCount = (allOf !== void 0 ? 1 : 0) + (anyOf !== void 0 ? 1 : 0)
            + (oneOf !== void 0 ? 1 : 0) + (notSchema !== void 0 ? 1 : 0)
            + (ifSchema !== void 0 ? 1 : 0);

        // ── Type + validators + structural keywords ──

        let result = packValidators(sch, SCHEMA_PURE_MASK, virtualLookup);
        let vHeader = result[0];
        /** @type {number[]} */
        let vPayloadArr = [];
        let ri = 0;
        for (let i = 1; i < result.length; i++) {
            if (result[i] === -1) {
                vPayloadArr.push(regexes.length);
                regexes.push(/** @type {RegExp} */(PAYLOAD_QUEUE.REGEX[ri++]));
            } else {
                vPayloadArr.push(result[i]);
            }
        }

        // ── enum / const preprocessing ──
        // Rule A: const → enum [x]. const is conceptually an enum of length 1.
        let constVal = sch.const;
        let enumValues = sch.enum;
        if (constVal !== void 0 && enumValues === void 0) {
            enumValues = [constVal];
        }
        let hasEnum = enumValues !== void 0;

        /** Accumulated primitive type bits from enum values. */
        let enumPrimBits = 0;
        /** @type {string[]} */
        let enumStrings = [];
        /** @type {number[]} */
        let enumNumbers = [];
        /**
         * Desugared structural schemas for object/array enum values.
         * Rule B: Objects → {type:"object", properties, required, additionalProperties:false}
         *         Arrays  → {type:"array", prefixItems, items:false}
         * @type {Array<Object>}
         */
        let enumComplexSchemas = [];

        if (hasEnum) {
            for (let i = 0; i < enumValues.length; i++) {
                let v = enumValues[i];
                if (v === null) {
                    enumPrimBits |= NULLABLE;
                } else if (v === true) {
                    enumPrimBits |= TRUE;
                } else if (v === false) {
                    enumPrimBits |= FALSE;
                } else if (typeof v === 'string') {
                    enumStrings.push(v);
                } else if (typeof v === 'number') {
                    enumNumbers.push(v);
                } else if (Array.isArray(v)) {
                    /** Rule B (array): desugar to {type:"array",prefixItems:[{enum:[v[0]]},…],items:false} */
                    let prefixItems = new Array(v.length);
                    for (let j = 0; j < v.length; j++) {
                        prefixItems[j] = { enum: [v[j]] };
                    }
                    enumComplexSchemas.push({ type: 'array', prefixItems, items: false });
                } else if (typeof v === 'object') {
                    /** Rule B (object): desugar to {type:"object",properties:{k:{enum:[v[k]]},...},required,additionalProperties:false} */
                    let propKeys = Object.keys(v);
                    let properties = {};
                    for (let j = 0; j < propKeys.length; j++) {
                        properties[propKeys[j]] = { enum: [v[propKeys[j]]] };
                    }
                    enumComplexSchemas.push({ type: 'object', properties, required: propKeys, additionalProperties: false });
                }
            }

            if (enumComplexSchemas.length > 0) {
                /**
                 * Rule C.2: enum contains structural types (objects/arrays).
                 * Emit N_OR at nodeId; each complex schema and the unified primitive branch
                 * become separate children compiled on next loop iterations.
                 */
                let branches = [];
                if (enumStrings.length > 0 || enumNumbers.length > 0 || enumPrimBits !== 0) {
                    // Gather just the primitive values into a new synthetic enum schema.
                    // The recursive parse will apply Rule C.1 (primitive-only path).
                    let primEnum = [];
                    for (let i = 0; i < enumStrings.length; i++) { primEnum.push(enumStrings[i]); }
                    for (let i = 0; i < enumNumbers.length; i++) { primEnum.push(enumNumbers[i]); }
                    if (enumPrimBits & NULLABLE) { primEnum.push(null); }
                    if (enumPrimBits & TRUE)     { primEnum.push(true); }
                    if (enumPrimBits & FALSE)    { primEnum.push(false); }
                    branches.push({ enum: primEnum });
                }
                for (let i = 0; i < enumComplexSchemas.length; i++) {
                    branches.push(enumComplexSchemas[i]);
                }
                astKinds[nodeId] = N_OR;
                astChild0[nodeId] = astEdges.length;
                astChild1[nodeId] = branches.length;
                for (let i = 0; i < branches.length; i++) {
                    let slot = astEdges.length;
                    astEdges.push(0);
                    let childId = allocNode();
                    pushFrame(branches[i], childId, LINK_EDGE, slot);
                }
                continue;
            }

            /**
             * Rule C.1: primitive-only enum (no objects/arrays).
             * Build V_ENUM sequential payload and OR the type bits into vHeader.
             * Strings are stored as virtual propNames indices; ast.js resolves
             * them to real keyIds via lookup(propNames[idx]) and sorts them.
             * Numbers are sorted here immediately.
             */
            if (enumStrings.length > 0 || enumNumbers.length > 0) {
                if (enumStrings.length > 0) { enumPrimBits |= STRING; }
                if (enumNumbers.length > 0) { enumPrimBits |= NUMBER; }
                vHeader |= V_ENUM;
                if (enumStrings.length > 0) {
                    // Write string segment: [strCount, vIdx0, vIdx1, ...]
                    // ast.js remaps vIdx → lookup(propNames[vIdx]) and sorts by keyId.
                    vPayloadArr.push(enumStrings.length);
                    for (let i = 0; i < enumStrings.length; i++) {
                        vPayloadArr.push(virtualLookup(enumStrings[i]));
                    }
                }
                if (enumNumbers.length > 0) {
                    // Write number segment: [numCount, sorted_num0, sorted_num1, ...]
                    let sortedNums = enumNumbers.slice().sort((a, b) => a - b);
                    vPayloadArr.push(sortedNums.length);
                    for (let i = 0; i < sortedNums.length; i++) {
                        vPayloadArr.push(sortedNums[i]);
                    }
                }
            }
            // enumPrimBits now holds TRUE/FALSE/NULLABLE/STRING/NUMBER bits from the enum values.
        }

        let typeVal = sch.type;
        const hasType = typeVal !== void 0;
        const hasVHeader = vHeader !== 0;

        let props = sch.properties;
        let required = sch.required;
        let items = sch.items;
        let additionalProps = sch.additionalProperties;
        let patternProps = sch.patternProperties;
        let prefixItems = sch.prefixItems;
        const hasProps = props !== void 0 || required !== void 0;
        const hasItems = items !== void 0;
        const hasAdditionalProps = additionalProps !== void 0;
        const hasPatternProps = patternProps !== void 0;
        const hasPrefixItems = prefixItems !== void 0;

        let hasSiblings = hasType || hasVHeader || hasEnum || hasProps || hasItems
            || hasAdditionalProps || hasPatternProps || hasPrefixItems;

        // If composition keywords coexist with structural/type/validator keywords,
        // or multiple composition keywords exist at the same level,
        // wrap everything in an implicit allOf.
        if ((hasComposition && hasSiblings) || compositionCount > 1) {
            // Collect sub-schemas to combine via allOf
            /** @type {Array<*>} */
            let parts = [];

            // Sibling structural/type/validator keywords → separate sub-schema
            if (hasSiblings) {
                /** @type {Record<string, any>} */
                let siblingSchema = {};
                if (hasType) siblingSchema.type = typeVal;
                if (props !== void 0) siblingSchema.properties = props;
                if (required !== void 0) siblingSchema.required = required;
                if (items !== void 0) siblingSchema.items = items;
                if (hasAdditionalProps) siblingSchema.additionalProperties = additionalProps;
                if (hasPatternProps) siblingSchema.patternProperties = patternProps;
                if (hasPrefixItems) siblingSchema.prefixItems = prefixItems;
                for (let key of ['minLength', 'maxLength', 'minimum', 'maximum',
                    'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf',
                    'minItems', 'maxItems', 'uniqueItems',
                    'minProperties', 'maxProperties', 'pattern',
                    'format', 'dependentRequired', 'minContains', 'maxContains',
                    'enum', 'const']) {
                    if (sch[key] !== void 0) siblingSchema[key] = sch[key];
                }
                parts.push(siblingSchema);
            }

            // Each composition keyword becomes its own sub-schema
            if (allOf !== void 0) parts.push({ allOf });
            if (anyOf !== void 0) parts.push({ anyOf });
            if (oneOf !== void 0) parts.push({ oneOf });
            if (notSchema !== void 0) parts.push({ not: notSchema });
            if (ifSchema !== void 0) {
                /** @type {Record<string, any>} */
                let ifPart = { if: ifSchema };
                if (sch.then !== void 0) ifPart.then = sch.then;
                if (sch.else !== void 0) ifPart.else = sch.else;
                parts.push(ifPart);
            }

            // Wrap in implicit allOf
            let edgeBase = astEdges.length;
            astKinds[nodeId] = N_INTERSECT;
            astChild0[nodeId] = edgeBase;
            astChild1[nodeId] = parts.length;

            for (let i = 0; i < parts.length; i++) {
                let slot = astEdges.length;
                astEdges.push(0);
                let partId = allocNode();
                pushFrame(parts[i], partId, LINK_EDGE, slot);
            }
            continue;
        }

        if (allOf !== void 0) {
            let edgeBase = astEdges.length;
            astKinds[nodeId] = N_INTERSECT;
            astChild0[nodeId] = edgeBase;
            astChild1[nodeId] = allOf.length;
            for (let i = 0; i < allOf.length; i++) {
                let slot = astEdges.length;
                astEdges.push(0); // placeholder
                let childId = allocNode();
                pushFrame(allOf[i], childId, LINK_EDGE, slot);
            }
            continue;
        }

        if (anyOf !== void 0) {
            let edgeBase = astEdges.length;
            astKinds[nodeId] = N_OR;
            astChild0[nodeId] = edgeBase;
            astChild1[nodeId] = anyOf.length;
            for (let i = 0; i < anyOf.length; i++) {
                let slot = astEdges.length;
                astEdges.push(0);
                let childId = allocNode();
                pushFrame(anyOf[i], childId, LINK_EDGE, slot);
            }
            continue;
        }

        if (oneOf !== void 0) {
            let edgeBase = astEdges.length;
            astKinds[nodeId] = N_EXCLUSIVE;
            astChild0[nodeId] = edgeBase;
            astChild1[nodeId] = oneOf.length;
            for (let i = 0; i < oneOf.length; i++) {
                let slot = astEdges.length;
                astEdges.push(0);
                let childId = allocNode();
                pushFrame(oneOf[i], childId, LINK_EDGE, slot);
            }
            continue;
        }

        if (notSchema !== void 0) {
            let childId = allocNode();
            astKinds[nodeId] = N_NOT;
            astChild0[nodeId] = childId;
            pushFrame(notSchema, childId, LINK_CHILD0, nodeId);
            continue;
        }

        if (ifSchema !== void 0) {
            let edgeBase = astEdges.length;
            astEdges.push(SENTINEL, SENTINEL, SENTINEL); // [if, then, else]
            astKinds[nodeId] = N_CONDITIONAL;
            astChild0[nodeId] = edgeBase;

            let ifId = allocNode();
            pushFrame(ifSchema, ifId, LINK_EDGE, edgeBase);

            let thenSchema = sch.then;
            if (thenSchema !== void 0) {
                let thenId = allocNode();
                pushFrame(thenSchema, thenId, LINK_EDGE, edgeBase + 1);
            }
            let elseSchema = sch.else;
            if (elseSchema !== void 0) {
                let elseId = allocNode();
                pushFrame(elseSchema, elseId, LINK_EDGE, edgeBase + 2);
            }
            continue;
        }

        // Empty schema {} → matches everything
        if (!hasType && !hasVHeader && !hasEnum && !hasProps && !hasItems
            && !hasAdditionalProps && !hasPatternProps && !hasPrefixItems) {
            astKinds[nodeId] = N_PRIM;
            astFlags[nodeId] = (ANY | NULLABLE) >>> 0;
            continue;
        }

        // Resolve single type string for structural dispatch
        let typeStr = null;
        if (hasType) {
            if (typeof typeVal === 'string') {
                typeStr = typeVal;
            } else if (Array.isArray(typeVal) && typeVal.length === 1) {
                typeStr = typeVal[0];
            }
        }

        // The node id where the "inner type" is written.
        let typeNodeId = nodeId;

        // ── Object structural node (properties / required / additionalProperties / patternProperties) ──
        if (hasProps || hasAdditionalProps || hasPatternProps) {
            let propObj = props || Object.create(null);
            let propKeys = Object.keys(propObj);
            let requiredSet = required ? new Set(required) : new Set();

            // Add required-only keys not already in properties
            if (required) {
                for (let i = 0; i < required.length; i++) {
                    let r = required[i];
                    if (!hasOwnProperty.call(propObj, r)) {
                        propKeys.push(r);
                    }
                }
            }

            let isExplicitObject = typeStr === 'object';
            let objNodeId;

            if (isExplicitObject) {
                objNodeId = typeNodeId;
            } else {
                // No explicit type → conditional guard:
                // if (is object) then (validate) else (pass)
                objNodeId = allocNode();
                let ifId = allocNode();
                astKinds[ifId] = N_BARE_OBJECT;

                let condBase = astEdges.length;
                astEdges.push(ifId, objNodeId, SENTINEL);
                astKinds[typeNodeId] = N_CONDITIONAL;
                astChild0[typeNodeId] = condBase;
            }

            // Write N_OBJECT on objNodeId
            let edgeBase = astEdges.length;
            astKinds[objNodeId] = N_OBJECT;
            astChild0[objNodeId] = edgeBase;
            astChild1[objNodeId] = propKeys.length;

            for (let i = 0; i < propKeys.length; i++) {
                let key = propKeys[i];
                let childSchema = hasOwnProperty.call(propObj, key) ? propObj[key] : true;
                let childId = allocNode();

                let nameIdx = propNames.length;
                propNames.push(key);

                astEdges.push(nameIdx);       // slot 0: name index
                let childSlot = astEdges.length;
                astEdges.push(0);             // slot 1: child node id (placeholder)
                astEdges.push(requiredSet.has(key) ? 0 : 1); // slot 2: flags

                pushFrame(childSchema, childId, LINK_EDGE, childSlot);
            }

            // additionalProperties: store child node id after property edges
            // astFlags bit 0 = has additionalProperties child
            let objVHeader = vHeader;
            if (hasAdditionalProps && additionalProps !== true) {
                if (additionalProps === false) {
                    objVHeader |= V_ADDITIONAL_PROPERTIES;
                } else {
                    // Schema → compile it, store as extra edge after properties
                    objVHeader |= V_ADDITIONAL_PROPERTIES;
                    astFlags[objNodeId] |= 1; // bit 0 = has additionalProperties child
                    let addChildId = allocNode();
                    let addSlot = astEdges.length;
                    astEdges.push(0); // placeholder
                    pushFrame(additionalProps, addChildId, LINK_EDGE, addSlot);
                }
            }

            // patternProperties: store [pattern, childNodeId] pairs after properties
            // astFlags bit 1 = has patternProperties children
            if (hasPatternProps) {
                let patKeys = Object.keys(patternProps);
                astFlags[objNodeId] |= 2; // bit 1 = has patternProperties
                // Store pattern count then [patternString, childNodeId] pairs
                astEdges.push(patKeys.length);
                for (let i = 0; i < patKeys.length; i++) {
                    let pat = patKeys[i];
                    let patNameIdx = propNames.length;
                    propNames.push(pat);
                    astEdges.push(patNameIdx); // pattern string index
                    let patChildId = allocNode();
                    let patSlot = astEdges.length;
                    astEdges.push(0); // placeholder for child node id
                    pushFrame(patternProps[pat], patChildId, LINK_EDGE, patSlot);
                }
            }

            // Attach validators (minProperties, maxProperties, etc.)
            if (objVHeader !== 0 || hasVHeader) {
                writeValidators(objNodeId, objVHeader, vPayloadArr);
            }
            continue;
        }

        // ── Tuple structural node (prefixItems) ──
        if (hasPrefixItems) {
            let isExplicitArray = typeStr === 'array';
            let tupleNodeId;

            if (isExplicitArray) {
                tupleNodeId = typeNodeId;
            } else {
                tupleNodeId = allocNode();
                let ifId = allocNode();
                astKinds[ifId] = N_BARE_ARRAY;

                let condBase = astEdges.length;
                astEdges.push(ifId, tupleNodeId, SENTINEL);
                astKinds[typeNodeId] = N_CONDITIONAL;
                astChild0[typeNodeId] = condBase;
            }

            // Write N_TUPLE: astChild0 = edge offset, astChild1 = prefix length
            // astFlags bit 0 = has items (rest type) child
            let edgeBase = astEdges.length;
            astKinds[tupleNodeId] = N_TUPLE;
            astChild0[tupleNodeId] = edgeBase;
            astChild1[tupleNodeId] = prefixItems.length;

            for (let i = 0; i < prefixItems.length; i++) {
                let slot = astEdges.length;
                astEdges.push(0); // placeholder
                let childId = allocNode();
                pushFrame(prefixItems[i], childId, LINK_EDGE, slot);
            }

            // items alongside prefixItems → rest type
            // JSON Schema: no `items` means any additional items are allowed (implicit ANY)
            if (hasItems) {
                astFlags[tupleNodeId] |= 1; // bit 0 = has rest type child
                let restSlot = astEdges.length;
                astEdges.push(0);
                let restChildId = allocNode();
                pushFrame(items, restChildId, LINK_EDGE, restSlot);
            } else {
                astFlags[tupleNodeId] |= 1;
                let anyRestId = allocNode();
                astKinds[anyRestId] = N_PRIM;
                astFlags[anyRestId] = (ANY | NULLABLE) >>> 0;
                astEdges.push(anyRestId);
            }

            if (hasVHeader) writeValidators(tupleNodeId, vHeader, vPayloadArr);
            continue;
        }

        // ── Array structural node (items) ──
        if (hasItems) {
            let isExplicitArray = typeStr === 'array';
            let arrNodeId;

            if (isExplicitArray) {
                arrNodeId = typeNodeId;
            } else {
                // No explicit type → conditional guard
                arrNodeId = allocNode();
                let ifId = allocNode();
                astKinds[ifId] = N_BARE_ARRAY;

                let condBase = astEdges.length;
                astEdges.push(ifId, arrNodeId, SENTINEL);
                astKinds[typeNodeId] = N_CONDITIONAL;
                astChild0[typeNodeId] = condBase;
            }

            // Write N_ARRAY on arrNodeId
            let elemId = allocNode();
            astKinds[arrNodeId] = N_ARRAY;
            astChild0[arrNodeId] = elemId;
            pushFrame(items, elemId, LINK_CHILD0, arrNodeId);

            // Attach validators (minItems, maxItems, uniqueItems, etc.)
            if (hasVHeader) writeValidators(arrNodeId, vHeader, vPayloadArr);
            continue;
        }

        // ── Pure type / validator node (no structural keywords) ──

        if (hasVHeader) writeValidators(typeNodeId, vHeader, vPayloadArr);

        if (hasType) {
            /**
             * Emit a single type string or type array as AST nodes.
             * Primitives map to N_PRIM with bitmask flags. Container types
             * ("array", "object") map to N_BARE_ARRAY / N_BARE_OBJECT since
             * they are complex-only types with no primitive bit representation.
             * Mixed type arrays with containers are wrapped in N_OR.
             */
            let typeArr = typeof typeVal === 'string' ? null : typeVal;
            let singleType = typeof typeVal === 'string' ? typeVal : (typeVal.length === 1 ? typeVal[0] : null);

            if (singleType !== null) {
                if (singleType === 'array') {
                    astKinds[typeNodeId] = N_BARE_ARRAY;
                } else if (singleType === 'object') {
                    astKinds[typeNodeId] = N_BARE_OBJECT;
                } else {
                    astKinds[typeNodeId] = N_PRIM;
                    astFlags[typeNodeId] = mapSingleTypePrim(singleType) >>> 0;
                }
            } else {
                // Type array with multiple entries — check for container types
                let hasContainer = false;
                let primMerged = 0;
                let hasArrayType = false;
                let hasObjectType = false;
                for (let i = 0; i < typeArr.length; i++) {
                    if (isContainerType(typeArr[i])) {
                        hasContainer = true;
                        if (typeArr[i] === 'array') {
                            hasArrayType = true;
                        } else {
                            hasObjectType = true;
                        }
                    } else {
                        primMerged |= mapSingleTypePrim(typeArr[i]);
                    }
                }
                if (!hasContainer) {
                    // All primitives — merge as before
                    astKinds[typeNodeId] = N_PRIM;
                    astFlags[typeNodeId] = primMerged >>> 0;
                } else {
                    // Mixed: wrap in N_OR (anyOf) with primitives + bare containers
                    let edgeBase = astEdges.length;
                    let branchCount = (primMerged !== 0 ? 1 : 0) + (hasArrayType ? 1 : 0) + (hasObjectType ? 1 : 0);
                    astKinds[typeNodeId] = N_OR;
                    astChild0[typeNodeId] = edgeBase;
                    astChild1[typeNodeId] = branchCount;

                    if (primMerged !== 0) {
                        let primId = allocNode();
                        astKinds[primId] = N_PRIM;
                        astFlags[primId] = primMerged >>> 0;
                        astEdges.push(primId);
                    }
                    if (hasArrayType) {
                        let arrId = allocNode();
                        astKinds[arrId] = N_BARE_ARRAY;
                        astEdges.push(arrId);
                    }
                    if (hasObjectType) {
                        let objId = allocNode();
                        astKinds[objId] = N_BARE_OBJECT;
                        astEdges.push(objId);
                    }
                }
            }
        } else if (hasEnum) {
            // Enum without explicit type keyword: use the type bits derived from enum values.
            // enumPrimBits holds STRING, NUMBER, TRUE, FALSE, NULLABLE as appropriate.
            astKinds[typeNodeId] = N_PRIM;
            astFlags[typeNodeId] = enumPrimBits >>> 0;
        } else {
            // Validators but no type → matches any type
            astKinds[typeNodeId] = N_PRIM;
            astFlags[typeNodeId] = (ANY | NULLABLE) >>> 0;
        }
    }

    // Phase 2: Resolve $ref nodes

    for (let [nodeId, uri] of unresolvedRefs) {
        let targetId = symbolTable.get(uri);
        if (targetId === undefined) {
            throw new Error('Unresolved $ref: ' + uri);
        }
        astChild0[nodeId] = targetId;
    }

    // Trim typed arrays to actual node count
    let nc = nextNodeId;

    return {
        astKinds: astKinds.subarray(0, nc),
        astFlags: astFlags.subarray(0, nc),
        astChild0: astChild0.subarray(0, nc),
        astChild1: astChild1.subarray(0, nc),
        astVHeaders: astVHeaders.subarray(0, nc),
        astVOffset: astVOffset.subarray(0, nc),
        astEdges: new Uint32Array(astEdges),
        vPayloads,
        propNames,
        callbacks,
        regexes,
        rootId,
        defIds,
        defNames,
        nodeCount: nc,
    };
}
