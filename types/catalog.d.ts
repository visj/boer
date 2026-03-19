declare const complex: unique symbol;
declare const catalogId: unique symbol;

export type Primitive<T, R = unknown> = number & {
    readonly __phantom?: T;
    readonly [catalogId]?: (tag: R) => R;
};
export interface Complex<T, R = unknown> {
    readonly __phantom?: T;
    readonly [complex]: never;
    readonly [catalogId]?: (tag: R) => R;
}

export const NULL: Primitive<null, any>;
export const UNDEFINED: Primitive<undefined, any>;
export const BOOLEAN: Primitive<boolean, any>;
export const NUMBER: Primitive<number, any>;
export const STRING: Primitive<string, any>;
export const BIGINT: Primitive<bigint, any>;
export const DATE: Primitive<Date, any>;
export const URI: Primitive<URL, any>;

export const PRIMITIVE: Primitive<boolean, any> | Primitive<number, any> | Primitive<string, any> | Primitive<bigint, any> | Primitive<Date, any> | Primitive<URL, any>;

export type Type<T, R = unknown> = Primitive<T, R> | Complex<T, R>;

export type Infer<T> =
    T extends Primitive<infer U, any> ? U :
    T extends Complex<infer U, any> ? U :
    never;

export interface Schema<R> {
    [key: string]: number | Type<any, R> | Schema<R>;
}

export type InferSchema<T extends Schema<any>> = {
    [K in keyof T]: T[K] extends Primitive<infer U, any> ? U :
    T[K] extends Complex<infer U, any> ? U :
    T[K] extends number ? any :
    T[K] extends Schema<any> ? InferSchema<T[K]> :
    never;
};

export type StrictSchema<T, R> = {
    [K in keyof T]: T[K] extends Type<any, any>
    ? (T[K] extends Type<any, R> ? T[K] : { readonly __error: "Cross-registry type detected!" })
    : T[K] extends number
    ? T[K]
    : T[K] extends object
    ? StrictSchema<T[K], R>
    : T[K];
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

export interface SchemaBuilder<R> {
    object<T extends StrictSchema<R>>(
        definition: T extends StrictSchema<T, R> ? T : StrictSchema<T, R>,
        opts?: any
    ): Complex<InferSchema<T>, R>;
    array<T>(itemType: Primitive<T, R>, opts?: any): Complex<T[], R>;
    union<T extends Record<string, Primitive<any, R>>, D extends string>(
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

    string(opts?: any): Primitive<string, R>;
    number(opts?: any): Primitive<number, R>;
    boolean(): Primitive<boolean, R>;
    bigint(): Primitive<bigint, R>;
    date(): Primitive<Date, R>;
    uri(): Primitive<URL, R>;
    nullable<T>(typedef: Primitive<T, R>): Primitive<T | null, R>;
    nullable<T>(typedef: Complex<T, R>): Complex<T | null, R>;
    optional<T>(typedef: Primitive<T, R>): Primitive<T | undefined, R>;
    optional<T>(typedef: Complex<T, R>): Complex<T | undefined, R>;
}

export const NOT_STRICT = 0;
export const STRICT_REJECT = 1;
export const STRICT_DELETE = 2;
export const STRICT_PROTO = 4;

export interface PathError {
    path: string;
    message: string;
}

export interface Catalog<R> {
    t: SchemaBuilder<R>;
    v: SchemaBuilder<R>;

    is<T>(data: any, typedef: Type<T, R>, strict?: number): data is T;
    guard<T>(data: any, typedef: Type<T, R>, strict?: number): asserts data is T;
    conform<T>(data: any, typedef: Type<T, R>, preserve?: boolean): data is T;
    diagnose(data: any, typedef: Type<number, R>): any[];
    validate<T>(data: any, typedef: Type<T, R>): data is T;
}

export function catalog<R extends symbol>(): Catalog<R>;

// Internal stuff

export declare const U8 = 1;
export declare const U16 = 2;
export declare const U32 = 3;

export type u_number = typeof U8 | typeof U16 | typeof U32;

export interface Heap {
    PTR: number;
    SLAB_LEN: number;
    OBJ_LEN: number;
    OBJ_TYPE: u_number;
    OBJ_COUNT: number;
    ARR_LEN: number;
    ARR_COUNT: number;
    UNION_LEN: number;
    UNION_COUNT: number;
    TUP_LEN: number;
    TUP_TYPE: u_number;
    TUP_COUNT: number;
    MAT_LEN: number;
    MAT_TYPE: u_number;
    MAT_COUNT: number;
    KIND_LEN: number;
    KIND_PTR: number;
    VAL_LEN: number;
    VAL_PTR: number;
    SLAB: Uint32Array;
    OBJECTS: Uint16Array | Uint32Array;
    ARRAYS: Uint32Array;
    UNIONS: Uint32Array;
    TUPLES: Uint16Array | Uint32Array;
    MATCHES: Uint16Array | Uint32Array;
    KINDS: Uint32Array;
    VALIDATORS: Float64Array;
    REGEX_CACHE: RegExp[];
    CALLBACKS: Array<(...args: any[]) => any>;
}

export interface HeapConfig {
    slab: number;
    objects: number;
    arrays: number;
    unions: number;
    tuples: number;
    matches: number;
    kinds: number;
    validators: number;
}

export interface Config {
    t: HeapConfig;
    v: HeapConfig;
}