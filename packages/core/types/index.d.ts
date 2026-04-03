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
// Validator option interfaces
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
// PathError
// ────────────────────────────────────────────────────────────────────────────

export interface PathError {
    path: string;
    message: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Allocator function signatures
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
// Catalog and Heap
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
