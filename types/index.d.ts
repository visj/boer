declare const complex: unique symbol;
declare const registryId: unique symbol;

export type Primitive<T, R = unknown> = number & {
    readonly __phantom?: T;
    readonly [registryId]?: (tag: R) => R;
};
export interface Complex<T, R = unknown> {
    readonly __phantom?: T;
    readonly [complex]: never;
    readonly [registryId]?: (tag: R) => R;
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

type InferSchema<T extends Schema<any>> = {
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

// ---------------------------------------------------------------------------
// Validator Options
// ---------------------------------------------------------------------------

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
}

// ---------------------------------------------------------------------------
// Schema Builder
// ---------------------------------------------------------------------------

export interface SchemaBuilder<R> {
    object<T extends Schema<R>>(
        definition: T extends StrictSchema<T, R> ? T : StrictSchema<T, R>,
        opts?: any
    ): Complex<InferSchema<T>, R>;
    array<T>(itemType: Primitive<T, R>, opts?: any): Complex<T[], R>;
    union<T extends Record<string, Primitive<any, R>>, D extends string>(
        discriminator: D,
        variants: T
    ): Complex<{ [K in keyof T]: Infer<T[K]> & { [P in D]: K } }[keyof T], R>;

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

export type StrictFlag = typeof NOT_STRICT | typeof STRICT_REJECT | typeof STRICT_DELETE;

export interface PathError {
    path: string;
    message: string;
}

export interface Registry<R> {
    t: SchemaBuilder<R>;
    v: SchemaBuilder<R>;

    check<T>(data: any, typedef: Primitive<T, R>, strict?: StrictFlag): data is T;
    guard<T>(data: any, typedef: Primitive<T, R>): asserts data is T;
    conform<T>(data: any, typedef: Primitive<T, R>, preserve?: boolean): data is T;
    strict<T>(data: any, typedef: Primitive<T, R>, strip?: boolean): data is T;
    diagnose(data: any, typedef: Primitive<number, R>): any[];
    validate<T>(data: any, typedef: Type<T, R>): data is T;
}

export function registry<R extends symbol>(): Registry<R>;

// ---------------------------------------------------------------------------
// Default instance exports
// ---------------------------------------------------------------------------

declare const defaultRegistry: unique symbol;
export type DefaultRegistry = typeof defaultRegistry;

// 2. Lock the default builders to this specific symbol
export const t: SchemaBuilder<DefaultRegistry>;
export const v: SchemaBuilder<DefaultRegistry>;

// 3. Lock all the default utility functions to the same symbol
export function check<T>(data: any, typedef: Primitive<T, DefaultRegistry>): data is T;
export function guard<T>(data: any, typedef: Primitive<T, DefaultRegistry>): asserts data is T;
export function conform<T>(data: any, typedef: Primitive<T, DefaultRegistry>, preserve?: boolean): data is T;
export function strict<T>(data: any, typedef: Primitive<T, DefaultRegistry>, strip?: boolean): data is T;
export function diagnose(data: any, typedef: Primitive<number, DefaultRegistry>): any[];
export function validate<T>(data: any, typedef: Type<T, DefaultRegistry>): data is T;