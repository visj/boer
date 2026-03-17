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
// Schema Builder
// ---------------------------------------------------------------------------

export interface SchemaBuilder {
    object<T extends Schema>(definition: T): Complex<InferSchema<T>>;
    array<T>(itemType: Primitive<T>): Complex<T[]>;
    union<T extends Record<string, Primitive<any>>, D extends string>(
        discriminator: D,
        variants: T
    ): Complex<{ [K in keyof T]: Infer<T[K]> & { [P in D]: K } }[keyof T]>;
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
}

export function registry(): Registry;

// ---------------------------------------------------------------------------
// Default instance exports
// ---------------------------------------------------------------------------

export const t: SchemaBuilder;
export const v: SchemaBuilder;

// Backward-compatible top-level functions (from default instance)
export function object<T extends Schema>(definition: T): Primitive<InferSchema<T>>;
export function array<T>(itemType: Primitive<T>): Primitive<T[]>;
export function union<T extends Record<string, Primitive<any>>, D extends string>(
    discriminator: D,
    variants: T
): Primitive<{ [K in keyof T]: Infer<T[K]> & { [P in D]: K } }[keyof T]>;

export function guard<T>(data: any, typedef: Type<T>): asserts data is T;
export function check<T>(data: any, typedef: Type<T>): data is T;
export function conform<T>(data: any, typedef: Type<T>, preserve?: boolean): data is T;
export function strict<T>(data: any, typedef: Type<T>, strip?: boolean): data is T;
export function diagnose<T>(data: any, typedef: Type<T>): PathError[];
