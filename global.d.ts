import type {
    Value, Complex, Type, Infer,
    Schema, StrictSchema, InferSchema, InferStrictSchema,
    PathError, Catalog, Config, Heap,
    Allocators, WhenConfig,
    StringValidators, NumberValidators, ArrayValidators, ObjectValidators,
} from '@boer/core';

import type { FlatAst, CompoundSchema } from '@boer/schema';
import type { SchemaResource } from '@boer/compiler';

declare const _boer: unique symbol;

export as namespace boer;

export {
    Value, Complex, Type, Infer,
    Schema, StrictSchema, InferSchema, InferStrictSchema,
    PathError, Catalog, Config, Heap,
    Allocators, WhenConfig,
    StringValidators, NumberValidators, ArrayValidators, ObjectValidators,
    FlatAst, CompoundSchema,
    SchemaResource,
};

export type boer = typeof _boer;
export type WhenValidators = WhenConfig;
