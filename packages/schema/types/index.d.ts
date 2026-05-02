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