# [2197] array items $ref - not supported or bugged - compile fails

I've seen [similar](https://github.com/ajv-validator/ajv/issues/1255) reports but none quite fit my case.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`8.12.0` (latest)

**Ajv options object**

```js
{
  allowUnionTypes: true,
  verbose: true,
  allErrors: true,
}
```
**JSON Schema**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "buildingDetails": {
      "type": "array",
      "items": [
        {
          "$ref": "#/$defs/A"
        }
      ]
    }
  },
  "$defs": {
    "A": {
      "type": "object",
      "properties": {
        "name": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "string",
              "enum": [
                "unkown"
              ]
            }
          ]
        },
        "details": {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "$ref": "#/$defs/B"
              }
            ]
          }
        }
      },
      "required": [
        "name"
      ]
    },
    "B": {
      "type": "string",
      "enum": [
        "xyz"
      ]
    }
  }
}
```

**Your code**

Use the [demo repo](https://github.com/black-snow/ajv_demo) - I'll provide the code here as well for documentation and reference.

```javascript
import Ajv from "ajv/dist/2020";
import addFormats from "ajv-formats";
import xSchema from "../schema/x.json"; // the above

const ajv = new Ajv({
  allowUnionTypes: true,
  verbose: true,
  allErrors: true,
});
addFormats(ajv);

const v = ajv.compile<X>({ $async: true, ...xSchema });
```

where the generated typings are:

```ts
export interface X {
  buildingDetails?: [] | [A];
  [k: string]: unknown;
}
export interface A {
  name: string | "unkown";
  details?: (string | B)[];
  [k: string]: unknown;
}
export type B = "xyz";
```

**Validation result, data AFTER validation, error messages**

```
Test suite failed to run

    schema is invalid: data/properties/buildingDetails/items must be object,boolean

    > 14 | const v= ajv.compile<X>({ $async: true, ...xSchema });
         |                        ^
      15 |
      16 | console.warn("test")
      17 |

      at Ajv2020.validateSchema (node_modules/ajv/lib/core.ts:519:18)
      at Ajv2020._addSchema (node_modules/ajv/lib/core.ts:721:30)
      at Ajv2020.compile (node_modules/ajv/lib/core.ts:384:22)
      at Object.<anonymous> (src/x.ts:14:24)
      at Object.<anonymous> (src/x.spec.ts:3:1)
```

**What results did you expect?**

No error during `compile`.

**Are you going to resolve the issue?**

I don't think so.