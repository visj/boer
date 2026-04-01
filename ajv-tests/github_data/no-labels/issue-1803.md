# [1803] `refVal1 is not defined` - using recursive schema

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
*4.11.8*

**JSON Schema**
```json
{
  type: 'array',
  uniqueItemProperties: ['name'],
  maxItems: 20,
  items: {
    $ref: '#fieldItemSchema'
  },
  required: [
      'name',
      'type'
    ],
  definitions: {
    fieldItemSchema: {
      id: '#fieldItemSchema',
      type: 'object',
      additionalProperties: false,
      properties: {
        name: {
          type: 'string'
        },
        type: {
          type: 'string',
          enum: [
            'text',
            'enum',
            'date',
            'section'
          ],
          validateChoice: {
            allowedTypes: [
              'enum'
            ]
          }
        },
        fields: {
          type: 'array',
          items: {
            $ref: '#fieldItemSchema'
          }
        }
      }
    }
  }
}
```

**Sample data**

```json
{
  "coach": {
    "fields": [
      {
        "name": "section",
        "label": "section",
        "type": "section",
        "fields": [
          {
            "name": "score",
            "label": "float",
            "type": "float",
            "filterable": true
          }
        ]
      }
    ]
  }
}

```

**Validation result, data AFTER validation, error messages**

```
- ReferenceError: refVal1 is not defined
    at validate (eval at localCompile (/Users/chandramouliramachandran/My-Works/freshapps_sdk/node_modules/ajv/lib/compile/index.js:139:26), <anonymous>:1:3271)
    at eval (eval at localCompile (/Users/chandramouliramachandran/My-Works/freshapps_sdk/node_modules/ajv/lib/compile/index.js:139:26), <anonymous>:1:1665)
    at Generator.next (<anonymous>)
    at onFulfilled (/Users/chandramouliramachandran/My-Works/freshapps_sdk/node_modules/co/index.js:65:19)
    at /Users/chandramouliramachandran/My-Works/freshapps_sdk/node_modules/co/index.js:54:5
    at new Promise (<anonymous>)
    at co (/Users/chandramouliramachandran/My-Works/freshapps_sdk/node_modules/co/index.js:50:10)
    at createPromise (/Users/chandramouliramachandran/My-Works/freshapps_sdk/node_modules/co/index.js:30:15)
    at validate (/Users/chandramouliramachandran/My-Works/freshapps_sdk/lib/utils/validator/index.js:54:11)
    at Object.validate (/Users/chandramouliramachandran/My-Works/freshapps_sdk/lib/validations/custom-objects.js:41:15)
    at /Users/chandramouliramachandran/My-Works/freshapps_sdk/lib/cli/validate.js:28:22
    at Array.map (<anonymous>)
    at Object.run (/Users/chandramouliramachandran/My-Works/freshapps_sdk/lib/cli/validate.js:17:34)
    at Object.run (/Users/chandramouliramachandran/My-Works/freshapps_sdk/lib/cli/run.js:116:48)
    at runCLI (/Users/chandramouliramachandran/My-Works/freshapps_sdk/index.js:223:38)

- Also $ref: '#/definitions/fieldItemSchema' without defining the `id` throw reference error
```

**What results did you expect?**
- Expected the JSON to be parsed successfully

**Are you going to resolve the issue?**
