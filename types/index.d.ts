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

export declare function validate<T>(data: any, typedef: Type<T, UVD>): data is T;
export declare function conform<T>(data: any, typedef: Type<T, UVD>, preserve?: boolean): data is T;
export declare function diagnose(data: any, typedef: Type<number, UVD>): PathError[];

export { NULL, UNDEFINED, BOOLEAN, NUMBER, STRING, DATE, URI, ANY, NEVER, TRUE, FALSE, ARRAY, OBJECT }

export { Primitive, Complex, Catalog }

export { Infer, InferSchema, Type, Complex }

