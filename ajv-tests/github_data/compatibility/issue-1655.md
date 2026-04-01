# [1655] tsc --build fails when AnyValidateFunction<unknown> is used and esModuleInterop is enabled

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://ajv.js.org/contributing/
-->

I just started using Ajv and ran into a problem when compiling my project. I've set [esModuleInterop option](https://www.typescriptlang.org/tsconfig#esModuleInterop) of TypeScript compiler to `true` and got a list of weird-looking error messages pointing into the internals of ajv. What's even more strange, the problem appears only if `AnyValidateFunction<unknown>` typehint is used in my code. Disabling `esModuleInterop` also "fixes" the problem, but then my project doesn't work. Also, keeping this option enabled [seems to be recommended](https://github.com/tsconfig/bases/blob/main/bases/node16.json).

I think I've come up with a solution, but I'm not sure if it won't break anything. Please review the issue and the proposed fix.

Contents
===
1. Issue Description
2. Proposed fix


## 1. Issue Description

**The version of Ajv you are using**:
version 8.6.0

**The environment you have the problem with**:
node v16.3.0, typescript v4.3.4, `tsc --build` with `"esModuleInterop": true`

**Your code (please make it as small as possible to reproduce the issue)**

_package.json:_
```
{
  "dependencies": {
    "ajv": "^8.6.0"
  },
  "devDependencies": {
    "typescript": "^4.3.4"
  }
}
```

_tsconfig.json:_
```
{
  "compilerOptions": {
    "rootDir": "./",
    "outDir": "./build",

    "lib": ["es2020"],
    "module": "commonjs",
    "target": "es2020",

    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

_app.ts:_
```
import {AnyValidateFunction} from "ajv/lib/types/index";
function Foo(): AnyValidateFunction<unknown>|null { return null }
Foo()
```


**Results and error messages in your platform**
```
~/foo$ yarn run tsc --build
yarn run v1.22.5
$ tsc --build
node_modules/ajv/lib/compile/resolve.ts:101:3 - error TS2349: This expression is not callable.
  Type '{ default: { (schema: SchemaObject, opts: Options, cb?: Callback | undefined): void; (schema: SchemaObject, cb: Callback): void; }; }' has no call signatures.

101   traverse(schema, {allKeys: true}, (sch, jsonPtr, _, parentJsonPtr) => {
      ~~~~~~~~

  node_modules/ajv/lib/compile/resolve.ts:5:1
    5 import * as traverse from "json-schema-traverse"
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Type originates at this import. A namespace-style import cannot be called or constructed, and will cause a failure at runtime. Consider using a default import or import require here instead.

node_modules/ajv/lib/compile/resolve.ts:101:38 - error TS7006: Parameter 'sch' implicitly has an 'any' type.

101   traverse(schema, {allKeys: true}, (sch, jsonPtr, _, parentJsonPtr) => {
                                         ~~~

node_modules/ajv/lib/compile/resolve.ts:101:43 - error TS7006: Parameter 'jsonPtr' implicitly has an 'any' type.

101   traverse(schema, {allKeys: true}, (sch, jsonPtr, _, parentJsonPtr) => {
                                              ~~~~~~~

node_modules/ajv/lib/compile/resolve.ts:101:52 - error TS7006: Parameter '_' implicitly has an 'any' type.

101   traverse(schema, {allKeys: true}, (sch, jsonPtr, _, parentJsonPtr) => {
                                                       ~

node_modules/ajv/lib/compile/resolve.ts:101:55 - error TS7006: Parameter 'parentJsonPtr' implicitly has an 'any' type.

101   traverse(schema, {allKeys: true}, (sch, jsonPtr, _, parentJsonPtr) => {
                                                          ~~~~~~~~~~~~~

node_modules/ajv/lib/compile/resolve.ts:140:32 - error TS2349: This expression is not callable.
  Type '{ default: (a: any, b: any) => boolean; }' has no call signatures.

140     if (sch2 !== undefined && !equal(sch1, sch2)) throw ambiguos(ref)
                                   ~~~~~

  node_modules/ajv/lib/compile/resolve.ts:4:1
    4 import * as equal from "fast-deep-equal"
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Type originates at this import. A namespace-style import cannot be called or constructed, and will cause a failure at runtime. Consider using a default import or import require here instead.


Found 6 errors.

error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```

## 2. Proposed fix
After changing these three lines I was able to get a successful working build.

```
Index: foo/node_modules/ajv/lib/compile/resolve.ts
IDEA additional info:
Subsystem: com.intellij.openapi.diff.impl.patch.CharsetEP
<+>UTF-8
===================================================================
--- foo/node_modules/ajv/lib/compile/resolve.ts	(date 1624047639603)
+++ foo/node_modules/ajv/lib/compile/resolve.ts	(date 1624047639603)
@@ -1,9 +1,9 @@
 import type {AnySchema, AnySchemaObject} from "../types"
 import type Ajv from "../ajv"
 import {eachItem} from "./util"
-import * as equal from "fast-deep-equal"
-import * as traverse from "json-schema-traverse"
-import * as URI from "uri-js"c
+import equal from "fast-deep-equal"
+import traverse from "json-schema-traverse"
+import URI from "uri-js"
 
 // the hash of local references inside the schema (created by getSchemaRefs), used for inline resolution
 export type LocalRefs = {[Ref in string]?: AnySchemaObject}
```