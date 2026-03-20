import type { FlatAst } from './ast.js';

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

/**
 * Parses a JSON Schema object into a FlatAst suitable for compile().
 * Two-pass: iterative parse then link ($ref resolution).
 * Supports draft 2020-12 keywords.
 */
export function parseJsonSchema(schema: uvd.JSONSchema | boolean): FlatAst;
