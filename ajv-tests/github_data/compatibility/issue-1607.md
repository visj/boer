# [1607] Trying to compile to ES5 target without success

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://ajv.js.org/contributing/
-->
Hello, I just tried to compile to ES5 target Ajv v7.2.4 on node v14.17.0 with npm v6.14.13, and also Ajv v8.3.0 on node v16.1.0 with npm v7.11.2 to the same target. My tsconfig.json is:
```
$ cat tsconfig.json 
{
  "extends": "@ajv-validator/config",
  "include": ["lib"],
  "compilerOptions": {
    "outDir": "dist",
    "lib": ["ES5"],
    "types": ["node"],
    "allowJs": true,
    "target": "ES5",
    "resolveJsonModule": true
  }
}
```

Both attempts gave same 7 errors:
```
> ajv@8.3.0 build
> rm -rf dist && tsc && cp -r lib/refs dist && rm dist/refs/json-schema-2019-09/index.ts && rm dist/refs/json-schema-2020-12/index.ts && rm dist/refs/jtd-schema.ts

lib/compile/codegen/index.ts:250:25 - error TS2340: Only public and protected methods of the base class are accessible via the 'super' keyword.
250     const names = super.names
                            ~~~~~

lib/compile/codegen/index.ts:281:27 - error TS2340: Only public and protected methods of the base class are accessible via the 'super' keyword.
281     return addNames(super.names, this.iteration.names)
                              ~~~~~

lib/compile/codegen/index.ts:302:38 - error TS2340: Only public and protected methods of the base class are accessible via the 'super' keyword.
302     const names = addExprNames(super.names, this.from)
                                         ~~~~~

lib/compile/codegen/index.ts:328:27 - error TS2340: Only public and protected methods of the base class are accessible via the 'super' keyword.
328     return addNames(super.names, this.iterable.names)
                              ~~~~~

lib/compile/codegen/index.ts:378:25 - error TS2340: Only public and protected methods of the base class are accessible via the 'super' keyword.
378     const names = super.names
                            ~~~~~

lib/compile/index.ts:229:21 - error TS2569: Type 'Set<SchemaEnv>' is not an array type or a string type. Use compiler option '--downlevelIteration' to allow iterating of iterators.
229   for (const sch of this._compilations) {
                        ~~~~~~~~~~~~~~~~~~

lib/compile/validate/dataType.ts:55:7 - error TS2322: Type 'Set<string>' is not assignable to type 'Set<"string" | "number" | "boolean" | "object" | "integer" | "null" | "array">'.
  Type 'string' is not assignable to type '"string" | "number" | "boolean" | "object" | "integer" | "null" | "array"'.
55 const COERCIBLE: Set<JSONType> = new Set(["string", "number", "integer", "boolean", "null"])
         ~~~~~~~~~

Found 7 errors.
```