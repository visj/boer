// ────────────────────────────────────────────────────────────────────────────
// FlatAst — Structure-of-Arrays representation of a parsed JSON Schema.
//
// Produced by parseJsonSchema(), consumed by compile().
//
// ## Core node arrays (parallel, indexed by nodeId)
//
//   astKinds[nodeId]   — node kind (N_PRIM, N_OBJECT, N_ARRAY, etc.)
//   astFlags[nodeId]   — for N_PRIM: primitive bitmask (STRING | NUMBER, etc.)
//   astChild0[nodeId]  — primary child pointer (usage varies by kind)
//   astChild1[nodeId]  — secondary data (prop count, branch count, callback idx)
//   astVHeaders[nodeId] — validator bitmask (V_STR_MIN_LEN | V_NUM_MAX, etc.)
//   astVOffset[nodeId]  — start index into vPayloads for this node's payloads
//
// ## Unified edge slab
//
//   astEdges — all variable-length child pointers, interleaved:
//     Object:      [nameIdx, childId, flags] x count
//     List:        [childId] x count
//     Conditional: [ifId, thenId, elseId]
//
// ## Validator payloads
//
//   vPayloads — flat array of numeric payloads for validator constraints.
//     Offset into this array is computed via popcount:
//     offset = popcnt16(vHeader & (FLAG - 1))
//
// ────────────────────────────────────────────────────────────────────────────

export declare const N_PRIM = 0;
export declare const N_OBJECT = 1;
export declare const N_ARRAY = 2;
export declare const N_REFINE = 4;
export declare const N_OR = 7;
export declare const N_EXCLUSIVE = 8;
export declare const N_INTERSECT = 9;
export declare const N_NOT = 10;
export declare const N_CONDITIONAL = 11;
export declare const N_REF = 12;

export interface FlatAst {
    // 1. CORE NODE ARRAYS (parallel SoA, indexed by nodeId)
    readonly astKinds: Uint8Array;
    readonly astFlags: Uint32Array;
    readonly astChild0: Uint32Array;
    readonly astChild1: Uint32Array;
    readonly astVHeaders: Uint32Array;
    readonly astVOffset: Uint32Array;

    // 2. UNIFIED EDGE SLAB
    // Replaces the old propChildren, propFlags, listChildren, condSlots arrays.
    // Object edges:      [nameIdx, childId, flags] per property
    // List edges:        [childId] per branch
    // Conditional edges: [ifId, thenId, elseId]
    readonly astEdges: number[];

    // 3. VALIDATOR PAYLOADS
    // One numeric value per set payload flag (bits 0-15 of vHeader).
    // Boolean flags (bits 16-31) have no payload.
    readonly vPayloads: number[];

    // 4. STRING STORAGE
    // Property names can't live in a typed array, so they stay here.
    // Object edges reference these by index (nameIdx).
    readonly propNames: string[];

    // 5. CALLBACK STORAGE
    // For validators that can't be expressed as numeric payloads
    // (enum, const, pattern). Referenced by N_REFINE's astChild1.
    readonly callbacks: Array<(data: any) => boolean>;

    // 6. SCHEMA METADATA
    readonly rootId: number;
    readonly defNames: string[];
    readonly defIds: number[];
    readonly nodeCount: number;
}

export interface CompiledSchema {
    readonly root: number;
    readonly defs: Record<string, number>;
}

export function compile(catalog: any, ast: FlatAst): CompiledSchema;
