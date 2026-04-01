# [1767] In the move from ajv7.2.6 to ajv8.6.2, a buggy error 'Error: strict mode: required property "a" is not defined ...' 

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.6.3 / 8.6.2

*Error does NOT happen in ajv@7.2.6*

**Ajv options object**

```javascript
const options: Options = {
    schemas: schemas,
    allowMatchingProperties: true, 
    strictTuples: false,
    allowUnionTypes: true,
    strict: true,
    verbose: true,
    code: optimize
      ? {
          lines: false,
          source: true,
          optimize: true,
        }
      : {
          lines: true,
          source: true,
          optimize: false,
        },
  };

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

*#1*
```json
[
  {
    $id: "2",
    type: 'number',
  },
  {
    definitions: {
      noreq: {
        type: 'object',
        properties: {
          a: {
            $ref: '2',
          },
          b: {
            type: 'string',
          },
        },
      },
      req: {
        type: 'object',
        allOf: [
          {
            $ref: '#/definitions/noreq',
          },
        ],
        required: ['a', 'b'],
      },
    },
    type: 'object',
    allOf: [
      {
        $ref: '#/definitions/req',
      },
    ],
    unevaluatedProperties: false,
    $id: '1',
  },
];
```

**Sample data**

It rejects schema so the sample is irrelevant.

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
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import Ajv2020 from 'ajv/dist/2020';
const _2019_1 = __importDefault(require("ajv/dist/2019"));
const draft7MetaSchema = __importStar(require("ajv/dist/refs/json-schema-draft-07.json"));
function createAjv(which, schemas, optimize = false) {
    const options = {
        //////////////////////////////////////////////
        /**
         * schemas can be passed in through the options from the createAjv2020 params
         */
        schemas: schemas,
        //////////////////////////////////////////////
        allowMatchingProperties: true,
        strictTuples: false,
        allowUnionTypes: true,
        strict: true,
        verbose: true,
        code: optimize
            ? {
                lines: false,
                source: true,
                optimize: true,
            }
            : {
                lines: true,
                source: true,
                optimize: false,
            },
    };
    if (which === '2019') {
        const validators = new _2019_1.default(options);
        validators.addMetaSchema(draft7MetaSchema);
        return validators;
    }
    // if (which === '2020') {
    //   const validators = new Ajv2020(options);
    //   validators!.addMetaSchema(draft7MetaSchema);
    //   return validators as Ajv2020;
    // }
    throw '';
}
const schemas = [
    {
        $id: "2",
        type: 'number',
    },
    {
        definitions: {
            noreq: {
                type: 'object',
                properties: {
                    a: {
                        $ref: '2',
                    },
                    b: {
                        type: 'string',
                    },
                },
            },
            req: {
                type: 'object',
                allOf: [
                    {
                        $ref: '#/definitions/noreq',
                    },
                ],
                required: ['a', 'b'],
            },
        },
        type: 'object',
        allOf: [
            {
                $ref: '#/definitions/req',
            },
        ],
        unevaluatedProperties: false,
        $id: '1',
    },
];
const ajv2019 = createAjv('2019', schemas);
const v2019 = ajv2019.getSchema('1');  // <--- ERROR OCCURS HERE
const r2019 = v2019({ a: 1, b: '' });
console.log('r2019=', r2019);

```

**error messages**

The error message occurs at 
```
const v2019 = ajv2019.getSchema('1');  // <--- ERROR OCCURS HERE
``` 
The error message is: 
```
Error: strict mode: required property "a" is not defined at "1#" (strictRequired)
```

**What results did you expect?**

Ajv2019  does NOT reject the schema in ajv@7.2.6.

Both Ajv2019 and Ajv2020 in ajv@8.6.2 / 8.6.3 do NOT reject  this single self-contained schema:

*#2*
```
const schemas = [
    {
        definitions: {
            noreq: {
                type: 'object',
                properties: {
                    a: {
                        type:'number',
                    },
                    b: {
                        type: 'string',
                    },
                },
            },
            req: {
                type: 'object',
                allOf: [
                    {
                        $ref: '#/definitions/noreq',
                    },
                ],
                required: ['a', 'b'],
            },
        },
        type: 'object',
        allOf: [
            {
                $ref: '#/definitions/req',
            },
        ],
        unevaluatedProperties: false,
        $id: '1',
    },
];

```

In the buggy case, In the debugger, it looks as if ajv@8.6.2/3 loses track of of the context when it is validating 

```
{
                type: 'object',
                allOf: [
                    {
                        $ref: '#/definitions/noreq',
                    },
                ],
                required: ['a', 'b'],
}
```
which explains the error message `Error: strict mode: required property "a" is not defined at "1#" (strictRequired)`.

**Are you going to resolve the issue?**

Fix the root cause?  Unknow.  Replacing 
```
                allOf: [
                    {
                        $ref: '#/definitions/noreq',
                    },
                ],
```
with a copy of
```
                properties: {
                    a: {
                        type:'number',
                    },
                    b: {
                        type: 'string',
                    },
                },
```
seems easier, and it seems to work OK.


