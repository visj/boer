export interface FlatAst {
    readonly astKinds: Uint8Array;
    readonly astFlags: Uint32Array;
    readonly astChild0: Uint32Array;
    readonly astChild1: Uint32Array;
    readonly astVHeaders: Uint32Array;
    readonly astVOffset: Uint32Array;
    readonly astEdges: Uint32Array;
    readonly vPayloads: number[];
    readonly propNames: string[];
    readonly callbacks: Array<(data: any) => boolean>;
    readonly regexes: Array<RegExp>;
    readonly rootIds: number[];
    readonly rootUris: Array<string | null>;
    readonly rootNames: Array<string | null>;
    readonly nodeCount: number;
}

export declare class CompoundSchema {
    constructor(dialect?: string);

    readonly schemas: any[];
    readonly names: Array<string | null>;
    readonly count: number;

    add(schema: any, id?: string, name?: string): number;
    bundle(schemas: number | number[]): FlatAst;
}

export declare function transpile(schema: any, dialect?: string): any;
export declare function parseJSONSchema(schema: any, dialect?: string): FlatAst;

// AST node kind constants
export declare const N_PRIM: number;
export declare const N_OBJECT: number;
export declare const N_ARRAY: number;
export declare const N_REFINE: number;
export declare const N_BARE_ARRAY: number;
export declare const N_BARE_OBJECT: number;
export declare const N_OR: number;
export declare const N_EXCLUSIVE: number;
export declare const N_INTERSECT: number;
export declare const N_NOT: number;
export declare const N_CONDITIONAL: number;
export declare const N_TUPLE: number;
export declare const N_DYN_ANCHOR: number;
export declare const N_DYN_REF: number;
export declare const N_UNEVALUATED: number;
export declare const N_REF: number;

// AST flag constants
export declare const AST_FLAG_HAS_ADDITIONAL_PROPS: number;
export declare const AST_FLAG_HAS_PATTERN_PROPS: number;
export declare const AST_FLAG_HAS_PROPERTY_NAMES: number;
export declare const AST_FLAG_HAS_DEPENDENT_SCHEMAS: number;
export declare const AST_FLAG_HAS_REST: number;
export declare const AST_FLAG_HAS_CONTAINS: number;
export declare const AST_FLAG_HAS_ITEMS: number;
export declare const AST_FLAG_UNEVAL_MODE_ITEMS: number;
