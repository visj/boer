import { 
    Primitive, Complex, Schema, SchemaBuilder, Registry,
    NULL, UNDEFINED, BOOLEAN, NUMBER, STRING, DATE, URI
} from "./core";

declare const uvd: unique symbol;
export type UvdRegistry = typeof uvd;

// 2. Lock the default builders to this specific symbol
export const t: SchemaBuilder<UvdRegistry>;
export const v: SchemaBuilder<UvdRegistry>;

// 3. Lock all the default utility functions to the same symbol
export function check<T>(data: any, typedef: Primitive<T, UvdRegistry>): data is T;
export function guard<T>(data: any, typedef: Primitive<T, UvdRegistry>): asserts data is T;
export function conform<T>(data: any, typedef: Primitive<T, UvdRegistry>, preserve?: boolean): data is T;
export function strict<T>(data: any, typedef: Primitive<T, UvdRegistry>, strip?: boolean): data is T;
export function diagnose(data: any, typedef: Primitive<number, UvdRegistry>): any[];
export function validate<T>(data: any, typedef: Type<T, UvdRegistry>): data is T;

export { NULL, UNDEFINED, BOOLEAN, NUMBER, STRING, DATE, URI }

export { Primitive, Complex, Registry }