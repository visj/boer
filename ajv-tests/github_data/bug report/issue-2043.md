# [2043] typescript `JSONSchemaType`

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

**Ajv version**
8.11.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json

```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```typescript
import type { JSONSchemaType } from 'ajv'
import Ajv from 'ajv'
type MyData = {
    [id: number]: 42;
}

// generated from `typescript-json-schema tsconfig.json MyData`
const schemaMyData: JSONSchemaType<MyData> = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "additionalProperties": false,
    "patternProperties": {
        "^[0-9]+$": {
            "enum": [
                42
            ],
            "type": "number"
        }
    },
    "type": "object"
}

const ajv = new Ajv()

const validateMyData = ajv.compile(schemaMyData)
validateMyData({ "a1": 42 }) // false
validateMyData({ "11": 24 }) // false
validateMyData({ "11": 42 }) // true

```

**Validation result, data AFTER validation, error messages**
```shell
$ typescript-json-schema tsconfig.json MyData
```

schema
```typescript
const schemaMyData: JSONSchemaType<MyData> = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "additionalProperties": false,
    "patternProperties": {
        "^[0-9]+$": {
            "enum": [
                42
            ],
            "type": "number"
        }
    },
    "type": "object"
}
```
got ts error
```
Type '{ $schema: string; additionalProperties: false; patternProperties: { "^[0-9]+$": { enum: number[]; type: string; }; }; type: "object"; }' is not assignable to type 'UncheckedJSONSchemaType<MyData, false>'.
  Types of property '"patternProperties"' are incompatible.
    Type '{ "^[0-9]+$": { enum: number[]; type: string; }; }' is not assignable to type 'Record<string, UncheckedJSONSchemaType<unknown, false>>'.
      Property '"^[0-9]+$"' is incompatible with index signature.
        Type '{ enum: number[]; type: string; }' is not assignable to type 'UncheckedJSONSchemaType<unknown, false>'.
          Type '{ enum: number[]; type: string; }' is not assignable to type '{ type: readonly never[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<...> | undefined; }'.
            Type '{ enum: number[]; type: string; }' is not assignable to type '{ type: readonly never[]; }'.
              Types of property 'type' are incompatible.
                Type 'string' is not assignable to type 'readonly never[]'.ts(2322)
```

**What results did you expect?**
no typescript error

**Are you going to resolve the issue?**
