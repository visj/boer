import {
    ANY, NEVER, STRING, NUMBER, INTEGER, BOOLEAN, NULLABLE, OPTIONAL,
    V_MIN_LENGTH, V_MAX_LENGTH, V_PATTERN, V_FORMAT,
    V_MINIMUM, V_MAXIMUM, V_MULTIPLE_OF, V_EXCLUSIVE_MINIMUM, V_EXCLUSIVE_MAXIMUM,
    V_MIN_ITEMS, V_MAX_ITEMS, V_MIN_CONTAINS, V_MAX_CONTAINS, V_UNIQUE_ITEMS,
    V_MIN_PROPERTIES, V_MAX_PROPERTIES, V_DEPENDENT_REQUIRED,
    V_PATTERN_PROPERTIES, V_ADDITIONAL_PROPERTIES,
    V_ENUM, K_HAS_ITEMS,
    BOOL_ENUM_TRUE, BOOL_ENUM_FALSE,
    hasOwnProperty,
    isBoolean, isObject, isString,
    packValidators, PAYLOAD_QUEUE,
    N_PRIM, N_OBJECT, N_ARRAY, N_REFINE, N_BARE_ARRAY,
    N_BARE_OBJECT, N_OR, N_EXCLUSIVE, N_INTERSECT,
    N_NOT, N_CONDITIONAL, N_TUPLE, N_DYN_ANCHOR,
    N_DYN_REF, N_UNEVALUATED, N_REF,
    AST_FLAG_HAS_ADDITIONAL_PROPS, AST_FLAG_HAS_PATTERN_PROPS,
    AST_FLAG_HAS_PROPERTY_NAMES, AST_FLAG_HAS_DEPENDENT_SCHEMAS,
    AST_FLAG_HAS_REST, AST_FLAG_HAS_CONTAINS, AST_FLAG_HAS_ITEMS,
    AST_FLAG_UNEVAL_MODE_ITEMS
} from '@luvd/core';
import { resolve } from "uri-js";

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

/**
 * Scalar-type validators: apply to strings, numbers, and arrays regardless of
 * whether the schema also has object structural keywords (properties, etc.).
 * When a schema mixes these with structural keywords but has no explicit
 * `type: "object"`, we split them into a separate N_PRIM branch so they fire
 * for any data type, not just objects.
 */
const PRIM_ONLY_V = V_MIN_LENGTH | V_MAX_LENGTH | V_PATTERN
    | V_MINIMUM | V_MAXIMUM | V_MULTIPLE_OF | V_EXCLUSIVE_MINIMUM | V_EXCLUSIVE_MAXIMUM
    | V_MIN_ITEMS | V_MAX_ITEMS | V_MIN_CONTAINS | V_MAX_CONTAINS | V_UNIQUE_ITEMS;

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
/** Writes astChild1[linkOffset] = nodeId. Used for contains child on N_ARRAY. */
const LINK_CHILD1 = 4;

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

// ────────────────────────────────────────────────────────────────────────────
// JSON Schema Dialect Support
// ────────────────────────────────────────────────────────────────────────────

/** Supported JSON Schema draft versions as integer enum. */
const DRAFT_4 = 0;
const DRAFT_6 = 1;
const DRAFT_7 = 2;
const DRAFT_2019 = 3;
const DRAFT_2020 = 4;

/** Keywords whose values are data payloads, not sub-schemas. Never recurse into these. */
const WALK_SKIP_KEYS = new Set(['const', 'enum', 'default', 'examples', '$vocabulary']);

/**
 * Keywords whose values are string → schema maps (property containers).
 * When walkSchema encounters one of these, it must iterate the container's
 * VALUES as schemas rather than walking the container object itself.
 * Walking the container directly would call transpile() on it, which would
 * mistake the property names (e.g. "dependencies") for schema keywords.
 */
const WALK_CONTAINER_KEYS = new Set([
    'properties', 'patternProperties',
    '$defs', 'definitions',
    'dependentSchemas',
]);

/**
 * Vocabulary groups for draft2020-12 and draft2019-09.
 *
 * Each entry has:
 *   uris — all known vocabulary URIs (across drafts) that represent this logical
 *          vocabulary. If ANY of them appears as a key in a metaschema's $vocabulary
 *          (regardless of value — true/false both mean "present"), the vocabulary is
 *          considered enabled and its keywords are NOT stripped.
 *   keys — keywords defined by this vocabulary.
 *
 * The `core` vocabulary ($id, $ref, $defs, …) is intentionally excluded: the spec
 * mandates that implementations always assume core, so its keywords must never be
 * stripped even from schemas with a custom metaschema.
 *
 * `unevaluatedItems`/`unevaluatedProperties` moved from applicator (2019-09) to a
 * separate `unevaluated` vocabulary in 2020-12.  We cover both placements by listing
 * both the 2020-12 `unevaluated` URI *and* the 2019-09 `applicator` URI under the
 * unevaluated group.  That way, a 2019-09 metaschema that includes applicator still
 * protects those keywords from being stripped.
 *
 * format-annotation and format-assertion are mutually-exclusive alternatives for the
 * `format` keyword.  All three URIs (2020 annotation, 2020 assertion, 2019 format) are
 * listed under one group so that including *any* of them prevents `format` from being
 * stripped.
 */
const VOCAB_GROUPS = [
    {
        uris: [
            'https://json-schema.org/draft/2020-12/vocab/applicator',
            'https://json-schema.org/draft/2019-09/vocab/applicator',
        ],
        keys: new Set([
            // 2020-12 and 2019-09 shared applicator keywords
            'items', 'contains',
            'additionalProperties', 'properties', 'patternProperties',
            'dependentSchemas', 'propertyNames',
            'if', 'then', 'else',
            'allOf', 'anyOf', 'oneOf', 'not',
            // 2020-12 only (prefixItems replaces array-form items)
            'prefixItems',
            // 2019-09 only
            'additionalItems',
        ]),
    },
    {
        // unevaluatedItems/unevaluatedProperties moved out of applicator in 2020-12.
        // The 2019-09 applicator URI is also listed so that a 2019-09 metaschema
        // that declares applicator implicitly covers these keywords.
        uris: [
            'https://json-schema.org/draft/2020-12/vocab/unevaluated',
            'https://json-schema.org/draft/2019-09/vocab/applicator',
        ],
        keys: new Set([
            'unevaluatedItems', 'unevaluatedProperties',
        ]),
    },
    {
        uris: [
            'https://json-schema.org/draft/2020-12/vocab/validation',
            'https://json-schema.org/draft/2019-09/vocab/validation',
        ],
        keys: new Set([
            'type', 'const', 'enum',
            'multipleOf', 'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum',
            'maxLength', 'minLength', 'pattern',
            'maxItems', 'minItems', 'uniqueItems', 'maxContains', 'minContains',
            'maxProperties', 'minProperties', 'required', 'dependentRequired',
        ]),
    },
    {
        uris: [
            'https://json-schema.org/draft/2020-12/vocab/meta-data',
            'https://json-schema.org/draft/2019-09/vocab/meta-data',
        ],
        keys: new Set([
            'title', 'description', 'deprecated', 'readOnly', 'writeOnly',
            // 'default' and 'examples' live in WALK_SKIP_KEYS and are never compiled,
            // so stripping them here is a no-op — but correct per spec.
        ]),
    },
    {
        // format-annotation (2020-12), format-assertion (2020-12) and format (2019-09)
        // are all alternatives for the same keyword.  Any one of them counts.
        uris: [
            'https://json-schema.org/draft/2020-12/vocab/format-annotation',
            'https://json-schema.org/draft/2020-12/vocab/format-assertion',
            'https://json-schema.org/draft/2019-09/vocab/format',
        ],
        keys: new Set(['format']),
    },
    {
        uris: [
            'https://json-schema.org/draft/2020-12/vocab/content',
            'https://json-schema.org/draft/2019-09/vocab/content',
        ],
        keys: new Set([
            'contentEncoding', 'contentMediaType', 'contentSchema',
        ]),
    },
];

/**
 * Transpiles legacy JSON Schema drafts into Draft 2020-12 format in-place.
 * @param {Schema} schema - The schema object to mutate.
 * @param {number} dialect - The dialect constant (e.g., DRAFT_7).
 */
function transpile(schema, dialect) {
    // 1. Draft 2019-09 and older (DRAFT_2019, 7, 6, 4)
    // Desugar array tuples: `items` (array) + `additionalItems` -> `prefixItems` + `items`
    // When additionalItems is absent, we omit `items` entirely so that extra items
    // remain "unevaluated" — allowing `unevaluatedItems: false` to reject them.
    if (dialect <= DRAFT_2019) {
        if (Array.isArray(schema.items)) {
            schema.prefixItems = schema.items;
            schema.items = schema.additionalItems !== void 0 ? schema.additionalItems : void 0;
            schema.additionalItems = void 0;
        }
    }

    // 1.5. Draft 2019-09 only: translate $recursiveRef/$recursiveAnchor to
    // $dynamicRef/$dynamicAnchor so the 2020-12 compiler handles them.
    // $recursiveAnchor: true  → $dynamicAnchor: "recursive" (fixed name).
    // $recursiveRef: "#"      → $dynamicRef: "#recursive" so the fragment
    //   is non-empty and non-pointer, making isDynamic = true in the bundler.
    //   An empty fragment ("#") would set isDynamic = false and degrade to a
    //   plain root $ref, losing all recursive-anchor semantics.
    if (dialect === DRAFT_2019) {
        /** @type {Record<string,any>} */
        let s = (schema);
        if (s.$recursiveAnchor === true) {
            schema.$dynamicAnchor = 'recursive';
            s.$recursiveAnchor = void 0;
        } else if (s.$recursiveAnchor === false) {
            s.$recursiveAnchor = void 0;
        }
        if (isString(s.$recursiveRef)) {
            // $recursiveRef is always "#" per spec — map to "#recursive" so the
            // named fragment triggers dynamic lookup against $dynamicAnchor: "recursive".
            schema.$dynamicRef = '#recursive';
            s.$recursiveRef = void 0;
        }
    }

    // 2. $ref path rewriting and sibling stripping.
    // Path rewrites: /definitions/ → /$defs/ and /items/N → /prefixItems/N in $ref fragments.
    // Sibling stripping (draft7 and older only): in these drafts, $ref overrides all siblings.
    if (isString(schema.$ref)) {
        let ref = schema.$ref;
        let hashIdx = ref.indexOf('#');
        if (hashIdx !== -1) {
            let fragment = ref.slice(hashIdx + 1);
            if (dialect <= DRAFT_7) {
                // /definitions/ → /$defs/ since definitions was renamed
                fragment = fragment.replace(/\/definitions\//g, '/$defs/');
            }
            // /items/N → /prefixItems/N since array-form items was renamed to prefixItems
            fragment = fragment.replace(/\/items\/(\d+)/g, '/prefixItems/$1');
            schema.$ref = ref.slice(0, hashIdx + 1) + fragment;
        }
        if (dialect <= DRAFT_7) {
            // In draft7 and older, $ref completely ignores sibling keywords.
            for (let key in schema) {
                if (key !== '$ref') {
                    delete /** @type {Record<string,any>} */(schema)[key];
                }
            }
            return;
        }
    }

    // 3. Draft 7 and older (DRAFT_7, 6, 4) — only reached when no $ref early-return above.
    if (dialect <= DRAFT_7) {
        // Desugar dependencies -> dependentRequired / dependentSchemas
        if (schema.dependencies !== void 0) {
            /**
             * @type {Record<string, Array<string> | ReadonlyArray<string>> | undefined}
             */
            let depReq;
            /**
             * @type {Record<string, JSONSchema> | undefined}
             */
            let depSch;

            for (let k in schema.dependencies) {
                let v = schema.dependencies[k];
                if (Array.isArray(v)) {
                    if (depReq === void 0) {
                        depReq = {};
                    }
                    depReq[k] = v;
                } else {
                    if (depSch === void 0) {
                        depSch = {};
                    }
                    depSch[k] = /** @type {JSONSchema} */(v);
                }
            }

            schema.dependencies = void 0;
            if (depReq !== void 0) schema.dependentRequired = depReq;
            if (depSch !== void 0) schema.dependentSchemas = depSch;
        }

        // Rename definitions -> $defs
        if (schema.definitions !== void 0) {
            schema.$defs = schema.definitions;
            schema.definitions = void 0;
        }
    }

    // 5. Draft 4 only (DRAFT_4)
    if (dialect === DRAFT_4) {
        // Rename id -> $id
        // @ts-ignore
        if (schema.id !== void 0 && typeof schema.id === 'string') {
            //@ts-ignore
            schema.$id = schema.id;
            //@ts-ignore
            schema.id = void 0;
        }

        // Desugar boolean exclusive limits into numeric exclusive limits
        //@ts-ignore
        if (schema.exclusiveMinimum === true && schema.minimum !== void 0) {
            schema.exclusiveMinimum = schema.minimum;
            schema.minimum = void 0;
            //@ts-ignore
        } else if (schema.exclusiveMinimum === false) {
            schema.exclusiveMinimum = void 0;
        }
        //@ts-ignore
        if (schema.exclusiveMaximum === true && schema.maximum !== void 0) {
            schema.exclusiveMaximum = schema.maximum;
            schema.maximum = void 0;
            //@ts-ignore
        } else if (schema.exclusiveMaximum === false) {
            schema.exclusiveMaximum = void 0;
        }
    }
}

/**
 * Maps a JSON Schema `$schema` URI to a dialect enum constant.
 * Defaults to DRAFT_2020 for unknown or absent URIs.
 * @param {string | null | undefined} uri
 * @returns {number}
 */
function getDialect(uri) {
    if (!isString(uri) || uri.length === 0) {
        return DRAFT_2020;
    }
    if (uri.includes('draft7') || uri.includes('draft-07')) {
        return DRAFT_7;
    }
    if (uri.includes('draft6') || uri.includes('draft-06')) {
        return DRAFT_6;
    }
    if (uri.includes('draft4') || uri.includes('draft-04')) {
        return DRAFT_4;
    }
    if (uri.includes('2019-09')) {
        return DRAFT_2019;
    }
    return DRAFT_2020;
}

// ────────────────────────────────────────────────────────────────────────────
// CompoundSchema — multi-schema container for bundle parsing
// ────────────────────────────────────────────────────────────────────────────

/**
 * Holds one or more related JSON Schemas and compiles them together into a
 * single FlatAst, enabling cross-schema $ref resolution and per-schema
 * dialect desugaring.
 *
 * @constructor
 * @param {string=} dialect — default dialect URI for schemas without $schema
 */
function CompoundSchema(dialect) {
    /** @type {Array<JSONSchema>} */
    this.schemas = [];
    /** @type {Array<string|null>} */
    this.names = [];
    /** @type {number} */
    this.count = 0;
    /** @type {number} — default dialect for schemas without a $schema keyword */
    this.defaultDialect = getDialect(dialect);
    /** @type {Array<string>} */
    this.baseUris = [];
    /** @type {Map<string, JSONSchema>} — Maps Absolute URI → Raw JS Schema Object */
    this.uriRegistry = new Map();
    /** @type {Map<string, Set<string>>} — Maps $dynamicAnchor name → Set of Absolute URIs */
    this.dynamicAnchors = new Map();
    /** @type {Map<string, Map<string, string>>} — Maps resource URI → Map of anchorName → anchor base URI */
    this.dynamicAnchorsByResource = new Map();
}

/**
 * Adds a schema to this compound. The optional second argument is a friendly
 * name used as the key in the `roots` record returned by compile().
 * Dialect detection and URI registration happen lazily during bundle() via
 * runPreScan — this method only stores the schema and name.
 *
 * @param {JSONSchema} schema
 * @param {string=} id
 * @param {string=} name
 * @returns {number} index in this.schemas (pass to bundle() to request compilation)
 */
CompoundSchema.prototype.add = function (schema, id, name) {
    if (isBoolean(schema) || isObject(schema)) {
        const index = this.count++;
        if (isString(id)) {
            // Strip a trailing bare `#` so registry lookups by base document URI work.
            let normalizedId = normalizeUri(id);
            this.uriRegistry.set(normalizedId, schema);
            this.baseUris[index] = normalizedId;
        } else {
            this.baseUris[index] = '';
        }
        this.schemas[index] = schema;
        this.names[index] = name || null;
        return index;
    }
    throw new Error('Invalid schema');
};

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

// ────────────────────────────────────────────────────────────────────────────
// Pre-Scan Phase — Tier 1 of the Multi-Tier JIT Resolver
// ────────────────────────────────────────────────────────────────────────────
//
// runPreScan walks the entire schema tree before AST compilation begins. It:
//   1. Detects per-node dialect from $schema and updates the active dialect.
//   2. Calls transpile() to upgrade legacy drafts to 2020-12 in-place.
//   3. Resolves $id values to absolute URIs and registers them in uriRegistry.
//   4. Registers $anchor fragments in uriRegistry as baseUri#anchorName.
//   5. Registers $dynamicAnchor names in dynamicAnchors.
//
// Because transpile() is destructive, the schemas in compound.schemas are
// permanently mutated. Callers who need the originals must structuredClone
// before passing to CompoundSchema.add().

/**
 * Depth-first recursive walker used by runPreScan.
 * @param {CompoundSchema} compound
 * @param {JSONSchema} obj
 * @param {string} baseUri absolute URI context inherited from parent scope
 * @param {number} dialect DRAFT_* constant inherited from parent scope
 * @param {string} resourceUri absolute URI of the nearest ancestor schema resource ($id)
 * @param {Set<string>|null} [stripKeys] keywords to delete from every schema in this
 *   resource (derived from a custom metaschema that omits certain vocabularies)
 */
function walkSchema(compound, obj, baseUri, dialect, resourceUri, stripKeys) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return;
    }

    // A $schema keyword inside a sub-schema changes the active dialect for
    // that sub-tree. This handles embedded schemas with differing drafts.
    if (isString(obj.$schema)) {
        dialect = getDialect(obj.$schema);
        // Each schema resource with a $schema declaration starts fresh: recompute
        // the strip-set from scratch, overwriting any set inherited from a parent.
        // This is correct per spec §8.1.2.2 — vocabularies are non-inheritable.
        //
        // Algorithm:
        //   1. Find the metaschema in the registry (it must be a pre-registered remote).
        //   2. If it has a $vocabulary map, walk VOCAB_GROUPS.
        //   3. For each group, if NONE of its vocabulary URIs appears as a key in the
        //      $vocabulary map (regardless of the boolean value — both true and false
        //      mean "this vocabulary is in use"), add all of the group's keywords to
        //      the strip set so they are deleted before compilation.
        //   4. If no $vocabulary is found (or the metaschema is not in the registry),
        //      assume full vocabulary — set stripKeys to null (no stripping).
        let newStripKeys = null;
        let metaObj = compound.uriRegistry.get(obj.$schema);
        if (metaObj !== void 0 && typeof metaObj === 'object' && metaObj !== null
            && typeof metaObj.$vocabulary === 'object' && metaObj.$vocabulary !== null) {
            let vocab = metaObj.$vocabulary;
            for (let gi = 0; gi < VOCAB_GROUPS.length; gi++) {
                let group = VOCAB_GROUPS[gi];
                // Check whether ANY of this group's URIs is declared in $vocabulary.
                let present = false;
                for (let ui = 0; ui < group.uris.length; ui++) {
                    if (group.uris[ui] in vocab) {
                        present = true;
                        break;
                    }
                }
                if (!present) {
                    // This logical vocabulary is absent → strip all its keywords.
                    if (newStripKeys === null) {
                        newStripKeys = new Set();
                    }
                    for (let k of group.keys) {
                        newStripKeys.add(k);
                    }
                }
            }
        }
        stripKeys = newStripKeys;
    }

    // Strip disallowed keywords before transpile so that legacy forms (e.g.
    // draft-4 boolean exclusiveMinimum) are never processed as validation.
    if (stripKeys !== void 0 && stripKeys !== null) {
        for (let k of stripKeys) {
            if (hasOwnProperty.call(obj, k)) {
                /** @type {Record<string,any>} */(obj)[k] = void 0;
            }
        }
    }

    // Transpile legacy keywords to their Draft 2020-12 equivalents in-place.
    if (dialect !== DRAFT_2020) {
        transpile(obj, dialect);
    }

    // After transpile, $id is canonical (Draft 4 `id` has been renamed to $id).
    const id = obj.$id;
    if (isString(id)) {
        baseUri = normalizeUri(resolve(baseUri, id));
        resourceUri = baseUri;
        compound.uriRegistry.set(baseUri, obj);
    }

    // $anchor creates a plain-name fragment — store as baseUri#anchorName.
    if (isString(obj.$anchor)) {
        compound.uriRegistry.set(baseUri + '#' + obj.$anchor, obj);
    }

    // $dynamicAnchor registers the anchor name in the dynamic scope map
    // and associates it with the owning schema resource for bookending checks.
    if (isString(obj.$dynamicAnchor)) {
        compound.uriRegistry.set(baseUri + '#' + obj.$dynamicAnchor, obj);
        let uriSet = compound.dynamicAnchors.get(obj.$dynamicAnchor);
        if (uriSet === void 0) {
            uriSet = new Set();
            compound.dynamicAnchors.set(obj.$dynamicAnchor, uriSet);
        }
        uriSet.add(baseUri);

        // Track which resource owns this dynamic anchor
        let resMap = compound.dynamicAnchorsByResource.get(resourceUri);
        if (resMap === void 0) {
            resMap = new Map();
            compound.dynamicAnchorsByResource.set(resourceUri, resMap);
        }
        resMap.set(obj.$dynamicAnchor, baseUri);
    }

    // Recurse into every child value that is an object or an array of objects.
    // Skip data-value keywords whose contents are user data, not sub-schemas.
    // For container keywords (properties, $defs, etc.) iterate the VALUES as schemas
    // rather than walking the container object itself. This prevents transpile() from
    // being called on the container, where user-chosen property names (e.g. "dependencies")
    // could be mistaken for schema keywords and corrupted.
    for (let key in obj) {
        if (WALK_SKIP_KEYS.has(key)) {
            continue;
        }
        let val = /** @type {Record<string,any>} */(obj)[key];
        if (typeof val === 'object' && val !== null) {
            if (Array.isArray(val)) {
                for (let i = 0; i < val.length; i++) {
                    walkSchema(compound, val[i], baseUri, dialect, resourceUri, stripKeys);
                }
            } else if (WALK_CONTAINER_KEYS.has(key)) {
                // val is a string→schema map; walk each value as a schema
                for (let subKey in val) {
                    walkSchema(compound, val[subKey], baseUri, dialect, resourceUri, stripKeys);
                }
            } else {
                walkSchema(compound, val, baseUri, dialect, resourceUri, stripKeys);
            }
        }
    }
}

/**
 *
 * @param {string} baseUri
 * @param {string} refString
 * @returns {string}
 */
function resolveUri(baseUri, refString) {
    if (baseUri === '') {
        return refString;
    }
    // TODO we will drop this dependency in the future
    return resolve(baseUri, refString);
}

/**
 * Strips a trailing bare `#` from a URI string.
 * Draft 4/6/7 meta-schemas use `$id` / `id` values ending in `#`
 * (e.g. `"http://json-schema.org/draft-07/schema#"`). After normalization
 * all stored URIs are fragment-free, so lookup by the base document URI
 * (`absoluteUri.substring(0, hashIdx)`) always succeeds.
 * @param {string} uri
 * @returns {string}
 */
function normalizeUri(uri) {
    if (uri.length > 0 && uri.charCodeAt(uri.length - 1) === 35 /* '#' */) {
        return uri.slice(0, -1);
    }
    return uri;
}

/**
 * Walks a raw JS object using a JSON Pointer fragment.
 * @param {JSONSchema} rootObj - The root schema object.
 * @param {string} fragment - The pointer string (e.g., "/$defs/User" or "foo").
 * @returns {JSONSchema | undefined} The target schema object, or undefined if not found.
 */
function resolvePointer(rootObj, fragment) {
    // JSON Pointers usually start with a slash (e.g., `#/properties/name`).
    // If it starts with a slash, slice it off so we don't get an empty first segment.
    let path = fragment.charCodeAt(0) === 47 ? fragment.slice(1) : fragment;
    if (path === "") {
        return rootObj;
    }

    let parts = path.split('/');
    /** @type {Record<string, any>} */
    let current = /** @type {Record<string, any>} */(rootObj);

    for (let i = 0; i < parts.length; i++) {
        // 1. Unescape JSON Pointer special characters
        // 2. URI decode in case of percent-encoding (e.g., %20)
        let key = decodeURIComponent(parts[i].replace(/~1/g, '/').replace(/~0/g, '~'));
        current = current[key];
        if (current == null) {
            return void 0;
        }
    }

    return current;
}

/**
 * Like resolvePointer, but also tracks any $id changes encountered along the
 * pointer path so the effective base URI for the target schema is returned.
 * This is necessary when a JSON Pointer traverses through a sub-schema that
 * carries its own $id (a schema resource boundary), because relative $refs
 * inside the target must be resolved against that sub-resource's base URI.
 * @param {JSONSchema} rootObj
 * @param {string} fragment
 * @param {string} rootBaseUri
 * @returns {{obj: JSONSchema | undefined, baseUri: string}}
 */
function resolvePointerTracked(rootObj, fragment, rootBaseUri) {
    let path = fragment.charCodeAt(0) === 47 ? fragment.slice(1) : fragment;
    if (path === "") {
        return { obj: rootObj, baseUri: rootBaseUri };
    }
    let parts = path.split('/');
    /** @type {Record<string, any>} */
    let current = /** @type {Record<string, any>} */(rootObj);
    let baseUri = rootBaseUri;
    for (let i = 0; i < parts.length; i++) {
        let key = decodeURIComponent(parts[i].replace(/~1/g, '/').replace(/~0/g, '~'));
        current = current[key];
        if (current == null) {
            return { obj: void 0, baseUri: baseUri };
        }
        // Track $id changes at each step — each $id defines a new schema resource boundary.
        if (isString(current.$id)) {
            baseUri = normalizeUri(resolve(baseUri, current.$id));
        }
    }
    return { obj: current, baseUri: baseUri };
}

/**
 * Runs the Tier 1 pre-scan over all schemas in the compound. Populates
 * compound.uriRegistry and compound.dynamicAnchors, and transpiles every
 * schema object to Draft 2020-12 in-place.
 * @param {CompoundSchema} compound
 */
function runPreScan(compound) {
    for (let si = 0; si < compound.count; si++) {
        const baseUri = compound.baseUris[si];
        walkSchema(compound, compound.schemas[si], baseUri, compound.defaultDialect, '');
    }
}

/**
 * Compiles the schemas added via `.add()` into a single FlatAst. The
 * `schemas` argument is one or more indices (returned by `.add()`) that
 * designate the entry-point schemas whose roots are exposed in the final
 * `roots` record. All other schemas in the compound are parsed as context
 * (providing $defs and $ref targets) but are not exposed as roots.
 *
 * @param {number | number[]} schemas — entry-point schema index or indices
 * @returns {uvd.FlatAst}
 */
CompoundSchema.prototype.bundle = function (schemas) {
    /** @type {number[]} */
    const entries = typeof schemas === 'number' ? [schemas] : schemas;
    const entriesCount = entries.length;
    // Tier 1: transpile all schemas to Draft 2020-12 in-place and populate
    // uriRegistry / dynamicAnchors before any AST nodes are allocated.
    runPreScan(this);

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

    let nextNodeId = 0;

    // ── Explicit parse stack (parallel arrays) ──
    /**
     * @type {Array<JSONSchema | null>}
     */
    let frameSchema = new Array(MAX_DEPTH);
    let frameNodeId = new Uint32Array(MAX_DEPTH);
    let frameLinkType = new Uint8Array(MAX_DEPTH);
    let frameLinkOffset = new Uint32Array(MAX_DEPTH);
    /**
     * @type {Array<string>}
     */
    let frameBaseUri = new Array(MAX_DEPTH)
    /** @type {Array<JSONSchema>} */
    let frameDocRoot = new Array(MAX_DEPTH);
    let tail = 0;

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
     * @param {JSONSchema} schemaObj
     * @param {number} nodeId
     * @param {number} linkType
     * @param {number} linkOffset
     * @param {string} baseUri
     * @param {JSONSchema} root
     */
    function pushFrame(schemaObj, nodeId, linkType, linkOffset, baseUri, root) {
        frameSchema[tail] = schemaObj;
        frameNodeId[tail] = nodeId;
        frameLinkType[tail] = linkType;
        frameLinkOffset[tail] = linkOffset;
        frameBaseUri[tail] = baseUri;
        frameDocRoot[tail] = root;
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
            case LINK_CHILD1:
                astChild1[linkOffset] = nodeId;
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
    /**
     * We only push the input schemas onto the stack
     * The base schemas are resolved lazily if we encounter them
     * through a $ref in any of the input schemas
     */

    /** @type {number[]} */
    let schemaRootIds = new Array(entries.length);
    for (let i = 0; i < entriesCount; i++) {
        let si = entries[i];
        let rid = allocNode();
        schemaRootIds[si] = rid;

        let schema = this.schemas[si];
        let baseUri = "";
        let docRoot = schema; // Boolean schemas act as their own document root

        // Only objects can have an $id or act as a parent for fragments
        if (typeof schema === 'object' && schema !== null) {
            if (schema.$id !== void 0) {
                baseUri = resolveUri('', schema.$id);
            }
        }

        pushFrame(schema, rid, LINK_ROOT, 0, baseUri, docRoot);
    }

    /**
     * @type {Map<string, number>}
     */
    let compiledUris = new Map();

    /**
     * Set of node IDs that are "inner" nodes of a N_DYN_ANCHOR wrapper.
     * These must not be re-wrapped when the parser encounters their $id.
     * @type {Set<number>}
     */
    let dynAnchorInnerSet = new Set();

    // Phase 1: Iterative depth-first parse
    while (tail > 0) {
        tail--;
        let schema = frameSchema[tail];
        let nodeId = frameNodeId[tail];
        let linkType = frameLinkType[tail];
        let linkOffset = frameLinkOffset[tail];

        // Release reference so the schema object can be GC'd
        frameSchema[tail] = null;

        // Wire this node into its parent
        writeLink(linkType, linkOffset, nodeId);

        // ── Boolean schemas ──
        if (schema === true) {
            astKinds[nodeId] = N_PRIM;
            astFlags[nodeId] = (ANY | NULLABLE) >>> 0;
            continue;
        }
        if (schema === false) {
            astKinds[nodeId] = N_PRIM;
            astFlags[nodeId] = NEVER;
            continue;
        }

        if (schema === null || typeof schema !== 'object') {
            throw new Error('Compiler error')
        }

        // ── Composition keywords ──

        let currentBaseUri = frameBaseUri[tail];
        let currentDocRoot = frameDocRoot[tail];
        if (isString(schema.$id)) {
            let nextBaseUri = normalizeUri(resolveUri(currentBaseUri, schema.$id));

            // 1. Structural traversal: Resolving the $id against the parent's base URI
            // perfectly matches the canonical URI registered by walkSchema.
            if (this.uriRegistry.get(nextBaseUri) === schema) {
                currentBaseUri = nextBaseUri;
            }
            // 2. $ref traversal: We jumped here directly via a $ref, meaning
            // currentBaseUri was passed in by pushFrame and is ALREADY the canonical URI!
            else if (this.uriRegistry.get(currentBaseUri) === schema) {
                // Do nothing to currentBaseUri. We prevent the double resolution!
            }
            // 3. Fallback safeguard
            else {
                currentBaseUri = nextBaseUri;
            }
            currentDocRoot = schema;
        }

        // ── N_DYN_ANCHOR wrapping ──
        // If this schema resource ($id) owns dynamic anchors, wrap it in a
        // N_DYN_ANCHOR node that will push a scope boundary at runtime.
        if (isString(schema.$id) && !dynAnchorInnerSet.has(nodeId)) {
            let anchorMap = this.dynamicAnchorsByResource.get(currentBaseUri);
            if (anchorMap !== void 0 && anchorMap.size > 0) {
                astKinds[nodeId] = N_DYN_ANCHOR;
                let innerId = allocNode();
                dynAnchorInnerSet.add(innerId);
                astChild0[nodeId] = innerId;

                let edgeBase = astEdges.length;
                let pairCount = 0;
                for (let [anchorName, anchorBaseUri] of anchorMap) {
                    let anchorUri = anchorBaseUri + '#' + anchorName;
                    let anchorSchema = this.uriRegistry.get(anchorUri);
                    if (anchorSchema === void 0) {
                        continue;
                    }
                    let targetId = compiledUris.get(anchorUri);
                    if (targetId === void 0) {
                        targetId = allocNode();
                        compiledUris.set(anchorUri, targetId);
                        // Prevent the anchor target from being re-wrapped as N_DYN_ANCHOR
                        // (it may be the same schema object as the resource root)
                        dynAnchorInnerSet.add(targetId);
                        pushFrame(anchorSchema, targetId, LINK_DEF, 0, anchorBaseUri, currentDocRoot);
                    }
                    let nameIdx = virtualLookup(anchorName);
                    astEdges.push(nameIdx);
                    astEdges.push(targetId);
                    pairCount++;
                }
                astChild1[nodeId] = pairCount;
                astFlags[nodeId] = edgeBase;

                // Re-parse this same schema object as the inner node
                pushFrame(schema, innerId, LINK_CHILD0, nodeId, currentBaseUri, currentDocRoot);
                continue;
            }
        }

        let refStr = schema.$ref;
        const hasRef = isString(refStr);
        let dynRefStr = schema.$dynamicRef;
        const hasDynRef = isString(dynRefStr);
        let allOf = schema.allOf;
        let anyOf = schema.anyOf;
        let oneOf = schema.oneOf;
        let notSchema = schema.not;
        let ifSchema = schema.if;
        let hasComposition = allOf !== void 0 || anyOf !== void 0 || oneOf !== void 0
            || notSchema !== void 0 || ifSchema !== void 0 || hasRef || hasDynRef;
        // Count how many composition keywords are present
        let compositionCount = (allOf !== void 0 ? 1 : 0) + (anyOf !== void 0 ? 1 : 0)
            + (oneOf !== void 0 ? 1 : 0) + (notSchema !== void 0 ? 1 : 0)
            + (ifSchema !== void 0 ? 1 : 0) + (hasRef ? 1 : 0) + (hasDynRef ? 1 : 0);

        // ── Type + validators + structural keywords ──

        /** @type {number[]} */
        let result = packValidators(schema, SCHEMA_PURE_MASK, virtualLookup);
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
        let constVal = schema.const;
        let enumValues = schema.enum;
        if (constVal !== void 0 && enumValues === void 0) {
            enumValues = [constVal];
        }
        const hasEnum = enumValues !== void 0;

        /** Accumulated primitive type bits from enum values. */
        let enumPrimBits = 0;
        /** Track boolean enum values separately since TRUE/FALSE no longer exist as bit constants. */
        let hasTrueEnum = false;
        let hasFalseEnum = false;
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
            for (let i = 0; i < /** @type {any[]} */(enumValues).length; i++) {
                let v = /** @type {any[]} */(enumValues)[i];
                if (v === null) {
                    enumPrimBits |= NULLABLE;
                } else if (v === true) {
                    hasTrueEnum = true;
                } else if (v === false) {
                    hasFalseEnum = true;
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
                    /** @type {Record<string,any>} */
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
                    if (hasTrueEnum) { primEnum.push(true); }
                    if (hasFalseEnum) { primEnum.push(false); }
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
                    pushFrame(branches[i], childId, LINK_EDGE, slot, currentBaseUri, currentDocRoot);
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
            if (enumStrings.length > 0 || enumNumbers.length > 0 || hasTrueEnum || hasFalseEnum) {
                if (enumStrings.length > 0) { enumPrimBits |= STRING; }
                if (enumNumbers.length > 0) { enumPrimBits |= NUMBER; }
                if (hasTrueEnum || hasFalseEnum) { enumPrimBits |= BOOLEAN; }
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
                if (hasTrueEnum || hasFalseEnum) {
                    /**
                     * Boolean segment: single bitmask value.
                     * Bit 0 = true is in enum, bit 1 = false is in enum.
                     */
                    let boolMask = 0;
                    if (hasTrueEnum) { boolMask |= BOOL_ENUM_TRUE; }
                    if (hasFalseEnum) { boolMask |= BOOL_ENUM_FALSE; }
                    vPayloadArr.push(boolMask);
                }
            }
            // enumPrimBits now holds NULLABLE/STRING/NUMBER bits from enum values.
            // Boolean enum values are tracked via hasTrueEnum/hasFalseEnum.
        }

        let typeVal = schema.type;
        const hasType = typeVal !== void 0;
        let hasVHeader = vHeader !== 0;

        let props = schema.properties;
        let required = schema.required;
        let items = schema.items;
        let additionalProps = schema.additionalProperties;
        let patternProps = schema.patternProperties;
        let prefixItems = schema.prefixItems;
        let containsSchema = schema.contains;
        let propNameSchema = schema.propertyNames;
        let depSchemas = schema.dependentSchemas;
        const hasDependentRequired = schema.dependentRequired !== void 0;
        const hasProps = props !== void 0 || required !== void 0;
        const hasItems = items !== void 0;
        const hasAdditionalProps = additionalProps !== void 0;
        const hasPatternProps = patternProps !== void 0;
        const hasPrefixItems = prefixItems !== void 0;
        const hasContains = containsSchema !== void 0;
        const hasPropNames = propNameSchema !== void 0;
        const hasDepSchemas = depSchemas !== void 0;

        let hasSiblings = hasType || hasVHeader || hasEnum || hasProps || hasItems
            || hasAdditionalProps || hasPatternProps || hasPrefixItems
            || hasContains || hasPropNames || hasDepSchemas;

        // ── unevaluatedProperties wrapper ──
        // When present, we wrap the entire node in N_UNEVALUATED.
        // The inner node gets all other keywords; the wrapper checks unevaluated.
        let unevalPropsSchema = schema.unevaluatedProperties;
        let hasUnevalProps = unevalPropsSchema !== void 0;
        if (hasUnevalProps) {
            // When additionalProperties: true coexists, we need to actually compile
            // it so it can mark properties as evaluated during validation.
            if (hasAdditionalProps && additionalProps === true) {
                additionalProps = true; // stays true, but we force V_ADDITIONAL_PROPERTIES
            }

            let innerNodeId = allocNode();
            // Set up N_UNEVALUATED on the original nodeId
            astKinds[nodeId] = N_UNEVALUATED;
            astChild0[nodeId] = innerNodeId; // inner type child
            // astFlags bit 0 = mode: 0=properties, 1=items
            astFlags[nodeId] = 0;
            // Store the unevalProps child schema in astEdges
            let unevalChildId = allocNode();
            let unevalSlot = astEdges.length;
            astEdges.push(0); // placeholder
            astChild1[nodeId] = unevalChildId; // unevalSchema child node
            if (unevalPropsSchema === false) {
                astKinds[unevalChildId] = N_PRIM;
                astFlags[unevalChildId] = NEVER;
            } else if (unevalPropsSchema === true) {
                astKinds[unevalChildId] = N_PRIM;
                astFlags[unevalChildId] = (ANY | NULLABLE) >>> 0;
            } else {
                pushFrame(/** @type {JSONSchema} */(unevalPropsSchema), unevalChildId, LINK_EDGE, unevalSlot, currentBaseUri, currentDocRoot);
            }

            // Redirect all subsequent parsing to the inner node
            nodeId = innerNodeId;
        }

        // ── unevaluatedItems wrapper ──
        // Same pattern as unevaluatedProperties, but for arrays.
        // astFlags bit 0 = 1 signals items mode to the compiler.
        let unevalItemsSchema = schema.unevaluatedItems;
        let hasUnevalItems = unevalItemsSchema !== void 0;
        if (hasUnevalItems) {
            // When items: true coexists, we need to compile it so it marks
            // items as evaluated during validation (like additionalProperties: true).
            if (hasItems && items === true) {
                items = true; // stays true, handled below in tuple/array compilation
            }

            let innerNodeId = allocNode();
            astKinds[nodeId] = N_UNEVALUATED;
            astChild0[nodeId] = innerNodeId;
            astFlags[nodeId] = 1; // mode = 1 = items
            let unevalChildId = allocNode();
            let unevalSlot = astEdges.length;
            astEdges.push(0);
            astChild1[nodeId] = unevalChildId;
            if (unevalItemsSchema === false) {
                astKinds[unevalChildId] = N_PRIM;
                astFlags[unevalChildId] = NEVER;
            } else if (unevalItemsSchema === true) {
                astKinds[unevalChildId] = N_PRIM;
                astFlags[unevalChildId] = (ANY | NULLABLE) >>> 0;
            } else {
                pushFrame(/** @type {JSONSchema} */(unevalItemsSchema), unevalChildId, LINK_EDGE, unevalSlot, currentBaseUri, currentDocRoot);
            }

            nodeId = innerNodeId;
        }

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
                if (hasContains) siblingSchema.contains = containsSchema;
                if (hasPropNames) siblingSchema.propertyNames = propNameSchema;
                if (hasDepSchemas) siblingSchema.dependentSchemas = depSchemas;
                for (let key of ['minLength', 'maxLength', 'minimum', 'maximum',
                    'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf',
                    'minItems', 'maxItems', 'uniqueItems',
                    'minProperties', 'maxProperties', 'pattern',
                    'format', 'dependentRequired', 'minContains', 'maxContains',
                    'enum', 'const']) {
                    if (/** @type {Record<string,any>} */(schema)[key] !== void 0) siblingSchema[key] = /** @type {Record<string,any>} */(schema)[key];
                }
                parts.push(siblingSchema);
            }

            // Each composition keyword becomes its own sub-schema
            if (hasRef) parts.push({ $ref: refStr });
            if (hasDynRef) parts.push({ $dynamicRef: dynRefStr });
            if (allOf !== void 0) parts.push({ allOf });
            if (anyOf !== void 0) parts.push({ anyOf });
            if (oneOf !== void 0) parts.push({ oneOf });
            if (notSchema !== void 0) parts.push({ not: notSchema });
            if (ifSchema !== void 0) {
                /** @type {Record<string, any>} */
                let ifPart = { if: ifSchema };
                if (schema.then !== void 0) ifPart.then = schema.then;
                if (schema.else !== void 0) ifPart.else = schema.else;
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
                pushFrame(parts[i], partId, LINK_EDGE, slot, currentBaseUri, currentDocRoot);
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
                pushFrame(allOf[i], childId, LINK_EDGE, slot, currentBaseUri, currentDocRoot);
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
                pushFrame(anyOf[i], childId, LINK_EDGE, slot, currentBaseUri, currentDocRoot);
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
                pushFrame(oneOf[i], childId, LINK_EDGE, slot, currentBaseUri, currentDocRoot);
            }
            continue;
        }

        if (notSchema !== void 0) {
            let childId = allocNode();
            astKinds[nodeId] = N_NOT;
            astChild0[nodeId] = childId;
            pushFrame(notSchema, childId, LINK_CHILD0, nodeId, currentBaseUri, currentDocRoot);
            continue;
        }

        if (ifSchema !== void 0) {
            let edgeBase = astEdges.length;
            astEdges.push(SENTINEL, SENTINEL, SENTINEL); // [if, then, else]
            astKinds[nodeId] = N_CONDITIONAL;
            astChild0[nodeId] = edgeBase;

            let ifId = allocNode();
            pushFrame(ifSchema, ifId, LINK_EDGE, edgeBase, currentBaseUri, currentDocRoot);

            let thenSchema = schema.then;
            if (thenSchema !== void 0) {
                let thenId = allocNode();
                pushFrame(thenSchema, thenId, LINK_EDGE, edgeBase + 1, currentBaseUri, currentDocRoot);
            }
            let elseSchema = schema.else;
            if (elseSchema !== void 0) {
                let elseId = allocNode();
                pushFrame(elseSchema, elseId, LINK_EDGE, edgeBase + 2, currentBaseUri, currentDocRoot);
            }
            continue;
        }

        if (hasRef) {
            let absoluteUri = resolveUri(currentBaseUri, refStr);
            let targetId = compiledUris.get(absoluteUri);

            // ── JIT Lazy Compilation ──
            if (targetId === void 0) {
                // Pre-split the URI to separate the Base Context from the Fragment
                let hashIdx = absoluteUri.indexOf('#');
                let baseDocUri = hashIdx !== -1 ? absoluteUri.substring(0, hashIdx) : absoluteUri;
                let fragment = hashIdx !== -1 ? absoluteUri.substring(hashIdx + 1) : "";

                // 1. Check for registered named anchors first (e.g., #items)
                let targetObj = this.uriRegistry.get(absoluteUri);
                let targetDocRoot;

                // 2. Resolve the owning document root for this target
                if (baseDocUri === currentBaseUri) {
                    targetDocRoot = currentDocRoot;
                } else {
                    targetDocRoot = this.uriRegistry.get(baseDocUri);
                    if (targetDocRoot === void 0) {
                        throw new Error("Unresolvable $ref base: " + baseDocUri);
                    }
                }

                // 3. Fallback to JSON Pointer if it wasn't a named anchor
                let effectiveBaseUri = baseDocUri;
                if (targetObj === void 0) {
                    if (fragment === "") {
                        targetObj = targetDocRoot;
                    } else {
                        // SPEC: A fragment cannot point inside a boolean schema
                        if (typeof targetDocRoot !== 'object' || targetDocRoot === null) {
                            throw new Error("Cannot resolve fragment '" + fragment + "' inside boolean schema: " + baseDocUri);
                        }
                        // Use tracked resolution so that $id changes along the pointer
                        // path shift the effective base URI for the target schema. This
                        // matters when a sub-schema has its own $id (resource boundary)
                        // and the target contains relative $refs.
                        let tracked = resolvePointerTracked(targetDocRoot, fragment, baseDocUri);
                        targetObj = tracked.obj;
                        effectiveBaseUri = tracked.baseUri;
                    }
                    if (targetObj === void 0) {
                        throw new Error("Unresolvable $ref pointer: " + absoluteUri);
                    }
                }

                targetId = allocNode();
                compiledUris.set(absoluteUri, targetId);
                pushFrame(targetObj, targetId, LINK_DEF, 0, effectiveBaseUri, targetDocRoot);
            }

            // ── Dynamic scope injection ──
            // When a $ref crosses into a schema resource that has $dynamicAnchors,
            // and the target is NOT the resource root (which already has a wrapper),
            // we must wrap this $ref in N_DYN_ANCHOR to push the resource's scope.
            let refHashIdx = absoluteUri.indexOf('#');
            let refBaseDocUri = refHashIdx !== -1 ? absoluteUri.substring(0, refHashIdx) : absoluteUri;
            let refFragment = refHashIdx !== -1 ? absoluteUri.substring(refHashIdx + 1) : "";
            let refResourceAnchors = this.dynamicAnchorsByResource.get(refBaseDocUri);

            if (refResourceAnchors !== void 0 && refResourceAnchors.size > 0
                && refFragment !== "" && refBaseDocUri !== currentBaseUri) {
                // This $ref enters a resource with dynamic anchors via a sub-schema.
                // Wrap as N_DYN_ANCHOR so the resource's anchors are on the scope stack.
                astKinds[nodeId] = N_DYN_ANCHOR;
                let refInnerId = allocNode();
                dynAnchorInnerSet.add(refInnerId);
                astKinds[refInnerId] = N_REF;
                astChild0[refInnerId] = targetId;
                astChild0[nodeId] = refInnerId;

                let edgeBase = astEdges.length;
                let pairCount = 0;
                for (let [anchorName, anchorBaseUri] of refResourceAnchors) {
                    let anchorUri = anchorBaseUri + '#' + anchorName;
                    let anchorSchema = this.uriRegistry.get(anchorUri);
                    if (anchorSchema === void 0) {
                        continue;
                    }
                    let anchorTargetId = compiledUris.get(anchorUri);
                    if (anchorTargetId === void 0) {
                        anchorTargetId = allocNode();
                        compiledUris.set(anchorUri, anchorTargetId);
                        dynAnchorInnerSet.add(anchorTargetId);
                        pushFrame(anchorSchema, anchorTargetId, LINK_DEF, 0, anchorBaseUri, currentDocRoot);
                    }
                    let nameIdx = virtualLookup(anchorName);
                    astEdges.push(nameIdx);
                    astEdges.push(anchorTargetId);
                    pairCount++;
                }
                astChild1[nodeId] = pairCount;
                astFlags[nodeId] = edgeBase;
                continue;
            }

            astKinds[nodeId] = N_REF;
            astChild0[nodeId] = targetId;
            continue;
        }

        if (hasDynRef) {
            let absoluteUri = resolveUri(currentBaseUri, dynRefStr);
            let hashIdx = absoluteUri.indexOf('#');
            let fragment = hashIdx !== -1 ? absoluteUri.substring(hashIdx + 1) : "";
            let baseDocUri = hashIdx !== -1 ? absoluteUri.substring(0, hashIdx) : absoluteUri;

            // Determine if this is truly dynamic or should collapse to plain $ref.
            // A JSON Pointer fragment (starts with /) or empty fragment is never dynamic.
            // The bookending rule: dynamic resolution only activates if the target
            // resource contains a matching $dynamicAnchor.
            let isDynamic = false;
            if (fragment.length > 0 && fragment.charCodeAt(0) !== 47) {
                let targetResourceAnchors = this.dynamicAnchorsByResource.get(baseDocUri);
                if (targetResourceAnchors !== void 0 && targetResourceAnchors.has(fragment)) {
                    isDynamic = true;
                }
            }

            // Resolve the fallback target exactly like $ref
            let targetId = compiledUris.get(absoluteUri);
            if (targetId === void 0) {
                let targetObj = this.uriRegistry.get(absoluteUri);
                let targetDocRoot;

                if (baseDocUri === currentBaseUri) {
                    targetDocRoot = currentDocRoot;
                } else {
                    targetDocRoot = this.uriRegistry.get(baseDocUri);
                    if (targetDocRoot === void 0) {
                        throw new Error("Unresolvable $dynamicRef base: " + baseDocUri);
                    }
                }

                if (targetObj === void 0) {
                    if (fragment === "") {
                        targetObj = targetDocRoot;
                    } else {
                        if (typeof targetDocRoot !== 'object' || targetDocRoot === null) {
                            throw new Error("Cannot resolve fragment '" + fragment + "' inside boolean schema: " + baseDocUri);
                        }
                        // Named fragment (no leading /) — walk as JSON pointer first.
                        // If that fails, fall back to document root. This handles the
                        // draft2019-09 $recursiveRef: "#" → $dynamicRef: "#recursive"
                        // translation: when the target resource has no matching
                        // $dynamicAnchor the ref still resolves to the resource root.
                        if (fragment.charCodeAt(0) !== 47) {
                            targetObj = targetDocRoot;
                        } else {
                            targetObj = resolvePointer(targetDocRoot, fragment);
                            if (targetObj === void 0) {
                                throw new Error("Unresolvable $dynamicRef pointer: " + absoluteUri);
                            }
                        }
                    }
                    if (targetObj === void 0) {
                        throw new Error("Unresolvable $dynamicRef pointer: " + absoluteUri);
                    }
                }

                targetId = allocNode();
                compiledUris.set(absoluteUri, targetId);
                pushFrame(targetObj, targetId, LINK_DEF, 0, baseDocUri, targetDocRoot);
            }

            if (isDynamic) {
                astKinds[nodeId] = N_DYN_REF;
                astChild0[nodeId] = targetId;
                astChild1[nodeId] = virtualLookup(fragment);
            } else {
                astKinds[nodeId] = N_REF;
                astChild0[nodeId] = targetId;
            }
            continue;
        }

        // Empty schema {} → matches everything
        if (!hasType && !hasVHeader && !hasEnum && !hasProps && !hasItems
            && !hasAdditionalProps && !hasPatternProps && !hasPrefixItems
            && !hasContains && !hasPropNames && !hasDepSchemas) {
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

        // Whether the schema has an explicit type: "object" constraint.
        let isExplicitObject = typeStr === 'object';

        // ── Prim-split: scalar validators + object structural keywords, no explicit object type ──
        // When a schema mixes scalar validators (minimum, minLength, etc.) with object
        // structural keywords (properties, additionalProperties, etc.) but has no explicit
        // type: "object", the scalar validators must fire for ALL data types, not only objects.
        // We split into N_INTERSECT: [N_PRIM(scalar validators), N_CONDITIONAL→N_OBJECT(obj)].
        // runPrimValidator is already type-aware — it skips V_MINIMUM for non-numeric data,
        // V_MIN_LENGTH for non-strings, etc. — so N_PRIM passes through incompatible types.
        if (!isExplicitObject && (vHeader & PRIM_ONLY_V) !== 0
            && (hasProps || hasAdditionalProps || hasPatternProps || hasPropNames || hasDepSchemas || hasDependentRequired)) {
            let primVHeader = vHeader & PRIM_ONLY_V;
            // Strip prim-only bits from vHeader so the object structural path
            // only receives object-relevant validators (minProperties etc.).
            vHeader = (vHeader & ~PRIM_ONLY_V) >>> 0;

            // Split fixed-slot payloads (bits 0–15) by PRIM_ONLY_V membership.
            // Payloads appear in ascending bit order — one slot per set flag.
            let primPayload = [];
            let objPayload = [];
            let pi = 0;
            for (let bit = 0; bit < 16; bit++) {
                let flag = 1 << bit;
                if (primVHeader & flag) {
                    primPayload.push(vPayloadArr[pi++]);
                } else if (vHeader & flag) {
                    objPayload.push(vPayloadArr[pi++]);
                }
            }
            // Sequential payloads (V_DEPENDENT_REQUIRED etc.) are always object-only
            while (pi < vPayloadArr.length) {
                objPayload.push(vPayloadArr[pi++]);
            }
            vPayloadArr = objPayload;

            // Allocate the two N_INTERSECT children
            let primNodeId = allocNode();
            let condNodeId = allocNode();

            // Wire N_INTERSECT at the original nodeId
            let edgeBase = astEdges.length;
            astEdges.push(primNodeId, condNodeId);
            astKinds[nodeId] = N_INTERSECT;
            astChild0[nodeId] = edgeBase;
            astChild1[nodeId] = 2;

            // N_PRIM branch: scalar validators fire for any data type.
            // The runtime skips irrelevant checks (e.g. minimum on a string).
            astKinds[primNodeId] = N_PRIM;
            astFlags[primNodeId] = (ANY | NULLABLE) >>> 0;
            writeValidators(primNodeId, primVHeader, primPayload);

            // Redirect all subsequent structural compilation to condNodeId.
            typeNodeId = condNodeId;
            hasVHeader = vHeader !== 0;
        }

        // ── Object structural node (properties / required / additionalProperties / patternProperties / propertyNames / dependentSchemas / dependentRequired) ──
        if (hasProps || hasAdditionalProps || hasPatternProps || hasPropNames || hasDepSchemas || hasDependentRequired) {
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

                pushFrame(childSchema, childId, LINK_EDGE, childSlot, currentBaseUri, currentDocRoot);
            }

            // additionalProperties: store child node id after property edges
            // astFlags bit 0 = has additionalProperties child
            let objVHeader = vHeader;
            if (hasAdditionalProps && additionalProps === true) {
                /**
                 * additionalProperties: true is always compiled so that
                 * runObjectValidator can mark properties as evaluated when
                 * unevaluatedProperties is present in a parent/ancestor schema.
                 */
                objVHeader |= V_ADDITIONAL_PROPERTIES;
                astFlags[objNodeId] |= AST_FLAG_HAS_ADDITIONAL_PROPS; // bit 0 = has additionalProperties child
                let addChildId = allocNode();
                astKinds[addChildId] = N_PRIM;
                astFlags[addChildId] = (ANY | NULLABLE) >>> 0;
                astEdges.push(addChildId);
            } else if (hasAdditionalProps && additionalProps !== true) {
                if (additionalProps === false) {
                    objVHeader |= V_ADDITIONAL_PROPERTIES;
                } else {
                    // Schema → compile it, store as extra edge after properties
                    objVHeader |= V_ADDITIONAL_PROPERTIES;
                    astFlags[objNodeId] |= AST_FLAG_HAS_ADDITIONAL_PROPS; // bit 0 = has additionalProperties child
                    let addChildId = allocNode();
                    let addSlot = astEdges.length;
                    astEdges.push(0); // placeholder
                    pushFrame(/** @type {JSONSchema} */(additionalProps), addChildId, LINK_EDGE, addSlot, currentBaseUri, currentDocRoot);
                }
            }

            // patternProperties: store [pattern, childNodeId] pairs after properties
            // astFlags bit 1 = has patternProperties children
            if (hasPatternProps) {
                let patKeys = Object.keys(patternProps);
                astFlags[objNodeId] |= AST_FLAG_HAS_PATTERN_PROPS; // bit 1 = has patternProperties
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
                    pushFrame(patternProps[pat], patChildId, LINK_EDGE, patSlot, currentBaseUri, currentDocRoot);
                }
            }

            // propertyNames: compile child schema, store node id after patternProperties edges
            // astFlags bit 3 = has propertyNames child
            if (hasPropNames) {
                astFlags[objNodeId] |= AST_FLAG_HAS_PROPERTY_NAMES; // bit 3 = has propertyNames child
                let pnChildId = allocNode();
                let pnSlot = astEdges.length;
                astEdges.push(0); // placeholder for child node id
                pushFrame(propNameSchema, pnChildId, LINK_EDGE, pnSlot, currentBaseUri, currentDocRoot);
            }

            // dependentSchemas: store [triggerKeyNameIdx, childNodeId] pairs
            // astFlags bit 4 = has dependentSchemas children
            if (hasDepSchemas) {
                let depKeys = Object.keys(depSchemas);
                astFlags[objNodeId] |= AST_FLAG_HAS_DEPENDENT_SCHEMAS; // bit 4 = has dependentSchemas
                astEdges.push(depKeys.length);
                for (let i = 0; i < depKeys.length; i++) {
                    let trigKey = depKeys[i];
                    let trigNameIdx = propNames.length;
                    propNames.push(trigKey);
                    astEdges.push(trigNameIdx); // trigger key name index
                    let depChildId = allocNode();
                    let depSlot = astEdges.length;
                    astEdges.push(0); // placeholder for child node id
                    pushFrame(depSchemas[trigKey], depChildId, LINK_EDGE, depSlot, currentBaseUri, currentDocRoot);
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
            astChild1[tupleNodeId] = /** @type {any[]} */(prefixItems).length;

            for (let i = 0; i < /** @type {any[]} */(prefixItems).length; i++) {
                let slot = astEdges.length;
                astEdges.push(0); // placeholder
                let childId = allocNode();
                pushFrame(/** @type {any[]} */(prefixItems)[i], childId, LINK_EDGE, slot, currentBaseUri, currentDocRoot);
            }

            // items alongside prefixItems → rest type
            // JSON Schema: no `items` means any additional items are allowed (implicit ANY)
            if (hasItems) {
                astFlags[tupleNodeId] |= AST_FLAG_HAS_REST; // bit 0 = has rest type child
                let restSlot = astEdges.length;
                astEdges.push(0);
                let restChildId = allocNode();
                pushFrame(/** @type {JSONSchema} */(items), restChildId, LINK_EDGE, restSlot, currentBaseUri, currentDocRoot);
            }

            if (hasContains) {
                astFlags[tupleNodeId] |= AST_FLAG_HAS_CONTAINS;
                let containsSlot = astEdges.length;
                astEdges.push(0);
                let containsChildId = allocNode();
                pushFrame(/** @type {JSONSchema} */(containsSchema), containsChildId, LINK_EDGE, containsSlot, currentBaseUri, currentDocRoot);
            }

            if (hasVHeader) {
                writeValidators(tupleNodeId, vHeader, vPayloadArr);
            }
            continue;
        }

        // ── contains-only section (contains without items or prefixItems) ──
        // Creates an N_ARRAY with an ANY element type and wires the contains child
        // into astChild1[arrNodeId] (astFlags bit 1). When `type` is absent, wraps
        // in a conditional guard so non-arrays pass through unvalidated.
        if (hasContains && !hasItems && !hasPrefixItems) {
            let isExplicitArray = typeStr === 'array';
            let arrNodeId;

            if (isExplicitArray) {
                arrNodeId = typeNodeId;
            } else {
                // No explicit type → conditional guard: if(isArray) → arrNodeId else pass
                arrNodeId = allocNode();
                let ifId = allocNode();
                astKinds[ifId] = N_BARE_ARRAY;
                let condBase = astEdges.length;
                astEdges.push(ifId, arrNodeId, SENTINEL);
                astKinds[typeNodeId] = N_CONDITIONAL;
                astChild0[typeNodeId] = condBase;
            }

            // N_ARRAY: element type = ANY|NULLABLE, contains child in astChild1
            let anyElemId = allocNode();
            astKinds[anyElemId] = N_PRIM;
            astFlags[anyElemId] = (ANY | NULLABLE) >>> 0;
            astKinds[arrNodeId] = N_ARRAY;
            astChild0[arrNodeId] = anyElemId;
            astFlags[arrNodeId] |= AST_FLAG_HAS_CONTAINS; // bit 1 = has contains child
            let containsChildId = allocNode();
            astChild1[arrNodeId] = containsChildId;
            pushFrame(containsSchema, containsChildId, LINK_CHILD1, arrNodeId, currentBaseUri, currentDocRoot);

            if (hasVHeader) {
                writeValidators(arrNodeId, vHeader, vPayloadArr);
            }
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
            astFlags[arrNodeId] |= AST_FLAG_HAS_ITEMS;
            astKinds[arrNodeId] = N_ARRAY;
            astChild0[arrNodeId] = elemId;
            pushFrame(/** @type {JSONSchema} */(items), elemId, LINK_CHILD0, arrNodeId, currentBaseUri, currentDocRoot);

            // Wire contains child into astChild1 when both items and contains are present
            if (hasContains) {
                astFlags[arrNodeId] |= AST_FLAG_HAS_CONTAINS; // bit 1 = has contains child
                let containsChildId = allocNode();
                astChild1[arrNodeId] = containsChildId;
                pushFrame(/** @type {JSONSchema} */(containsSchema), containsChildId, LINK_CHILD1, arrNodeId, currentBaseUri, currentDocRoot);
            }

            // Attach validators (minItems, maxItems, uniqueItems, etc.)
            if (hasVHeader) {
                writeValidators(arrNodeId, vHeader, vPayloadArr);
            }
            continue;
        }

        // ── Pure type / validator node (no structural keywords) ──

        if (hasVHeader) {
            writeValidators(typeNodeId, vHeader, vPayloadArr);
        }

        if (hasType) {
            /**
             * Emit a single type string or type array as AST nodes.
             * Primitives map to N_PRIM with bitmask flags. Container types
             * ("array", "object") map to N_BARE_ARRAY / N_BARE_OBJECT since
             * they are complex-only types with no primitive bit representation.
             * Mixed type arrays with containers are wrapped in N_OR.
             */
            /** @type {any[]|null} */
            let typeArr = typeof typeVal === 'string' ? null : /** @type {any[]} */(typeVal);
            let singleType = typeof typeVal === 'string' ? typeVal : (/** @type {any[]} */(typeVal).length === 1 ? /** @type {any[]} */(typeVal)[0] : null);

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
                for (let i = 0; i < /** @type {any[]} */(typeArr).length; i++) {
                    if (isContainerType(/** @type {any[]} */(typeArr)[i])) {
                        hasContainer = true;
                        if (/** @type {any[]} */(typeArr)[i] === 'array') {
                            hasArrayType = true;
                        } else {
                            hasObjectType = true;
                        }
                    } else {
                        primMerged |= mapSingleTypePrim(/** @type {any[]} */(typeArr)[i]);
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
            // enumPrimBits holds STRING, NUMBER, NULLABLE as appropriate.
            // Boolean enum values: both true+false → BOOLEAN bit; either alone → BOOLEAN (minor
            // semantic regression for enum:[true] only, but no distinct bit for single booleans).
            if (hasTrueEnum || hasFalseEnum) { enumPrimBits |= BOOLEAN; }
            astKinds[typeNodeId] = N_PRIM;
            astFlags[typeNodeId] = enumPrimBits >>> 0;
        } else {
            // Validators but no type keyword. Array/object validators (minItems, maxItems,
            // uniqueItems, minProperties, maxProperties) require structural dispatch —
            // runPrimValidator does not handle them. Emit a conditional guard node that
            // only runs the validator when the value is the right container type.
            const ARRAY_V = V_MIN_ITEMS | V_MAX_ITEMS | V_UNIQUE_ITEMS;
            const OBJ_V = V_MIN_PROPERTIES | V_MAX_PROPERTIES;
            let hasArrayV = (vHeader & ARRAY_V) !== 0;
            let hasObjV = (vHeader & OBJ_V) !== 0;

            if (hasArrayV && !hasObjV) {
                // Conditional guard: if(isArray) → N_BARE_ARRAY with validators else pass
                let arrNodeId = allocNode();
                let ifId = allocNode();
                astKinds[ifId] = N_BARE_ARRAY;
                let condBase = astEdges.length;
                astEdges.push(ifId, arrNodeId, SENTINEL);
                astKinds[typeNodeId] = N_CONDITIONAL;
                astChild0[typeNodeId] = condBase;
                astKinds[arrNodeId] = N_BARE_ARRAY;
                // Transfer validators from typeNodeId to the inner arrNodeId
                astVHeaders[arrNodeId] = astVHeaders[typeNodeId];
                astVOffset[arrNodeId] = astVOffset[typeNodeId];
                astVHeaders[typeNodeId] = 0;
            } else if (hasObjV && !hasArrayV) {
                // Conditional guard: if(isObject) → N_BARE_OBJECT with validators else pass
                let objNodeId = allocNode();
                let ifId = allocNode();
                astKinds[ifId] = N_BARE_OBJECT;
                let condBase = astEdges.length;
                astEdges.push(ifId, objNodeId, SENTINEL);
                astKinds[typeNodeId] = N_CONDITIONAL;
                astChild0[typeNodeId] = condBase;
                astKinds[objNodeId] = N_BARE_OBJECT;
                // Transfer validators from typeNodeId to the inner objNodeId
                astVHeaders[objNodeId] = astVHeaders[typeNodeId];
                astVOffset[objNodeId] = astVOffset[typeNodeId];
                astVHeaders[typeNodeId] = 0;
            } else {
                // Pure primitive validators (minLength, minimum, etc.) or mixed → ANY|NULLABLE
                astKinds[typeNodeId] = N_PRIM;
                astFlags[typeNodeId] = (ANY | NULLABLE) >>> 0;
            }
        }
    }

    // Phase 2: Resolve $ref nodes

    /** @type {number[]} */
    let rootIds = [];
    /** @type {Array<string|null>} */
    let rootNames = [];
    /** @type {Array<string|null>} */
    let rootUris = [];

    for (let i = 0; i < entriesCount; i++) {
        let index = entries[i];
        let schema = this.schemas[index];

        rootIds.push(schemaRootIds[index]);
        rootNames.push(this.names[index]);

        let uri = null;
        if (isObject(schema) && /** @type {Record<string,any>} */(schema).$id !== void 0) {
            uri = /** @type {Record<string,any>} */(schema).$id;
        }
        rootUris.push(uri);
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
        rootIds,
        rootNames,
        rootUris,
        nodeCount: nc,
    };
};

/**
 * Convenience wrapper — parses a single JSON Schema into a FlatAst.
 * Internally creates a CompoundSchema, adds the schema, and calls bundle().
 * @param {JSONSchema|boolean} schema — a JSON Schema document (object or boolean)
 * @param {string=} dialect
 * @returns {uvd.FlatAst}
 */
function parseJSONSchema(schema, dialect) {
    const compound = new CompoundSchema(dialect);
    const idx = compound.add(/** @type {JSONSchema} */(schema));
    return compound.bundle(idx);
}

export { CompoundSchema, parseJSONSchema, transpile };
