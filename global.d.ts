import { type JSONSchema as _JSONSchema } from "json-schema-typed";

export * as cat from './types/catalog.js';
export * as ast from './types/ast.js';
export * as inspect from './types/inspect.js';

export as namespace uvd;
export type JSONSchema = _JSONSchema;

export { UVD } from './types/index.d.ts';