import type {
    Value, Complex, Type, Infer,
    Schema, StrictSchema, InferSchema, InferStrictSchema,
    PathError, Catalog, Config, Heap,
    Allocators, WhenConfig,
    StringValidators, NumberValidators, ArrayValidators, ObjectValidators,
} from '@luvd/core';

import type { FlatAst, CompoundSchema } from '@luvd/schema';
import type { SchemaResource } from '@luvd/compiler';

declare const _UVD: unique symbol;

export as namespace uvd;

export {
    Value, Complex, Type, Infer,
    Schema, StrictSchema, InferSchema, InferStrictSchema,
    PathError, Catalog, Config, Heap,
    Allocators, WhenConfig,
    StringValidators, NumberValidators, ArrayValidators, ObjectValidators,
    FlatAst, CompoundSchema,
    SchemaResource,
};

export type UVD = typeof _UVD;
export type WhenValidators = WhenConfig;
