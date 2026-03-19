export declare const K_REF = 12;

export interface AstObject {
    readonly k: 1;
    readonly p: Record<string, AstNode>;
    readonly v?: Record<string, number | true>;
}

export interface AstArray {
    readonly k: 2;
    readonly i: AstNode;
    readonly v?: Record<string, number | true>;
}

export interface AstUnion {
    readonly k: 3;
    readonly d: string;
    readonly m: Record<string, AstNode>;
}

export interface AstRefine {
    readonly k: 4;
    readonly i: AstNode;
    readonly f: (data: any) => boolean;
}

export interface AstTuple {
    readonly k: 5;
    readonly i: AstNode[];
}

export interface AstRecord {
    readonly k: 6;
    readonly i: AstNode;
}

export interface AstOr {
    readonly k: 7;
    readonly i: AstNode[];
}

export interface AstExclusive {
    readonly k: 8;
    readonly i: AstNode[];
}

export interface AstIntersect {
    readonly k: 9;
    readonly i: AstNode[];
}

export interface AstNot {
    readonly k: 10;
    readonly i: AstNode;
}

export interface AstConditional {
    readonly k: 11;
    readonly if: AstNode;
    readonly then?: AstNode;
    readonly else?: AstNode;
}

export interface AstRef {
    readonly k: 12;
    readonly r: number;
}

export type AstNode =
    | number
    | AstObject
    | AstArray
    | AstUnion
    | AstRefine
    | AstTuple
    | AstRecord
    | AstOr
    | AstExclusive
    | AstIntersect
    | AstNot
    | AstConditional
    | AstRef;

export interface AstRoot {
    readonly root: AstNode;
    readonly defs: AstNode[];
    readonly names: string[];
}

export interface CompiledSchema {
    readonly root: number;
    readonly defs: Record<string, number>;
}

export function compile(catalog: any, ast: AstRoot): CompiledSchema;
