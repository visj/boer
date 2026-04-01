# [1248] Multiple Partial validations using $ref

**What version of Ajv you are you using?**
6.12.3

**What problem do you want to solve?**
I have a requirement where required fields would not be part of the same subschema where the properties are defined as shown below. I am trying to validate both required and property validation on same field

```json{
    $id: "appschema",
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    allOf: [
      {
        description: "App resource",
        title: "sample app",
        type: "object",
        properties: {
          itemCode: {
            type: "object",
            properties: {
              code: {
                minLength: 1,
                pattern: "^[0-9]*$",
                type: "string",
                maxLength: 2
              },
            },
            required: ["code"]
          },
          serialNumber: {
            $id: "#serialNumber",
            pattern: "^[ -~]*$",
            type: "string",
            maxLength: 20
          },
          currencyCode: {
            minLength: 3,
            pattern: "^[A-Z]{3}$",
            type: "string",
            maxLength: 3
          }
        },
        required: ["currencyCode", 'itemCode']
      },
      {
        required: ["serialNumber"]
      }
    ]
 }
```
Code 
`let valid = ajv.addSchema(schema).validate({ $ref: "appschema#serialNumber" }, "abc-xyz");`

The above piece of code allows validation on property serialNumber. Can we do the required field validation which is not part of the same subschema?

