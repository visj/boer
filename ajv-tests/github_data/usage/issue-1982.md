# [1982] Nested $ref are not getting validated

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
"ajv": "^8.11.0"

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```{ allErrors: true }```

**JSON Schema**

```
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "$ref": "#/definitions/data",
  "definitions": {
    "data": {
      "type": "object",
      "properties": {
        "response": {
          "type": "object",
          "properties": {
            "return": {
              "$ref": "#/definitions/Response"
            },
            "arguments": {
              "type": "object",
              "properties": {},
              "required": [
                "list"
              ]
            }
          },
          "required": []
        }
      },
      "required": [
        "response"
      ]
    },
    "Response": {
      "type": "object",
      "properties": {
        "list": {
          "type": "string"
        }
      },
      "required": [
        "list"
      ]
    }
  }
}
```

**Sample data**

```
{
  "response": {
    "list": {
      "data": "ddd"
    }
  }
}
```

**Your code**

```import Ajv from "ajv";
const ajv: any = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
const valid = validate(data);
```

**Validation result, data AFTER validation, error messages**

```
No Errors
```

**What results did you expect?**
The expected behavior is that all the nested schemas should get validated, in my case validation happens till data, "$ref": "#/definitions/Response" is not getting validated. 

This is just a sample case, I have multiple nested $ref to be validated. 
