# [1991] Conflicting declaration and class definition: "Cannot use namespace 'Ajv' as a type."

I am trying to migrate TypeScript 4.7 (RC1), and ESM with TypeScript, and I have got all but two modules compile ok. Unfortunately AJV is one of the problematic ones. When compiling .ts files depending on AJV, I get `Cannot use namespace 'Ajv' as a type.`.

The erraneous bits

```
src/models/RescommsModel.ts:523:25 - error TS2709: Cannot use namespace 'Ajv' as a type.
523   private readonly ajv: Ajv
```

```
src/models/RescommsModel.ts:539:20 - error TS2351: This expression is not constructable.
  Type 'typeof import("/Users/lauri/projects/rescomms/rescomms-system/node_modules/ajv/dist/ajv")' has no construct signatures.
539     this.ajv = new Ajv({ ...this.ajvOptions, useDefaults: true })
```

My tsconfig.json:

```
{
  "__comments__": [
    "tsconfig.build.json is used by the real build",
    "tsconfig.json is used by VS.Code helpers"
  ],
  "compilerOptions": {
    "allowJs": true,
    // This is needed in order to a few modules (Ajv, PQueue, inversify) to import properly
    "allowSyntheticDefaultImports": true,
    "alwaysStrict": true,
    "composite": true,
    "declaration": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "forceConsistentCasingInFileNames": true,
    "importHelpers": true,
    "lib": ["ESNext", "ESNext.AsyncIterable"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": false,
    "noImplicitReturns": true,
    "noImplicitThis": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "resolveJsonModule": true,
    "rootDir": "./packages",
    "skipLibCheck": true,
    "sourceMap": true,
    "strictNullChecks": false,
    "target": "ESNext",
  },
  "defaultSeverity": "warning",
  "exclude": [
    "**/__test__/**/*",
    "**/*.d.ts",
    "**/coverage/**/*",
    "**/dist/**/*",
    "**/node_modules/**/*",
    "scripts",
    "cypress/**/*"
  ]
}
```

TypeScript import:

```
import Ajv, { ErrorObject, AnySchemaObject, Options, SchemaObjCxt } from 'ajv'
```

The AJV version in use is `8.11.0`. I tried the normal tricks (`import * as Ajv from 'ajv'` and `import {Ajv} from 'ajv'`) with no luck. I would appreciate any workarounds for the problem.