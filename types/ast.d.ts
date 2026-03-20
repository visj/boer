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
    readonly astKinds: Uint8Array;
    readonly astFlags: Uint32Array;
    readonly astChild0: Uint32Array;
    readonly astChild1: Uint32Array;
    readonly propNames: string[];
    readonly propChildren: number[];
    readonly listChildren: number[];
    readonly condSlots: number[];
    readonly callbacks: Array<(data: any) => boolean>;
    readonly rootId: number;
    readonly defIds: number[];
    readonly defNames: string[];
    readonly nodeCount: number;
}

export interface CompiledSchema {
    readonly root: number;
    readonly defs: Record<string, number>;
}

export function compile(catalog: any, ast: FlatAst): CompiledSchema;
