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

// ────────────────────────────────────────────────────────────────────────────
// Validator option interfaces (user-facing DSL constraints)
// ────────────────────────────────────────────────────────────────────────────

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
    additionalProperties?: false | number;
}

export interface WhenConfig {
    if: number;
    then?: number;
    else?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// PathError — returned by diagnose()
// ────────────────────────────────────────────────────────────────────────────

export interface PathError {
    path: string;
    message: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Allocator function signatures — defined once, used by Allocators and index
// ────────────────────────────────────────────────────────────────────────────

export interface ObjectFn<R extends symbol> {
    <T extends StrictSchema<any, R>>(
        definition: T extends StrictSchema<T, R> ? T : StrictSchema<T, R>,
        opts?: ObjectValidators
    ): Complex<InferStrictSchema<T, R>, R>;
}

export interface ArrayFn<R extends symbol> {
    <T>(itemType: Type<T, R>, opts?: ArrayValidators): Complex<T[], R>;
}

export interface UnionFn<R extends symbol> {
    <T extends Record<string, Type<any, R>>, D extends string>(
        discriminator: D,
        variants: T
    ): Complex<{ [K in keyof T]: Infer<T[K]> & { [P in D]: K } }[keyof T], R>;
}

export interface RefineFn<R extends symbol> {
    <T>(typedef: Type<T, R>, fn: (data: T) => boolean): Complex<T, R>;
}

export interface TupleFn<R extends symbol> {
    <A>(a: Type<A, R>): Complex<[A], R>;
    <A, B>(a: Type<A, R>, b: Type<B, R>): Complex<[A, B], R>;
    <A, B, C>(a: Type<A, R>, b: Type<B, R>, c: Type<C, R>): Complex<[A, B, C], R>;
    <T extends any[]>(types: { [K in keyof T]: Type<T[K], R> }): Complex<T, R>;
}

export interface RecordFn<R extends symbol> {
    <T>(valueType: Type<T, R>): Complex<Record<string, T>, R>;
}

export interface OrFn<R extends symbol> {
    <A, B>(a: Type<A, R>, b: Type<B, R>): Type<A | B, R>;
    <A, B, C>(a: Type<A, R>, b: Type<B, R>, c: Type<C, R>): Type<A | B | C, R>;
    <T>(types: Type<T, R>[]): Type<T, R>;
}

export interface ExclusiveFn<R extends symbol> {
    <A, B>(a: Type<A, R>, b: Type<B, R>): Complex<A | B, R>;
    <A, B, C>(a: Type<A, R>, b: Type<B, R>, c: Type<C, R>): Complex<A | B | C, R>;
    <T>(types: Type<T, R>[]): Complex<T, R>;
}

export interface IntersectFn<R extends symbol> {
    <A, B>(a: Type<A, R>, b: Type<B, R>): Complex<A & B, R>;
    <A, B, C>(a: Type<A, R>, b: Type<B, R>, c: Type<C, R>): Complex<A & B & C, R>;
    <T>(types: Type<T, R>[]): Complex<T, R>;
}

export interface NotFn<R extends symbol> {
    <T>(typedef: Type<T, R>): Complex<unknown, R>;
}

export interface WhenFn<R extends symbol> {
    (config: WhenConfig): Complex<unknown, R>;
}

export interface LiteralFn<R extends symbol> {
    (value: any): Type<any, R>;
}

export interface EnumFn<R extends symbol> {
    (values: any[]): Type<any, R>;
}

export interface StringFn<R extends symbol> {
    (opts?: StringValidators): Value<string, R>;
}

export interface NumberFn<R extends symbol> {
    (opts?: NumberValidators): Value<number, R>;
}

export interface BooleanFn<R extends symbol> {
    (): Value<boolean, R>;
}

export interface NullableFn<R extends symbol> {
    <T>(typedef: Value<T, R>): Value<T | null, R>;
    <T>(typedef: Complex<T, R>): Complex<T | null, R>;
}

export interface OptionalFn<R extends symbol> {
    <T>(typedef: Value<T, R>): Value<T | undefined, R>;
    <T>(typedef: Complex<T, R>): Complex<T | undefined, R>;
}

// ────────────────────────────────────────────────────────────────────────────
// Allocators — returned by allocators(cat)
// ────────────────────────────────────────────────────────────────────────────

export interface Allocators<R extends symbol> {
    object: ObjectFn<R>;
    array: ArrayFn<R>;
    union: UnionFn<R>;
    refine: RefineFn<R>;
    tuple: TupleFn<R>;
    record: RecordFn<R>;
    or: OrFn<R>;
    exclusive: ExclusiveFn<R>;
    intersect: IntersectFn<R>;
    not: NotFn<R>;
    when: WhenFn<R>;
    literal: LiteralFn<R>;
    enum: EnumFn<R>;
    string: StringFn<R>;
    number: NumberFn<R>;
    boolean: BooleanFn<R>;
    nullable: NullableFn<R>;
    optional: OptionalFn<R>;
}

// ────────────────────────────────────────────────────────────────────────────
// Catalog — returned by catalog()
// ────────────────────────────────────────────────────────────────────────────

export interface Heap {
    PTR: number;
    SLAB_LEN: number;
    KIND_LEN: number;
    KIND_PTR: number;
    VAL_LEN: number;
    VAL_PTR: number;
    SLAB: Uint32Array;
    KINDS: Uint32Array;
    VALIDATORS: Float64Array;
}

export interface Catalog<R extends symbol> {
    validate<T>(data: any, typedef: Type<T, R>): data is T;

    readonly __heap: {
        readonly HEAP: Heap;
        readonly REGEX_CACHE: RegExp[];
        readonly CALLBACKS: Array<(...args: any[]) => any>;
        readonly CONSTANTS: Array<any>;
        readonly ENUMS: Array<Set<any>>;
        readonly KEY_DICT: Map<string, number>;
        readonly KEY_INDEX: string[];
        readonly lookup: (key: string) => number;
        readonly _validate: (data: any, typedef: number, trackPtr: number, snapPtr: number) => boolean;
        readonly resizeSlab: () => void;
        readonly resizeKinds: () => void;
        readonly resizeValidators: () => void;
    };
}

export interface Config {
    slab?: number;
    kinds?: number;
    validators?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Bit-level constants
// ────────────────────────────────────────────────────────────────────────────

export declare const COMPLEX: number;
export declare const NULLABLE: number;
export declare const OPTIONAL: number;

// ────────────────────────────────────────────────────────────────────────────
// Factory functions (uvd/core entry point)
// ────────────────────────────────────────────────────────────────────────────

export declare function catalog<R extends symbol>(cfg?: Config): Catalog<R>;

export declare function allocators<R extends symbol>(cat: Catalog<R>): Allocators<R>;

export declare function objectAllocator<R extends symbol>(cat: Catalog<R>): ObjectFn<R>;
export declare function arrayAllocator<R extends symbol>(cat: Catalog<R>): ArrayFn<R>;
export declare function unionAllocator<R extends symbol>(cat: Catalog<R>): UnionFn<R>;
export declare function valueAllocator<R extends symbol>(cat: Catalog<R>, primConst: number): (opts?: StringValidators | NumberValidators) => Value<any, R>;
export declare function refineAllocator<R extends symbol>(cat: Catalog<R>): RefineFn<R>;
export declare function tupleAllocator<R extends symbol>(cat: Catalog<R>): TupleFn<R>;
export declare function recordAllocator<R extends symbol>(cat: Catalog<R>): RecordFn<R>;
export declare function orAllocator<R extends symbol>(cat: Catalog<R>): OrFn<R>;
export declare function exclusiveAllocator<R extends symbol>(cat: Catalog<R>): ExclusiveFn<R>;
export declare function intersectAllocator<R extends symbol>(cat: Catalog<R>): IntersectFn<R>;
export declare function notAllocator<R extends symbol>(cat: Catalog<R>): NotFn<R>;
export declare function whenAllocator<R extends symbol>(cat: Catalog<R>): WhenFn<R>;

export declare function createDiagnose<R extends symbol>(
    cat: Catalog<R>
): (data: any, typedef: Type<any, R>) => PathError[];

export declare function createConform<R extends symbol>(
    cat: Catalog<R>
): <T>(data: any, typedef: Type<T, R>, preserve?: boolean) => data is T;

// ────────────────────────────────────────────────────────────────────────────
// FlatAst — Structure-of-Arrays representation of a parsed JSON Schema.
// Produced by CompoundSchema.bundle(), consumed by compile().
// ────────────────────────────────────────────────────────────────────────────

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

export interface SchemaResource<T = any, R extends symbol = any> {
    uri: string;
    id: string | null;
    anchor: string | null;
    schema: Type<T, R>;
    name: string | null;
}

export declare function compile<R extends symbol>(
    catalog: Catalog<R>,
    ast: FlatAst
): SchemaResource<any, R>[];

// ────────────────────────────────────────────────────────────────────────────
// CompoundSchema — multi-schema bundler for JSON Schema compilation
// ────────────────────────────────────────────────────────────────────────────

export declare class CompoundSchema {
    constructor(dialect?: string);

    readonly schemas: any[];
    readonly names: Array<string | null>;
    readonly count: number;

    /**
     * Adds a schema to this compound. Returns an index to pass to bundle().
     */
    add(schema: any, id?: string, name?: string): number;

    /**
     * Bundles one or more schema entry points into a FlatAst.
     */
    bundle(schemas: number | number[]): FlatAst;
}

// ────────────────────────────────────────────────────────────────────────────
// Inspection utilities — print, dump, load
// ────────────────────────────────────────────────────────────────────────────

export declare function print(cat: Catalog<any>): {
    stats: Record<string, number>;
    config: Config;
};

export declare function dump(cat: Catalog<any>): Uint8Array;

export declare function load(bin: Uint8Array, cfg?: Config): Catalog<any>;
