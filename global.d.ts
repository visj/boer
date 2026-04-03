import { type JSONSchema as _JSONSchema } from "json-schema-typed";

export * from './types/core.d.ts';

export as namespace uvd;
export type JSONSchema = _JSONSchema;

export { UVD } from './types/index.d.ts';
