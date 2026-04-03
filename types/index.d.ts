import type {
    Value, Complex, Type, Infer,
    InferSchema, InferStrictSchema, StrictSchema, Schema,
    PathError, Catalog,
    ObjectFn, ArrayFn, UnionFn, RefineFn, TupleFn, RecordFn,
    OrFn, ExclusiveFn, IntersectFn, NotFn, WhenFn,
    StringFn, NumberFn, BooleanFn, NullableFn, OptionalFn,
} from './core.d.ts';

declare const UVD: unique symbol;
export type UVD = typeof UVD;

// ────────────────────────────────────────────────────────────────────────────
// Primitive type constants
// ────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────
// Pre-bound catalog functions
// ────────────────────────────────────────────────────────────────────────────

export declare function validate<T>(data: any, typedef: Type<T, UVD>): data is T;
export declare function conform<T>(data: any, typedef: Type<T, UVD>, preserve?: boolean): data is T;
export declare function diagnose(data: any, typedef: Type<any, UVD>): PathError[];

// ────────────────────────────────────────────────────────────────────────────
// Pre-bound allocators (from allocators(uvd))
// ────────────────────────────────────────────────────────────────────────────

export declare const object: ObjectFn<UVD>;
export declare const array: ArrayFn<UVD>;
export declare const union: UnionFn<UVD>;
export declare const refine: RefineFn<UVD>;
export declare const tuple: TupleFn<UVD>;
export declare const record: RecordFn<UVD>;
export declare const or: OrFn<UVD>;
export declare const exclusive: ExclusiveFn<UVD>;
export declare const intersect: IntersectFn<UVD>;
export declare const not: NotFn<UVD>;
export declare const when: WhenFn<UVD>;
export declare const string: StringFn<UVD>;
export declare const number: NumberFn<UVD>;
export declare const boolean: BooleanFn<UVD>;
export declare const nullable: NullableFn<UVD>;
export declare const optional: OptionalFn<UVD>;

// ────────────────────────────────────────────────────────────────────────────
// Re-exports
// ────────────────────────────────────────────────────────────────────────────

export type { Value, Complex, Type, Infer, InferSchema, PathError, Schema, Catalog };
