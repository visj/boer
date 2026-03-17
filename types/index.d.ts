declare const complex: unique symbol;
export type Primitive<T> = number & { readonly __phantom?: T };
export interface Complex<T> {
    readonly __phantom?: T;
    readonly [complex]: never;
}

export type Infer<T> = T extends Primitive<infer U> ? U : never;

export const NULL: Primitive<null>;
export const UNDEFINED: Primitive<undefined>;
export const BOOLEAN: Primitive<boolean>;
export const NUMBER: Primitive<number>;
export const STRING: Primitive<string>;
export const BIGINT: Primitive<bigint>;
export const DATE: Primitive<Date>;
export const URI: Primitive<URL>;

export const VALUE: Primitive<boolean> | Primitive<number> | Primitive<string> | Primitive<bigint> | Primitive<Date> | Primitive<URL>;

export type Type<T> = Primitive<T> | Complex<T>;

export function nullable<T>(typedef: Type<T>): Primitive<T | null>;
export function optional<T>(typedef: Type<T>): Primitive<T | undefined>;


export type Infer<T> =
    T extends Primitive<infer U> ? U :
    T extends Complex<infer U> ? U :
    never;

export interface Schema {
    [key: string]: number | Type<any> | Schema;
}

type InferSchema<T extends Schema> = {
    [K in keyof T]: T[K] extends Primitive<infer U>
    ? U
    : T[K] extends ComplexType<infer U>
    ? U
    : T[K] extends number
    ? any // Fallback for raw bitmasks without phantom types
    : T[K] extends Schema
    ? InferSchema<T[K]>
    : never;
};

// ---------------------------------------------------------------------------
// Validator Options
// ---------------------------------------------------------------------------

export interface StringValidators {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp | string;
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
}

export interface ObjectValidators {
    minProperties?: number;
    maxProperties?: number;
}

// ---------------------------------------------------------------------------
// Schema Builder
// ---------------------------------------------------------------------------

export interface SchemaBuilder {
    object<T extends Schema>(definition: T, opts?: ObjectValidators): Complex<InferSchema<T>>;
    array<T>(itemType: Primitive<T>, opts?: ArrayValidators): Complex<T[]>;
    union<T extends Record<string, Primitive<any>>, D extends string>(
        discriminator: D,
        variants: T
    ): Complex<{ [K in keyof T]: Infer<T[K]> & { [P in D]: K } }[keyof T]>;
    string(opts?: StringValidators): Primitive<string>;
    number(opts?: NumberValidators): Primitive<number>;
    boolean(): Primitive<boolean>;
    bigint(): Primitive<bigint>;
    date(): Primitive<Date>;
    uri(): Primitive<URL>;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export interface PathError {
    path: string;
    message: string;
}

export interface Registry {
    t: SchemaBuilder;
    v: SchemaBuilder;
    check<T>(data: any, typedef: Primitive<T>): data is T;
    guard<T>(data: any, typedef: Primitive<T>): asserts data is T;
    conform<T>(data: any, typedef: Primitive<T>, preserve?: boolean): data is T;
    strict<T>(data: any, typedef: Primitive<T>, strip?: boolean): data is T;
    diagnose(data: any, typedef: Primitive<number>): PathError[];
    validate<T>(data: any, typedef: Type<T>): data is T;
}

export function registry(): Registry;

// ---------------------------------------------------------------------------
// Default instance exports
// ---------------------------------------------------------------------------

export const t: SchemaBuilder;
export const v: SchemaBuilder;
