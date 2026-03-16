import type { Schema as _Schema } from ".";

/**
 * Shims for Special Types in the Closure Type System.
 * These follow the exact structural definitions used by the Closure Compiler.
 */
declare global {
  type Schema = _Schema;
  
  /**
   * IObject describes the "[]" operator (computed property accessor).
   * It restricts the key and value types for map-like objects.
   * @template KEY, VALUE
   */
  type IObject<KEY extends string | number, VALUE> = {
    [key in KEY]: VALUE;
  }
}

// Essential for global augmentation in a TypeScript environment
export { };