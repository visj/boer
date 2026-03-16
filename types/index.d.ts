
export type Type<T> = number & { readonly __phantom?: T };

export type Infer<T> = T extends Type<infer U> ? U : never;

export const UNDEFINED: Type<undefined>;
export const NULL: Type<null>;
export const BOOLEAN: Type<boolean>;
export const NUMBER: Type<number>;
export const STRING: Type<string>;
export const BIGINT: Type<bigint>;
export const DATE: Type<Date>;
export const URI: Type<URL>;


export const ARRAY: number;
export const UNION: number;
export const VALUE: Type<boolean> | Type<number> | Type<string> | Type<bigint> | Type<Date> | Type<URL>;


export interface Schema {
    [key: string]: number | Type<any> | Schema;
}

type InferSchema<T extends Schema> = {
    [K in keyof T]: T[K] extends Type<infer U>
    ? U
    : T[K] extends number
    ? any // Fallback for raw bitmasks without phantom types
    : T[K] extends Schema
    ? InferSchema<T[K]>
    : never;
};

/**
 * Defines an object type
 * @param definition An object literal, { key: Type }, can be nested
 */
export function object<T extends Schema>(
    definition: T
): Type<InferSchema<T>>;

/**
 * Defines an array type
 * @param itemType The type, like Array<Type> 
 */
export function array<T>(
    itemType: Type<T>
): Type<T[]>;

/**
 * 
 * @param discriminator 
 * @param variants 
 */
export function union<T extends Record<string, Type<any>>, D extends string>(
    discriminator: D,
    variants: T
): Type<{ [K in keyof T]: Infer<T[K]> & { [P in D]: K } }[keyof T]>;

/**
 * Asserts that `data` matches the `typedef` schema.
 * Calls `check` internally.
 * Throws an error if validation fails.
 * @param data The data to validate
 * @param typedef The typedef to check against
 * @throws {PathError[]} If the data does not match the schema
 */
export function guard<T>(data: any, typedef: Type<T>): asserts json is T;

/**
 * Validate that `data` conforms to the schema
 * 
 */
export function check<T>(data: any, typedef: Type<T>): json is T;

/**
 * Parses `data` in-place. Validates JSON-native types strictly,
 * but hydrates rich types (Date, URL, BigInt) from strings/numbers.
 * @param data 
 * @param typedef 
 */
export function conform<T>(data: any, typedef: Type<T>): json is T;

/**
 * Parses `json` in-place. Validates JSON-native types strictly,
 * but hydrates rich types (Date, URL, BigInt) from strings/numbers.
 */
export function strict<T>(json: any, typedef: Type<T>, strip?: boolean): json is T;

// ---------------------------------------------------------------------------
// ERROR REPORTING
// ---------------------------------------------------------------------------

export interface PathError {
    path: string;
    message: string;
}

/**
 * 
 * @param json 
 * @param typedef 
 */
export function explain(json: any, typedef: number): PathError[];