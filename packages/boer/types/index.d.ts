import type {
    Value, Complex, Type, Infer,
    InferSchema, InferStrictSchema, StrictSchema, Schema,
    PathError, Catalog,
    ObjectFn, ArrayFn, UnionFn, RefineFn, TupleFn, RecordFn,
    OrFn, ExclusiveFn, IntersectFn, NotFn, WhenFn,
    StringFn, NumberFn, BooleanFn, NullableFn, OptionalFn,
} from '@boer/core';

declare const boer: unique symbol;
export type boer = typeof boer;

// Primitive type constants
export declare const NULL: Value<null, any>;
export declare const UNDEFINED: Value<undefined, any>;
export declare const BOOLEAN: Value<boolean, any>;
export declare const NUMBER: Value<number, any>;
export declare const STRING: Value<string, any>;
export declare const ANY: Value<any, any>;
export declare const NEVER: Value<never, any>;
export declare const VALUE: Value<boolean | number | string, any>;
export declare const ARRAY: Complex<any[], any>;
export declare const OBJECT: Complex<Record<string, any>, any>;

// Pre-bound catalog functions
export declare function validate<T>(data: any, typedef: Type<T, boer>): data is T;
export declare function diagnose(data: any, typedef: Type<any, boer>): PathError[];

// Pre-bound allocators
export declare const object: ObjectFn<boer>;
export declare const array: ArrayFn<boer>;
export declare const union: UnionFn<boer>;
export declare const refine: RefineFn<boer>;
export declare const tuple: TupleFn<boer>;
export declare const record: RecordFn<boer>;
export declare const or: OrFn<boer>;
export declare const exclusive: ExclusiveFn<boer>;
export declare const intersect: IntersectFn<boer>;
export declare const not: NotFn<boer>;
export declare const when: WhenFn<boer>;
export declare const string: StringFn<boer>;
export declare const number: NumberFn<boer>;
export declare const boolean: BooleanFn<boer>;
export declare const nullable: NullableFn<boer>;
export declare const optional: OptionalFn<boer>;

// Re-exports
export type { Value, Complex, Type, Infer, InferSchema, PathError, Schema, Catalog };
