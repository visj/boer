# [2251] Type for JsonSchema

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

Hey, I am not entirely sure whether this is the right place to ask this, sorry if not.

**What version of Ajv you are you using?**
8.12.0

**What problem do you want to solve?**
I want to define a schema containing multiple schema definitions.

To be specific, I need to write a validation schema for the variables possible to pass to a serverless plugin specifying that the user can pass schemas to compile before packaging to the plugin.
In the end, it would look like the following:
```typescript
{
    myPlugin: {
        schemas: [
            schema1,
            schema2
        ]
    }
}
```

**What do you think is the correct solution to problem?**
Maybe there is already something like this, I tried 
```typescript
{
    type: "object",
    properties: {
      schemas: {
        type: "array",
        items: {
          $ref: "http://json-schema.org/draft-07/schema"
        },
      },
}
```
but received the error `Error: Unsupported reference http://json-schema.org/draft-07/schema`

**Will you be able to implement it?**
No