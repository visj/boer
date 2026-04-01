# [2368] anyOf is failing, although data is valid

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
^8.12.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{
  validateFormats: false, 
  keywords: ["example", "x-faker"],
  removeAdditional: "failing",
  unicodeRegExp: false,
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
export default {
  type: "object",
  properties: {
    data: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string", format: "uuid", readOnly: true },
        type: {
          type: "string",
          enum: ["random-string"],
          readOnly: true,
        },
        attributes: {
          type: "object",
          additionalProperties: false,
          required: ["created_at", "expires_at"],
          properties: {
            created_at: {
              type: "string",
              format: "date-time",
              readOnly: true,
            },
            expires_at: {
              type: "string",
              format: "date-time",
              readOnly: true,
            },
          },
        },
      },
      required: ["id", "type", "attributes"],
    },
    included: {
      type: "array",
      uniqueItems: true,
      items: {
        anyOf: [
          {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string", format: "uuid", readOnly: true },
              type: {
                type: "string",
                enum: ["foo-bar-1"],
                readOnly: true,
              },
              attributes: {
                allOf: [
                  {
                    type: "object",
                    properties: {
                      last_failed_at: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                      },
                      last_success_at: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                      },
                    },
                    required: ["last_failed_at", "last_success_at"],
                  },
                  {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      verified_at: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                      },
                    },
                    required: ["verified_at"],
                  },
                ],
              },
              meta: {
                type: "object",
                additionalProperties: false,
                properties: {
                  step: {
                    type: "string",
                    enum: ["push_otp"],
                  },
                  length: {
                    type: "integer",
                    minimum: 0,
                    default: 6,
                  },
                  format: {
                    type: "string",
                    enum: ["characters"],
                  },
                },
                required: ["step", "length", "format"],
              },
            },
            required: ["id", "type", "attributes"],
          },
          {
            type: "object",
            additionalProperties: false,
            properties: {
              id: {
                type: "string",
                format: "uuid",
              },
              type: { type: "string", enum: ["foo-bar-2"] },
              attributes: {
                allOf: [
                  {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      amount: {
                        type: "string",
                        example: "12.43",
                        pattern: "^[0-9]+\\.[0-9][0-9]$",
                      },
                    },
                    required: ["amount"],
                  },
                  {
                    type: "object",
                    properties: {
                      scheduled_date: { type: "string", format: "date" },
                    },
                    required: ["scheduled_date"],
                  },
                ],
              },
            },
            required: ["id", "type", "attributes"],
          },
          {
            type: "object",
            additionalProperties: false,
            properties: {
              id: {
                type: "string",
                format: "uuid",
              },
              type: { type: "string", enum: ["foo-bar-3"] },
              attributes: {
                allOf: [
                  {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      amount: {
                        type: "string",
                        example: "12.43",
                        pattern: "^[0-9]+\\.[0-9][0-9]$",
                      },
                    },
                    required: ["amount"],
                  },
                  {
                    type: "object",
                    properties: {
                      rhythm: {
                        type: "string",
                        enum: [
                          "weekly",
                          "biweekly",
                          "fourweekly",
                          "monthly",
                          "quarterly",
                          "semiannually",
                          "annually",
                        ],
                      },
                    },
                    required: ["rhythm"],
                  },
                ],
              },
            },
            required: ["id", "type", "attributes"],
          },
        ],
      },
    },
  },
};


```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
export default {
  data: {
    id: "f4391616-eeb2-f2a5-0d26-ce79c8a891c5",
    attributes: {
      created_at: "1954-10-04T00:00:00.0Z",
      expires_at: "2023-05-14T00:00:00.0Z",
    },
    type: "random-string",
  },
  included: [
    {
      id: "83c5dafe-c24f-6092-8214-def41c562449",
      type: "foo-bar-2",
      attributes: {
        amount: "274748.04",
        scheduled_date: "1948-05-12",
      },
    },
    {
      id: "c051efc9-fad8-c86e-ee17-3c4e6e10baec",
      type: "foo-bar-3",
      attributes: {
        amount: "7.56",
        rhythm: "weekly",
      },
    },
  ],
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
import Ajv from "ajv";

import response from "./response.js";
import schema from "./schema.js";

const ajv = new Ajv({
  validateFormats: false,
  keywords: ["example", "x-faker"],
  removeAdditional: "failing",
  unicodeRegExp: false,
});

function init() {
  const validate = ajv.compile(schema);
  validate(response);

  validate.errors?.forEach((error) => {
    console.log(error);
  });
}

init();

```

**Validation result, data AFTER validation, error messages**

```javascript
[
{
  instancePath: '/included/0/type',
  schemaPath: '#/properties/included/items/anyOf/0/properties/type/enum',
  keyword: 'enum',
  params: { allowedValues: [ 'foo-bar-1' ] },
  message: 'must be equal to one of the allowed values'
}
{
  instancePath: '/included/0/attributes',
  schemaPath: '#/properties/included/items/anyOf/1/properties/attributes/allOf/1/required',
  keyword: 'required',
  params: { missingProperty: 'scheduled_date' },
  message: "must have required property 'scheduled_date'"
}
{
  instancePath: '/included/0/type',
  schemaPath: '#/properties/included/items/anyOf/2/properties/type/enum',
  keyword: 'enum',
  params: { allowedValues: [ 'foo-bar-3' ] },
  message: 'must be equal to one of the allowed values'
}
{
  instancePath: '/included/0',
  schemaPath: '#/properties/included/items/anyOf',
  keyword: 'anyOf',
  params: {},
  message: 'must match a schema in anyOf'
}
]
```

**What results did you expect?**
I expect no errors inside array, since the data includes valide data based on the provided schema

**Are you going to resolve the issue?**
I would like to know, if there's an issue with the Schema, Data or usage of AJV

