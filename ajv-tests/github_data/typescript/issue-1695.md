# [1695] Unexported types causing TypeScript errors 4023 and 7056

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.6.2

**TypeScript version**

4.3.5

**TypeScript config**

`tsconfig.build.json` is a tsconfig intended for building an NPM package. 
We use this successfully across many projects and with AJV 7.x. 
It extends a base tsconfig that successfully compiles, presumably because its `rootDir` is `.` (project root including node_modules).
There's no scope for changing this config in our org as a workaround for this particular issue.

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "./lib"
  }
}
```

The `tsconfig.json` that this extends (compiles successfully):

```json
{
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "lib/**/*"
  ],
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "rootDir": ".",
    "strict": true,
    "typeRoots": [
      "./node_modules/@types",
      "./src"
    ],
    "declaration": true,
    "types": [
      "node"
    ],
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "importHelpers": true,
    "lib": ["ES2019"],
    "noImplicitAny": true,
    "strictNullChecks": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "resolveJsonModule": true,
    "stripInternal": true
  }
}
```

**Your code**

This is comparable to a function that we've successfully used in AJV 7.x:

```typescript
import type { JSONSchemaType } from 'ajv'

export const willICompile = <T>(schema: JSONSchemaType<T>): boolean =>
  schema ? false : false

```

**TypeScript error output**

```
src/validation/test.ts:3:14 - error TS4023: Exported variable 'willICompile' has or is using name 'NumberKeywords' from external module "...projectRoot/node_modules/ajv/dist/types/json-schema" but cannot be named.

3 export const willICompile = <T>(schema: JSONSchemaType<T>): boolean =>
               ~~~~~~~~~~~~

src/validation/test.ts:3:14 - error TS4023: Exported variable 'willICompile' has or is using name 'StringKeywords' from external module "...projectRoot/node_modules/ajv/dist/types/json-schema" but cannot be named.

3 export const willICompile = <T>(schema: JSONSchemaType<T>): boolean =>
               ~~~~~~~~~~~~

src/validation/test.ts:3:14 - error TS7056: The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed.

3 export const willICompile = <T>(schema: JSONSchemaType<T>): boolean =>
               ~~~~~~~~~~~~
```

**What results did you expect?**

I would expect this code to compile.

Various internally used types aren't exported from the root of the ajv package. My working theory is that when an exported type uses one of these unexported types and the root dir does not include node_modules, we get a 4023 and/or a 7056 error.

We did not experience these errors with equivalent code and the same tsconfig in AJV 7.x.

Incidentally we also had the ability to declare something as a partial schema but this is also no longer possible due to unexported types.

**Are you going to resolve the issue?**

Could be a rabbit hole with no guarantee any PR would be accepted.
Though not ideal I may have to roll my own versions of some types in `types/json-schema.ts`.
