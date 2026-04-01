# [1440] Error trying to compile Getting Started example TS2322: Type '{ type: "number"; minimum: number; }' is not assignable to type...

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->



```typescript
// index.ts
import Ajv, { JSONSchemaType, DefinedError } from 'ajv';
const ajv = new Ajv();

type MyData = { foo: number };

const schema: JSONSchemaType<MyData> = {
  type: 'object',
  properties: {
    foo: { type: 'number', minimum: 0 },
  },
  required: ['foo'],
  additionalProperties: false,
};

const validate = ajv.compile(schema);

const data: any = { foo: 1 };

console.log(validate(data));
```

```json
// package.json
{
  "dependencies": {
    "ajv": "^7.1.0"
  },
  "devDependencies": {
    "@types/node": "^14.14.25",
    "typescript": "^4.1.5"
  }
}
```

```shell
$ npx tsc --lib es2015 index.ts
index.ts:10:5 - error TS2322: Type '{ type: "number"; minimum: number; }' is not assignable to type '{ $ref: string; } | ({ type: "number" | "integer"; minimum?: number; maximum?: number; exclusiveMinimum?: number; exclusiveMaximum?: number; multipleOf?: number; format?: string; } & { [keyword: string]: any; ... 10 more ...; not?: Partial<...>; } & { ...; })'.
  Type '{ type: "number"; minimum: number; }' is not assignable to type '{ type: "number" | "integer"; minimum?: number; maximum?: number; exclusiveMinimum?: number; exclusiveMaximum?: number; multipleOf?: number; format?: string; } & { [keyword: string]: any; $id?: string; $ref?: string; ... 8 more ...; not?: Partial<...>; } & { ...; }'.
    Property 'nullable' is missing in type '{ type: "number"; minimum: number; }' but required in type '{ nullable: true; const?: never; enum?: number[]; default?: number; }'.

10     foo: { type: 'number', minimum: 0 },
       ~~~

  node_modules/ajv/dist/types/json-schema.d.ts:95:5
    95     nullable: true;
           ~~~~~~~~
    'nullable' is declared here.
  index.ts:5:17
    5 type MyData = { foo: number };
                      ~~~
    The expected type comes from property 'foo' which is declared here on type 'PropertiesSchema<MyData>'

index.ts:12:14 - error TS2322: Type 'string' is not assignable to type 'never'.

12   required: ['foo'],
                ~~~~~


Found 2 errors.
```