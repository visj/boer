# [2566] OneOF of different object schemas throw valdiation error

I have a large set of json schemas and i use AJV to validate values.
In this set of schemas, there is only one that use "oneOf". Inside this oneOf there is 3 schemas of type object with complex properties. 
The validator always throw the same error : 

```
  {
    instancePath: "/analysis/extractedData",
    schemaPath: "#/properties/analysis/properties/extractedData/oneOf",
    keyword: "oneOf",
    params: { passingSchemas: [ 0, 1 ] },
    message: "must match exactly one schema in oneOf"
  }
```

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

version  8.17.1

**Ajv options object**

```javascript
new Ajv({ schemas, allErrors: true })
```

**JSON Schema**

```json
{
  "type": "object",
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "properties": {
    "id": {
      "type": "string"
    },
    "analysis": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "extractedData": {
          "oneOf": [
            {
              "type": "object",
              "properties": {
                "firstProp": {
                  "type": "number",
                  "maximum": 3
                }
              }
            },
            {
              "type": "object",
              "properties": {
                "secondProp": {
                  "type": "number",
                  "minimum": 10
                }
              }
            }
          ]
        }
      }
    }
  }
}
  ```
  
  **Sample data**
  
  <!-- Please make it as small as possible to reproduce the issue -->
  
  ```json
  {
    "id": "ONB123456789",
    "analysis": {
    "extractedData": {
      "firstProp": 2
    }
  }
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

```javascript
const debugSchema = {
    "type": "object",
    "required": [
        "id"
    ],
    "additionalProperties": false,
    "properties": {
        "id": {
            "type": "string"
        },
        "analysis": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "extractedData": {
                    "oneOf": [
                        {
                            "type": "object",
                            "properties": {
                                "firstProp": {
                                    "type": "number",
                                    "maximum": 3
                                }
                            }
                        },
                        {
                            "type": "object",
                            "properties": {
                                "secondProp": {
                                    "type": "number",
                                    "minimum": 10
                                }
                            }
                        }
                    ]
                }
            }
        }
    }
}
const debugValue = {
    "id": "ONB123456789",
    "analysis": {
        "extractedData": {
            "firstProp": 2
        }
    }
};
const ajv = new Ajv({ allErrors: true });
const validator = ajv.compile(debugSchema);
if (!validator(debugValue)) {
    console.error('Errors:', validator.errors);
} else {
    console.info('Success');
}
```

**Validation result, data AFTER validation, error messages**

```
Errors: [
  {
    instancePath: "/analysis/extractedData",
    schemaPath: "#/properties/analysis/properties/extractedData/oneOf",
    keyword: "oneOf",
    params: { passingSchemas: [ 0, 1 ] },
    message: "must match exactly one schema in oneOf"
  }
]

```

**What results did you expect?**

Validation should not return any errors

**Are you going to resolve the issue?**

I didn't worked on AJV until now. I can help to review PR, but not to resolve this bug for instance
