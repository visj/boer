# [1331] Using JSONSchemaType<T> requires strictNullChecks option

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I'm using the latest v7 beta 7, with TS 4.1.

**Your typescript code**

Running the example code from the README, I get types errors. 

First error is with the missing `nullable: true` property. When adding it, the error disappears, but the validation now accepts null.
`nullable: false` is not a valid property neither.

Second error is regarding to the `required` property, which seems not to accept `string[]` but only `never[]`.

Same thing happens with my real project.

[Link to a REPL reproduction](https://repl.it/@GabDug/AjvBetaTypeScript)

```typescript
import Ajv, {JSONSchemaType, DefinedError} from "ajv"

const ajv = new Ajv()

type MyData = {foo: number}

// optional schema type annotation for schema to match MyData type
const schema: JSONSchemaType<MyData> = {
  type: "object",
  properties: {
    foo: {type: "number", minimum: 0},
  },
  required: ["foo"],
  additionalProperties: false,
}

// validate is a type guard for MyData - type is inferred from schema type
const validate = ajv.compile(schema)

// or, if you did not use type annotation for the schema,
// type parameter can be used to make it type guard:
// const validate = ajv.compile<MyData>(schema)

const data: any = {foo: 1}

if (validate(data)) {
  // data is MyData here
  console.log(data.foo)
} else {
  // The type cast is needed to allow user-defined keywords and errors
  // You can extend this type to include your error types as needed.
  for (const err of validate.errors as DefinedError[]) {
    switch (err.keyword) {
      case "minimum":
        // err type is narrowed here to have "minimum" error params properties
        console.log(err.params.limit)
        break
      // ...
    }
  }
}
```

**Typescript compiler error messages**

```
TSError: ⨯ Unable to compile TypeScript:
index.ts:11:5 - error TS2322: Type '{ type: "number"; minimum: number; }' is not assignable to type '{ $ref: string; } | ({ type: "number" | "integer"; minimum?: number; maximum?: number; exclusiveMinimum?: number; exclusiveMaximum?: number; multipleOf?: number; format?: string; } & { [keyword: string]: any; ... 10 more ...; not?: Partial<...>; } & { ...; })'.
  Type '{ type: "number"; minimum: number; }' is not assignable to type '{ type: "number" | "integer"; minimum?: number; maximum?: number; exclusiveMinimum?: number; exclusiveMaximum?: number; multipleOf?: number; format?: string; } & { [keyword: string]: any; $id?: string; $ref?: string; ... 8 more ...; not?: Partial<...>; } & { ...; }'.
    Property 'nullable' is missing in type '{ type: "number"; minimum: number; }' but required in type '{ nullable: true; const?: never; enum?: number[]; default?: number; }'.

11     foo: {type: "number", minimum: 0},
       ~~~

  node_modules/ajv/dist/types/json-schema.d.ts:85:5
    85     nullable: true;
           ~~~~~~~~
    'nullable' is declared here.
  index.ts:5:16
    5 type MyData = {foo: number}
                     ~~~
    The expected type comes from property 'foo' which is declared here on type 'PropertiesSchema<MyData>'
index.ts:13:14 - error TS2322: Type 'string' is not assignable to type 'never'.

13   required: ["foo"],
                ~~~~~

    at createTSError (/usr/local/lib/node_modules/ts-node-fm/src/index.ts:226:12)
    at getOutput (/usr/local/lib/node_modules/ts-node-fm/src/index.ts:335:40)
    at Object.compile (/usr/local/lib/node_modules/ts-node-fm/src/index.ts:368:11)
    at startRepl (/usr/local/lib/node_modules/ts-node-fm/src/bin.ts:147:28)
    at Object.<anonymous> (/usr/local/lib/node_modules/ts-node-fm/src/bin.ts:66:1)
    at Module._compile (internal/modules/cjs/loader.js:778:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)
    at Module.load (internal/modules/cjs/loader.js:653:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
    at Function.Module._load (internal/modules/cjs/loader.js:585:3)
```

**Describe the change that should be made to address the issue?**

Type for `nullable` may be optional and/or accept false.

Type for `required` should accept strings.

**Are you going to resolve the issue?**

With more insight about the issue, I may be able to submit a PR, changing the types or changing the documentation if I'm not using AJV correctly.
