declare const TYPE_ID: unique symbol;
declare const COMPLEX_ID: unique symbol;
declare const CATALOG_ID: unique symbol;


export type Value<T, R extends symbol = any> = number & {
    readonly [TYPE_ID]: T;
    readonly [CATALOG_ID]?: (tag: R) => R;
};
export interface Complex<T, R extends symbol = any> {
    readonly [TYPE_ID]: T;
    readonly [COMPLEX_ID]: never;
    readonly [CATALOG_ID]?: (tag: R) => R;
}

export const NULL: Value<null, any>;
export const UNDEFINED: Value<undefined, any>;
export const BOOLEAN: Value<boolean, any>;
export const TRUE: Value<true, any>;
export const FALSE: Value<false, any>;
export const NUMBER: Value<number, any>;
export const STRING: Value<string, any>;
export const BIGINT: Value<bigint, any>;
export const DATE: Value<Date, any>;
export const URI: Value<URL, any>;
export const ARRAY: Value<any[], any>;
export const OBJECT: Value<Record<string, any>, any>;
export const ANY: Value<any, any>;
export const NEVER: Value<never, any>;

export const VALUE: Value<boolean, any> | Value<number, any> | Value<string, any> | Value<bigint, any> | Value<Date, any> | Value<URL, any>;

export type Type<T, R extends symbol = any> = Value<T, R> | Complex<T, R>;

export type Infer<T, R extends symbol = any> =
    T extends Value<infer U, R> ? U :
    T extends Complex<infer U, R> ? U :
    never;

export interface Schema<R extends symbol> {
    [key: string]: number | Type<any, R> | Schema<R>;
}

export type InferSchema<T extends Schema<any>, R extends symbol = any> = {
    [K in keyof T]: T[K] extends Value<infer U, R> ? U :
    T[K] extends Complex<infer U, R> ? U :
    T[K] extends number ? any :
    T[K] extends Schema<R> ? InferSchema<T[K]> :
    never;
};

export type StrictSchema<T, R extends symbol> = {
    [K in keyof T]: T[K] extends Type<any, any>
    ? (T[K] extends Type<any, R> ? T[K] : { readonly __error: "Cross-registry type detected!" })
    : T[K] extends number
    ? T[K]
    : T[K] extends object
    ? StrictSchema<T[K], R>
    : T[K];
};

export type InferStrictSchema<T extends StrictSchema<any, any>, R extends symbol = any> = {
    [K in keyof T]: T[K] extends Value<infer U, any> ? U :
    T[K] extends Complex<infer U, any> ? U :
    T[K] extends number ? any :
    T[K] extends StrictSchema<any, R> ? InferStrictSchema<T[K], R> :
    never;
};

export interface StringValidators {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp | string;
    format?: 'email' | 'ipv4' | 'uuid' | 'date-time';
}

export interface NumberValidators {
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;
}

export interface ArrayValidators {
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    contains?: number;
    minContains?: number;
    maxContains?: number;
}

export interface ObjectValidators {
    minProperties?: number;
    maxProperties?: number;
    patternProperties?: Record<string, number>;
    propertyNames?: number;
    dependentRequired?: Record<string, string[]>;
    additionalProperties?: false;
}

export interface WhenValidators {
    if: number;
    then?: number;
    else?: number;
}

export type Validators = StringValidators | NumberValidators | ArrayValidators | ObjectValidators | WhenValidators;

export interface Transformers { }

export interface SchemaBuilder<R extends symbol> {
    object<T extends StrictSchema<any, R>>(
        definition: T extends StrictSchema<T, R> ? T : StrictSchema<T, R>,
        opts?: any
    ): Complex<InferStrictSchema<T, R>, R>;
    array<T>(itemType: Type<T, R>, opts?: any): Complex<T[], R>;
    union<T extends Record<string, Type<any, R>>, D extends string>(
        discriminator: D,
        variants: T
    ): Complex<{ [K in keyof T]: Infer<T[K]> & { [P in D]: K } }[keyof T], R>;

    refine<T>(typedef: Type<T, R>, fn: (data: T) => boolean): Complex<T, R>;

    transform<
        TBase extends Type<any, R>,
        TKey extends keyof Transformers
    >(
        typedef: TBase,
        key: TKey
    ): Complex<Transformers[TKey], R>;

    // Tuple (prefixItems)
    tuple<A>(a: Type<A, R>): Complex<[A], R>;
    tuple<A, B>(a: Type<A, R>, b: Type<B, R>): Complex<[A, B], R>;
    tuple<A, B, C>(a: Type<A, R>, b: Type<B, R>, c: Type<C, R>): Complex<[A, B, C], R>;
    tuple<T extends any[]>(types: { [K in keyof T]: Type<T[K], R> }): Complex<T, R>;

    // Record
    record<T>(valueType: Type<T, R>): Complex<Record<string, T>, R>;

    // Or (anyOf) — first match wins
    or<A, B>(a: Type<A, R>, b: Type<B, R>): Type<A | B, R>;
    or<A, B, C>(a: Type<A, R>, b: Type<B, R>, c: Type<C, R>): Type<A | B | C, R>;
    or<T>(types: Type<T, R>[]): Type<T, R>;

    // Exclusive (oneOf) — exactly one must match
    exclusive<A, B>(a: Type<A, R>, b: Type<B, R>): Complex<A | B, R>;
    exclusive<A, B, C>(a: Type<A, R>, b: Type<B, R>, c: Type<C, R>): Complex<A | B | C, R>;
    exclusive<T>(types: Type<T, R>[]): Complex<T, R>;

    // Intersect (allOf) — all must match
    intersect<A, B>(a: Type<A, R>, b: Type<B, R>): Complex<A & B, R>;
    intersect<A, B, C>(a: Type<A, R>, b: Type<B, R>, c: Type<C, R>): Complex<A & B & C, R>;
    intersect<T>(types: Type<T, R>[]): Complex<T, R>;

    // Not — negation
    not<T>(typedef: Type<T, R>): Complex<unknown, R>;

    // When (if/then/else conditional)
    when(config: { if: number; then?: number; else?: number }): Complex<unknown, R>;

    string(opts?: any): Value<string, R>;
    number(opts?: any): Value<number, R>;
    boolean(): Value<boolean, R>;
    bigint(): Value<bigint, R>;
    date(): Value<Date, R>;
    uri(): Value<URL, R>;
    nullable<T>(typedef: Value<T, R>): Value<T | null, R>;
    nullable<T>(typedef: Complex<T, R>): Complex<T | null, R>;
    optional<T>(typedef: Value<T, R>): Value<T | undefined, R>;
    optional<T>(typedef: Complex<T, R>): Complex<T | undefined, R>;
}

export declare function object<T extends StrictSchema<any, R>>(
    definition: T extends StrictSchema<T, R> ? T : StrictSchema<T, R>,
    opts?: any
): Complex<InferStrictSchema<T, R>, R>;
export declare function array<T>(itemType: Type<T, R>, opts?: any): Complex<T[], R>;
export declare function union<T extends Record<string, Type<any, R>>, D extends string>(
    discriminator: D,
    variants: T
): Complex<{ [K in keyof T]: Infer<T[K]> & { [P in D]: K } }[keyof T], R>;
export declare function refine<T>(typedef: Type<T, R>, fn: (data: T) => boolean): Complex<T, R>;
export declare function transform<
    TBase extends Type<any, R>,
    TKey extends keyof Transformers
>(
    typedef: TBase,
    key: TKey
): Complex<Transformers[TKey], R>;
export declare function tuple<A>(a: Type<A, R>): Complex<[A], R>;
export declare function tuple<A, B>(a: Type<A, R>, b: Type<B, R>): Complex<[A, B], R>;
export declare function tuple<A, B, C>(a: Type<A, R>, b: Type<B, R>, c: Type<C, R>): Complex<[A, B, C], R>;
export declare function tuple<T extends any[]>(types: { [K in keyof T]: Type<T[K], R> }): Complex<T, R>;
export declare function record<T>(valueType: Type<T, R>): Complex<Record<string, T>, R>;
export declare function or<A, B>(a: Type<A, R>, b: Type<B, R>): Type<A | B, R>;
export declare function or<A, B, C>(a: Type<A, R>, b: Type<B, R>, c: Type<C, R>): Type<A | B | C, R>;
export declare function or<T>(types: Type<T, R>[]): Type<T, R>;
export declare function exclusive<A, B>(a: Type<A, R>, b: Type<B, R>): Complex<A | B, R>;
export declare function exclusive<A, B, C>(a: Type<A, R>, b: Type<B, R>, c: Type<C, R>): Complex<A | B | C, R>;
export declare function exclusive<T>(types: Type<T, R>[]): Complex<T, R>;
export declare function intersect<A, B>(a: Type<A, R>, b: Type<B, R>): Complex<A & B, R>;
export declare function intersect<A, B, C>(a: Type<A, R>, b: Type<B, R>, c: Type<C, R>): Complex<A & B & C, R>;
export declare function intersect<T>(types: Type<T, R>[]): Complex<T, R>;
export declare function not<T>(typedef: Type<T, R>): Complex<unknown, R>;
export declare function when(config: { if: number; then?: number; else?: number }): Complex<unknown, R>;
export declare function string(opts?: any): Value<string, R>;
export declare function number(opts?: any): Value<number, R>;
export declare function boolean(): Value<boolean, R>;
export declare function bigint(): Value<bigint, R>;
export declare function date(): Value<Date, R>;
export declare function uri(): Value<URL, R>;
export declare function nullable<T>(typedef: Value<T, R>): Value<T | null, R>;
export declare function nullable<T>(typedef: Complex<T, R>): Complex<T | null, R>;
export declare function optional<T>(typedef: Value<T, R>): Value<T | undefined, R>;
export declare function optional<T>(typedef: Complex<T, R>): Complex<T | undefined, R>;


export interface PathError {
    path: string;
    message: string;
}

export interface Dictionary {
    readonly KEY_DICT: Map<string, number>;
    readonly KEY_INDEX: Map<number, string>;
}

export interface Catalog<R extends symbol> {
    validate<T>(data: any, typedef: Type<T, R>): data is T;

    readonly __heap: {
        readonly HEAP: Heap;
        readonly SCR_HEAP: Heap;
        readonly DICT: Dictionary;
        readonly CALLBACKS: Array<(...args: any[]) => any>;
        readonly REGEX_CACHE: RegExp[];
        readonly S_CALLBACKS: Array<(...args: any[]) => any>;
        readonly S_REGEX_CACHE: RegExp[];

        readonly malloc: (
            header: number,
            scratch: boolean,
            inline: number,
            slabData: number[] | Uint32Array<ArrayBufferLike> | null,
            shapeLen: number,
            vHeader: number,
            vPayloads: Array<number> | null
        ) => number;

        /** Performs a dictionary lookup for a given key string. */
        readonly lookup: (key: string) => number;
    }

}

export function catalog<R extends symbol>(): Catalog<R>;

// Internal stuff

export interface Heap {
    PTR: number;
    SLAB_LEN: number;
    SHAPE_LEN: number;
    SHAPE_COUNT: number;
    KIND_LEN: number;
    KIND_PTR: number;
    VAL_LEN: number;
    VAL_PTR: number;
    SLAB: Uint32Array;
    SHAPES: Uint32Array;
    KINDS: Uint32Array;
    VALIDATORS: Float64Array;
    REGEX_CACHE: RegExp[];
    CALLBACKS: Array<(...args: any[]) => any>;
}

export interface HeapConfig {
    slab: number;
    shapes: number;
    kinds: number;
    validators: number;
}

export interface Config {
    heap: HeapConfig;
    scratch: HeapConfig;
}

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
    readonly astEdges: Uint32Array;

    // 3. VALIDATOR PAYLOADS
    // One numeric value per set payload flag (bits 0-15 of vHeader).
    // Boolean flags (bits 16-31) have no payload.
    readonly vPayloads: number[];

    // 4. STRING STORAGE
    // Property names can't live in a typed array, so they stay here.
    // Object edges reference these by index (nameIdx).
    readonly propNames: string[];

    // 5. CALLBACK/REGEX STORAGE
    // For validators that can't be expressed as numeric payloads
    // (enum, const, pattern). Referenced by N_REFINE's astChild1.
    readonly callbacks: Array<(data: any) => boolean>;
    readonly regexes: Array<RegExp>;

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
