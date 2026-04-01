# [2369] validate.errors format

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.12.0

**Ajv options object**
{allErrors: true}  

Hi everyone and thanks for contributing and developing this amazing tool.  

I have a question of sorts.  
Suppose, we have a json schema

<details>
  <summary>Expand</summary>
  
```json
{
  "title": "Person",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "gender": {
      "enum": [
        "male",
        "female"
      ]
    },
    "age": {
      "type": "number",
      "minimum": 0
    },
    "address": {
      "type": "object",
      "properties": {
        "street": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "state": {
          "type": "string"
        },
        "postalCode": {
          "type": "number"
        }
      },
      "required": [
        "street",
        "city",
        "state"
      ]
    },
    "cars": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "model": {
            "type": "string"
          },
          "number": {
            "type": "number"
          },
          "color": {
            "type": "string"
          }
        }
      }
    }
  },
  "required": [
    "name",
    "age",
    "gender",
    "address"
  ]
}
```
</details>

After validate against an object with empty fields `validate` gives the following errors, which is correct:  

<details><summary>Expand</summary>
  
```json
[
    {
        "instancePath": "/name",
        "schemaPath": "#/required",
        "keyword": "required",
        "params": {
            "missingProperty": "name"
        },
        "message": "must have required property 'name'"
    },
    {
        "instancePath": "/gender",
        "schemaPath": "#/required",
        "keyword": "required",
        "params": {
            "missingProperty": "gender"
        },
        "message": "must have required property 'gender'"
    },
    {
        "instancePath": "/address/street",
        "schemaPath": "#/properties/address/required",
        "keyword": "required",
        "params": {
            "missingProperty": "street"
        },
        "message": "must have required property 'street'"
    },
    {
        "instancePath": "/address/city",
        "schemaPath": "#/properties/address/required",
        "keyword": "required",
        "params": {
            "missingProperty": "city"
        },
        "message": "must have required property 'city'"
    },
    {
        "instancePath": "/address/state",
        "schemaPath": "#/properties/address/required",
        "keyword": "required",
        "params": {
            "missingProperty": "state"
        },
        "message": "must have required property 'state'"
    }
]

```
</details>

My question is, whether there is a way (other than writing a parser) that `validate.errors` could be in the format of a single object with fields corresponding to the form fields, so for the json schema above errors would be:  

```json
{
    "name": {
        "message": "must have required property 'name'",
        "type": "required"
    },
    "gender": {
        "message": "must have required property 'gender'",
        "type": "required"
    },
    "address": {
        "street": {
            "message": "must have required property 'street'",
            "type": "required"
        },
        "city": {
            "message": "must have required property 'city'",
            "type": "required"
        },
        "state": {
            "message": "must have required property 'state'",
            "type": "required"
        }
    }
}
```
thank you!