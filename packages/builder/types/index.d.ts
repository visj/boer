import type {
    Catalog, Allocators,
    ObjectFn, ArrayFn, UnionFn, RefineFn, TupleFn, RecordFn,
    OrFn, ExclusiveFn, IntersectFn, NotFn, WhenFn,
    StringValidators, NumberValidators, Value,
} from '@uvd/core';

export declare function allocators<R extends symbol>(cat: Catalog<R>): Allocators<R>;

export declare function objectAllocator<R extends symbol>(cat: Catalog<R>): ObjectFn<R>;
export declare function arrayAllocator<R extends symbol>(cat: Catalog<R>): ArrayFn<R>;
export declare function unionAllocator<R extends symbol>(cat: Catalog<R>): UnionFn<R>;
export declare function valueAllocator<R extends symbol>(cat: Catalog<R>, primConst: number): (opts?: StringValidators | NumberValidators) => Value<any, R>;
export declare function refineAllocator<R extends symbol>(cat: Catalog<R>): RefineFn<R>;
export declare function tupleAllocator<R extends symbol>(cat: Catalog<R>): TupleFn<R>;
export declare function recordAllocator<R extends symbol>(cat: Catalog<R>): RecordFn<R>;
export declare function orAllocator<R extends symbol>(cat: Catalog<R>): OrFn<R>;
export declare function exclusiveAllocator<R extends symbol>(cat: Catalog<R>): ExclusiveFn<R>;
export declare function intersectAllocator<R extends symbol>(cat: Catalog<R>): IntersectFn<R>;
export declare function notAllocator<R extends symbol>(cat: Catalog<R>): NotFn<R>;
export declare function whenAllocator<R extends symbol>(cat: Catalog<R>): WhenFn<R>;

export declare function malloc(ctx: any, header: number, inline: number, slabData: any, shapeLen: number, vHeader: number, vPayloads: any): number;
export declare function allocConstant(ctx: any, value: any): number;
export declare function allocEnumSet(ctx: any, values: any): number;
