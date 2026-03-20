import type { AstRoot } from './ast.js';

/**
 * Parses a JSON Schema object into an AstRoot suitable for compile().
 * Supports draft 2020-12 keywords. External $ref resolution is not supported;
 * users must pre-bundle schemas into a single file.
 */
export function parseJsonSchema(schema: uvd.JSONSchema | boolean): AstRoot;
