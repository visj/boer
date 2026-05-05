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

export interface PathError {
    path: string;
    message: string;
}

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
        readonly resizeSlab: (buf: Uint32Array) => void;
        readonly resizeKinds: (buf: Uint32Array) => void;
        readonly resizeValidators: (buf: Float64Array) => void;
    };
}

export interface Config {
  HEAP: Heap;
  keyseq: number;
  slab: number;
  kinds: number;
  validators: number;
  REGEX_CACHE: RegExp[];
  CALLBACKS: Array<(...args: any[]) => any>;
  CONSTANTS: Array<any>;
  ENUMS: Array<Set<any>>;
  KEY_DICT: Map<string, number>;
  KEY_INDEX: string[];
}

/** Bit 0: complex typedef (pointer into KINDS vtable) */
export declare const COMPLEX: number;
/** Bit 1: typedef accepts null */
export declare const NULLABLE: number;
/** Bit 2: typedef accepts undefined */
export declare const OPTIONAL: number;

/** Primitive type bits (bits 3-7) */
export declare const ANY: number;
export declare const STRING: number;
export declare const NUMBER: number;
export declare const INTEGER: number;
export declare const BOOLEAN: number;
/** NEVER is 0 — a typedef with no type bits set matches nothing */
export declare const NEVER: number;

/** All primitive type bits combined */
export declare const SIMPLE: number;
/** Value types only (STRING | NUMBER | INTEGER | BOOLEAN) */
export declare const VALUE: number;
/** Mask for bits 0-7 (COMPLEX + NULLABLE + OPTIONAL + primitive bits) */
export declare const PRIM_MASK: number;

/** Backward-compatible aliases */
export declare const NULL: number;
export declare const UNDEFINED: number;

/** Inline modifier bits (bits 8-10) */
export declare const MODIFIER: number;
export declare const MOD_ARRAY: number;
export declare const MOD_RECORD: number;
export declare const MOD_ENUM: number;
export declare const MOD_MASK: number;

/** Shift to encode/decode KINDS array index in a complex typedef */
export declare const KINDS_SHIFT: number;

/** Mask for payload-bearing validator flags (bits 0-13) */
export declare const V_PAYLOAD_MASK: number;

/** MOD_ENUM inline payload bits */
export declare const MOD_ENUM_IS_SET: number;
export declare const MOD_ENUM_IDX_SHIFT: number;
export declare const MOD_ENUM_IDX_MASK: number;

/** MOD_ARRAY inline payload bits */
export declare const MOD_ARRAY_UNIQUE_BIT: number;
export declare const MOD_ARRAY_MAX_ITEMS_SHIFT: number;
export declare const MOD_ARRAY_MAX_ITEMS_MASK: number;
export declare const MOD_ARRAY_MAX_ITEMS_LIMIT: number;
export declare const MOD_ARRAY_MIN_ITEMS_SHIFT: number;
export declare const MOD_ARRAY_MIN_ITEMS_MASK: number;
export declare const MOD_ARRAY_MIN_ITEMS_LIMIT: number;

/** MOD_RECORD inline payload bits */
export declare const MOD_RECORD_MAX_PROPS_SHIFT: number;
export declare const MOD_RECORD_MAX_PROPS_MASK: number;
export declare const MOD_RECORD_MAX_PROPS_LIMIT: number;
export declare const MOD_RECORD_MIN_PROPS_SHIFT: number;
export declare const MOD_RECORD_MIN_PROPS_MASK: number;
export declare const MOD_RECORD_MIN_PROPS_LIMIT: number;

/** Inline STRING validator payload bits */
export declare const STR_REGEX_IDX_SHIFT: number;
export declare const STR_REGEX_IDX_MASK: number;
export declare const STR_REGEX_IDX_LIMIT: number;
export declare const STR_MAX_LEN_SHIFT: number;
export declare const STR_MAX_LEN_MASK: number;
export declare const STR_MAX_LEN_LIMIT: number;
export declare const STR_MIN_LEN_SHIFT: number;
export declare const STR_MIN_LEN_MASK: number;
export declare const STR_MIN_LEN_LIMIT: number;

/** Inline NUMBER/INTEGER validator payload bits */
export declare const NUM_HAS_MIN_BIT: number;
export declare const NUM_EXCL_MIN_BIT: number;
export declare const NUM_EXCL_MAX_BIT: number;
export declare const NUM_MIN_NEG_BIT: number;
export declare const NUM_MAX_NEG_BIT: number;
export declare const NUM_MIN_MAG_SHIFT: number;
export declare const NUM_MIN_MAG_MASK: number;
export declare const NUM_MIN_MAG_LIMIT: number;
export declare const NUM_MAX_MAG_SHIFT: number;
export declare const NUM_MAX_MAG_MASK: number;
export declare const NUM_MAX_MAG_LIMIT: number;

/** Evaluation tracking bit-packing */
export declare const WORD_IDX_SHIFT: number;
export declare const WORD_BIT_MASK: number;
export declare const UNKNOWN_KEY_FLAG: number;

/** KINDS header flags */
export declare const K_VALIDATOR: number;
export declare const K_ANY_INNER: number;
export declare const K_STRICT: number;
export declare const K_HAS_ITEMS: number;
export declare const K_HAS_REST: number;
export declare const K_ALL_REQUIRED: number;

/** Complex KINDS enum (bits 0-3) */
export declare const K_PRIMITIVE: number;
export declare const K_OBJECT: number;
export declare const K_ARRAY: number;
export declare const K_RECORD: number;
export declare const K_OR: number;
export declare const K_EXCLUSIVE: number;
export declare const K_INTERSECT: number;
export declare const K_UNION: number;
export declare const K_TUPLE: number;
export declare const K_REFINE: number;
export declare const K_NOT: number;
export declare const K_CONDITIONAL: number;
export declare const K_DYN_ANCHOR: number;
export declare const K_DYN_REF: number;
export declare const K_UNEVALUATED: number;
export declare const KIND_ENUM_MASK: number;

export declare const BARE_ARRAY: number;
export declare const BARE_OBJECT: number;
export declare const BARE_RECORD: number;

/** Validator bit flags — string */
export declare const V_MIN_LENGTH: number;
export declare const V_MAX_LENGTH: number;
export declare const V_PATTERN: number;
export declare const V_FORMAT: number;
/** Validator bit flags — number */
export declare const V_MINIMUM: number;
export declare const V_MAXIMUM: number;
export declare const V_MULTIPLE_OF: number;
export declare const V_EXCLUSIVE_MINIMUM: number;
export declare const V_EXCLUSIVE_MAXIMUM: number;
/** Validator bit flags — array */
export declare const V_MIN_ITEMS: number;
export declare const V_MAX_ITEMS: number;
export declare const V_CONTAINS: number;
export declare const V_MIN_CONTAINS: number;
export declare const V_MAX_CONTAINS: number;
export declare const V_PRIMITIVE_ITEMS: number;
export declare const V_UNIQUE_ITEMS: number;
/** Validator bit flags — object */
export declare const V_MIN_PROPERTIES: number;
export declare const V_MAX_PROPERTIES: number;
export declare const V_PATTERN_PROPERTIES: number;
export declare const V_PROPERTY_NAMES: number;
export declare const V_ADDITIONAL_PROPERTIES: number;
export declare const V_DEPENDENT_REQUIRED: number;
export declare const V_DEPENDENT_SCHEMAS: number;
export declare const V_UNEVALUATED_ITEMS: number;
export declare const V_UNEVALUATED_PROPERTIES: number;
/** Validator bit flags — enum */
export declare const V_ENUM: number;
export declare const BOOL_ENUM_TRUE: number;
export declare const BOOL_ENUM_FALSE: number;

/** Format enum values */
export declare const FMT_EMAIL: number;
export declare const FMT_IPV4: number;
export declare const FMT_UUID: number;
export declare const FMT_DATE: number;
export declare const FMT_TIME: number;
export declare const FMT_DATETIME: number;
export declare const FMT_MAP: Record<string, number>;

/** Format validation regexes */
export declare const FMT_RE_EMAIL: RegExp;
export declare const FMT_RE_IPV4: RegExp;
export declare const FMT_RE_UUID: RegExp;
export declare const FMT_RE_DATETIME: RegExp;


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

export declare const FAIL: symbol;
export declare const toString: typeof Object.prototype.toString;
export declare const hasOwnProperty: typeof Object.prototype.hasOwnProperty;

export declare function nullable<T>(typedef: T): number;
export declare function optional<T>(typedef: T): number;
export declare function isNumber(v: any): v is number;
export declare function isString(v: any): v is string;
export declare function isObject(v: any): boolean;
export declare function isBoolean(v: any): v is boolean;
export declare function isValidDate(s: string): boolean;
export declare function isValidTime(s: string): boolean;
export declare function isValidDateTime(s: string): boolean;
export declare function deepEqual(a: any, b: any): boolean;
export declare function sortByKeyId(buffer: number[]): void;
export declare function parseValue(data: any, mask: number, reify: boolean): any;
export declare function _isValue(data: any, primBits: number): boolean;
export declare function describeType(typedef: number, kinds?: Uint32Array): string;
export declare function binarySearch(arr: Uint32Array | Float64Array, key: number, lo: number, hi: number): number;
export declare function binarySearchPair(arr: Uint32Array | Float64Array, key: number, lo: number, hi: number): number;
export declare function popcnt16(x: number): number;
export declare function codepointLen(s: string): number;

export declare const PAYLOAD_QUEUE: { REGEX: Array<RegExp | null>; REGEX_LEN: number };
export declare function packValidators(opts: any, mask: number, lookup: ((key: string) => number) | null): number[];

export declare const ERROR_MESSAGES: string[];
export declare const ERR_ARRAY_ELEMENT_MUST_BE_NUMBER: number;
export declare const ERR_CONFIG_FIELD_MUST_BE_NUMBER: number;
export declare function assert<T>(value: any, predicate: (v: any) => v is T, errorId: number): asserts value is T;
export declare function assertIsNumber(value: any, errorId: number): asserts value is number;
export declare function assertIsObject(value: any, errorId: number): asserts value is object;
