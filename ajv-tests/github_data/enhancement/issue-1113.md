# [1113] Add behavior on predefined keyword (E.X. oneOf) 

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
6.9.2

**What problem do you want to solve?**
I would like implement [discriminator](https://swagger.io/docs/specification/data-models/inheritance-and-polymorphism/) feature on AJV by `addKeyword` feature 

But i get stuck for AJV always report it has error under oneOf statement. 
I has try call before validate
```js
ajv.removeKeyword("oneOf")
ajv.addKeyword("oneOf", {.....})
```

it work for disable oneOf checking, but i would like keep the original implementation if discriminator not available, so what should i do ? 

**What do you think is the correct solution to problem?**
Here is my attempt code. 
```js
const ajv = new Ajv(opts)
  ajv.removeKeyword("oneOf")
  ajv.addKeyword("oneOf", {
    inline: function(it, keyword, schema, parentSchema) {
      if (parentSchema.discriminator) {
        return "true" // disable the checking if discriminator available
      }
      const inlineCode = doT.compile(require("ajv/lib/dotjs/oneOf"))(
        it,
        keyword,
        schema,
        parentSchema
      )
      return inlineCode
    },
    errors: true,
    statements: true
  })
```

But it not working.

When i used to validate the schema

Schema
```json
{
  $id: "fuck-off",
  oneOf: [
    {
      $ref: "#/definitions/A"
    },
    {
      $ref: "#/definitions/B"
    },
    {
      $ref: "#/definitions/C"
    }
  ],
  definitions: {
    A: {
      type: "object",
      properties: {
        objType: {
          type: "string",
          enum: ["A"]
        },
        bProp: {
          type: "string"
        }
      },
      required: ["objType", "aProp"]
    },
    B: {
      type: "object",
      properties: {
        objType: {
          type: "string",
          enum: ["B"]
        },
        bProp: {
          type: "string"
        }
      },
      required: ["objType", "bProp"]
    },
    C: {
      type: "object",
      properties: {
        objType: {
          type: "string",
          enum: ["C"]
        },
        cProp: {
          type: "string"
        }
      },
      required: ["objType", "cProp"]
    }
  }
```

code: 
```
    validate({
      objType: "C"
    })
```

it expect should throw error because missing cProp.
But in fact i can't get all error ....

**Will you be able to implement it?**
