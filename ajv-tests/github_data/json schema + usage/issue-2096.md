# [2096] Nested allOf and anyOf: runtime validation fails

**Description**

I'm trying to create a schema that allows for a set of shared properties plus two _mutually exclusive_ properties. That is, an object can have all properties A,B...P, but only one of Q or R (though both are optional). 

It may be that I'm doing it wrong, but I've consulted all the documentation I've found on the subject, and I can't seem to do it right. The type does seem to come out right, but the validation fails. I suspect that this is an error with this library. However, it may well be that it is just my mistake. In that case: please let me know what the right way to do this would be.

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11 (already on the latest version)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const ajv = new Ajv({
    schemas: Object.values(schemas).map((schema) =>
        omitKeys(schema, 'components'),
    ),

    // example was superseded by examples in openapi 3.1, but we're still on 3.0, so
    // let's add it back in!
    keywords: ['example'],
});

addFormats(ajv, ['date-time', 'uri', 'uri-reference']); 
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
       {
        "allOf": [
          {
            "type": "object",
            "required": [
              "username"
            ],
            "properties": {
              "username": {
                "type": "string"
              }
            }
          },
          {
            "oneOf": [
              {
                "properties": {
                  "project": {
                    "type": "string"
                  }
                }
              },
              {
                "properties": {
                  "projects": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              }
            ]
          }
        ]
      }
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
  {
    "username": "string",
    "project": "default"
  }
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

I have tried to make a [working code sample on runkit with 8.11](https://runkit.com/63219d2678f048000852fd37/63219d318c14410009a801bd), but there seems to be something wrong with it. I get a syntax error. The same syntax error occurs if I just clone the default sample code and upgrade ajv.

Instead, here's [sample code with ajv 4.4.0](https://runkit.com/63219d2678f048000852fd37/63219eebab75740008b91a58): it showcases the same issue.

I'm not sure what code you're looking for here (sorry!), so here's what's in the runkit instead
```javascript
var Ajv = require('ajv');

var ajv = new Ajv({
     // example was superseded by examples in openapi 3.1, but we're still on 3.0, so
    // let's add it back in!
    keywords: ['example']
});

var schema = 
 {
        "allOf": [
          {
            "type": "object",
            "required": [
              "username"
            ],
            "properties": {
              "username": {
                "type": "string"
              }
            }
          },
          {
            "oneOf": [
              {
                "properties": {
                  "project": {
                    "type": "string"
                  }
                }
              },
              {
                "properties": {
                  "projects": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              }
            ]
          }
        ]   
};

var data = {
        "username": "string",
    "project": "default"
};

var validate = ajv.compile(schema);

console.log(validate(data));
console.log(validate.errors);
```

**Validation result, data AFTER validation, error messages**

```
{"error":"Request validation failed","validation":[{"keyword":"oneOf","dataPath":".body","schemaPath":"#/components/schemas/createApiTokenSchema/allOf/1/oneOf","params":{"passingSchemas":[0,1]},"message":"should match exactly one schema in oneOf"}]}
```

**What results did you expect?**

I would expect the above schema to let me submit **either** `username` and `project` **or** `username` and `projects` **or** just username.

**Are you going to resolve the issue?**

I'd be happy to help if there's something I can do, but I'm not very familiar with the library just yet, so I'm not sure it would do much good.

**Additional context**

I've been trying in as many different ways as I can imagine to make this work, but I haven't been able to. For reference, this seems to be about the closest I've gotten in code (using the json-schema-to-ts package and avj)

<details>

<summary>Actual source code</summary>

```ts
export const createApiTokenSchema = {
    $id: '#/components/schemas/createApiTokenSchema',
    type: 'object',
    required: ['username', 'type'],
    oneOf: [
        {
            properties: {
                username: {
                    type: 'string',
                },
                type: {
                    type: 'string',
                    enum: Object.values(ApiTokenType),
                },
                environment: {
                    type: 'string',
                },
                expiresAt: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                },
                project: {
                    type: 'string',
                },
            },
        },
        {
            properties: {
                username: {
                    type: 'string',
                },
                type: {
                    type: 'string',
                    enum: Object.values(ApiTokenType),
                },
                environment: {
                    type: 'string',
                },
                expiresAt: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                },
                projects: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
            },
        },
    ],
    components: {},
} as const;

export type CreateApiTokenSchema = FromSchema<typeof createApiTokenSchema>;
```

</details>

----

Any help or insight is much appreciated.
