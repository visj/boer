import {
    Primitive, Complex, Schema, SchemaBuilder, Catalog,
    NULL, UNDEFINED, BOOLEAN, NUMBER, STRING, DATE, URI,
    ANY, NEVER, TRUE, FALSE, ARRAY, OBJECT,
    type Primitive, type Complex, type Type, type Infer,
    type InferSchema, type PathError
} from "./catalog.js";

declare const UVD: unique symbol;
export type UVD = typeof UVD;

export declare const uvd: Catalog<UVD>;

// 2. Lock the default builders to this specific symbol
export declare const t: SchemaBuilder<UVD>;
export declare const v: SchemaBuilder<UVD>;

// 3. Lock all the default utility functions to the same symbol
export declare function check<T>(data: any, typedef: Type<T, UVD>): data is T;
export declare function guard<T>(data: any, typedef: Type<T, UVD>): asserts data is T;
export declare function conform<T>(data: any, typedef: Type<T, UVD>, preserve?: boolean): data is T;
export declare function validate<T>(data: any, typedef: Type<T, UVD>): data is T;
export declare function diagnose(data: any, typedef: Type<number, UVD>): PathError[];

export { NULL, UNDEFINED, BOOLEAN, NUMBER, STRING, DATE, URI, ANY, NEVER, TRUE, FALSE, ARRAY, OBJECT }

export { Primitive, Complex, Catalog as Atlas }

export { Infer, InferSchema, Type, Complex }