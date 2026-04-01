# [2021] Error: unknown format "uint8" ignored in schema at path "#/properties/decimals"

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
![스크린샷 2022-06-29 오후 11 16 04](https://user-images.githubusercontent.com/55660267/176459012-20d3303a-8631-4369-b47d-962ed5970697.png)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```
{
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'InstantiateMsg',
  type: 'object',
  required: ['decimals', 'initial_balances'],
  properties: {
    decimals: {
      type: 'integer',
      format: 'uint8',
      minimum: 0.0,
    },
    initial_balances: {
      type: 'array',
      items: {
        $ref: '#/definitions/InitialBalance',
      },
    },
  },
  definitions: {
    InitialBalance: {
      type: 'object',
      required: ['address', 'amount'],
      properties: {
        address: {
          type: 'string',
        },
        amount: {
          $ref: '#/definitions/Uint128',
        },
      },
    },
    Uint128: {
      description:
        'A thin wrapper around u128 that is using strings for JSON encoding/decoding, such that the full u128 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u128` to get the value out:\n\n``` # use cosmwasm_std::Uint128; let a = Uint128::from(123u128); assert_eq!(a.u128(), 123);\n\nlet b = Uint128::from(42u64); assert_eq!(b.u128(), 42);\n\nlet c = Uint128::from(70u32); assert_eq!(c.u128(), 70); ```',
      type: 'string',
    },
  },
};

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```
{
  initial_balances: [{address: 'bplmn', amount: '0'}],
  decimals: 0,
};
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

```javascript
import {schema, data} from './data';
import {Draft07 as Core} from 'json-schema-library';
import Ajv from 'ajv';

const core = new Core(schema);
const valid = core.isValid(data);
console.log(1, valid);

const ajv = new Ajv();
const validateFunction = ajv.compile(schema);
const valid2 = validateFunction(data);
console.log(2, valid2);

```

**Validation result, data AFTER validation, error messages**
![스크린샷 2022-06-29 오후 11 20 50](https://user-images.githubusercontent.com/55660267/176460302-43239e7d-160a-4211-a43c-ba5217fecf23.png)

Checking if data is valid with `json-schema-library` succeeded with log msg `1 true`.
But ajv failed to compile schema with `Error: unknown format "uint8" ignored in schema at path "#/properties/decimals"` 

**What results did you expect?**

**Are you going to resolve the issue?**
