# [2303] JTDSchemaType error involving interface with arbitrary keys

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
```
8.12.0
```

**TypeScript code**
```typescript
interface Values { [key: string]: number }
const schema: JTDSchemaType<Values> = { values: { type: "int32" } };
```

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

**TypeScript error**
```
Type '{ values: { type: string; }; }' is not assignable to type 'never'. ts(2322)
```

**What results did you expect?**
> No errors

**Are you going to resolve the issue?**
> No

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false
  }
}
```

Error is reproducible in deno.

**Related issues**
https://github.com/ajv-validator/ajv/issues/2169
https://github.com/ajv-validator/ajv/issues/2219
https://github.com/ajv-validator/ajv/issues/1588 (?)
