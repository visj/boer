# [1717] Typescript build errors

### _Long story short:_

When I import definitions from `ajv/lib/core` I'm not able to compile my project.

### package.json
```json
{
  "name": "ajv-ts-test",
  "private": true,
  "license": "MIT",
  "main": "./src/index.ts",
  "scripts": {
    "start": "ts-node ./src/index.ts",
    "build": "tsc -p tsconfig.json"
  },
  "dependencies": {
    "ajv": "^8.6.2"
  },
  "devDependencies": {
    "@types/node": "^12.20.17",
    "ts-node": "^10.1.0",
    "typescript": "^4.3.5"
  }
}
```

### tsconfig.json
```jsonc
{
  "compilerOptions": {
    "target": "ES2020", // es6 has the same issue
    "module": "commonjs",
    "lib": [
      "DOM",
      "ES2020"
    ],
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

### src/index.ts
```typescript
import Ajv2020 from "ajv/dist/2020";
import { CurrentOptions } from "ajv/lib/core";
import * as path from "path";

const ajvOptions: CurrentOptions["formats"] = {
  "test": () => true,
};

// .....
```

### commands
```bash
$ npm install
$ npm run start
$ npm run build
```

### compiler errors
```
node_modules/ajv/lib/ajv.ts:5:35 - error TS2732: Cannot find module './refs/json-schema-draft-07.json'. Consider using '--resolveJsonModule' to import module with '.json' extension.

5 import * as draft7MetaSchema from "./refs/json-schema-draft-07.json"
                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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

node_modules/ajv/lib/core.ts:63:33 - error TS2732: Cannot find module './refs/data.json'. Consider using '--resolveJsonModule' to import module with '.json' extension.

63 import * as $dataRefSchema from "./refs/data.json"
                                   ~~~~~~~~~~~~~~~~~~

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


Found 7 errors.
```
### Quick suggestion
Maybe it is better to read the JSON files with `require` instead of `import` to resolve the `resolveJsonModule` issue.
```typescript
const draft7MetaSchema = require(path.join(__dirname, "./refs/json-schema-draft-07.json"));
// ...
const $dataRefSchema = require(path.join(__dirname, "./refs/data.json"));
```

### My solution
I will redefine the format type but it will be nice if we can use the project definitions

Thanks!