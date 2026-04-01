# [1730] Several compilation errors with AJV 8.6.2 and Typescript 4.3.5

Since upgrading to the latest version, tsc can't compile anymore AJV. As reported by several other users, it seams to be a core problem of the current version. I report this, because my output is different from the others but the core problem seams to be a incompatibility with typescript.

What version of Ajv are you using? 8.6.2

What results did you expect? that the lib can be compiled with tsc

Are you going to resolve the issue? No but I hope you can reproduce and fix it.

```javascript
tsc -v
Version 4.3.5

//same result with or without --noEmit option
tsc --project tsconfig.build.json --noEmit
node_modules/ajv/lib/compile/codegen/code.ts:52:5 - error TS2322: Type 'CodeItem' is not assignable to type 'string'.

52     return (this._str ??= this._items.reduce((s: string, c: CodeItem) => `${s}${c}`, ""))
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

node_modules/ajv/lib/compile/codegen/code.ts:52:13 - error TS2322: Type 'CodeItem' is not assignable to type 'string'.
  Type 'number' is not assignable to type 'string'.

52     return (this._str ??= this._items.reduce((s: string, c: CodeItem) => `${s}${c}`, ""))
               ~~~~~~~~~

node_modules/ajv/lib/compile/codegen/code.ts:139:3 - error TS2322: Type 'string | number | boolean | string[]' is not assignable to type 'string | SafeExpr'.
  Type 'string[]' is not assignable to type 'string | SafeExpr'.
    Type 'string[]' is not assignable to type 'string'.

139   return typeof x == "number" || typeof x == "boolean" || x === null
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
140     ? x
    ~~~~~~~
141     : safeStringify(Array.isArray(x) ? x.join(",") : x)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

node_modules/ajv/lib/core.ts:356:3 - error TS2394: This overload signature is not compatible with its implementation signature.

356   compile<T = unknown>(schema: Schema | JSONSchemaType<T>, _meta?: boolean): ValidateFunction<T>
      ~~~~~~~

  node_modules/ajv/lib/core.ts:368:3
    368   compile<T = unknown>(schema: AnySchema, _meta?: boolean): AnyValidateFunction<T> {
          ~~~~~~~
    The implementation signature is declared here.

node_modules/ajv/lib/core.ts:377:3 - error TS2394: This overload signature is not compatible with its implementation signature.

377   compileAsync<T = unknown>(
      ~~~~~~~~~~~~

  node_modules/ajv/lib/core.ts:390:3
    390   compileAsync<T = unknown>(
          ~~~~~~~~~~~~
    The implementation signature is declared here.


Found 5 errors.
```