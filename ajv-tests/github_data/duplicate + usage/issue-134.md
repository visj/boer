# [134] Multiple array items type validation with oneOf, anyOf

Hi everyone,

I've encountered a problem to validate multiple items type in an array.

We have an array with 2 items types. We try to validate each item to 2 different schemas types.

Here is the schema:

``` json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "transfer": {
      "type": "object",
      "properties": {
        "modes": {
          "type": "array",
          "minItems": 1,
          "additionalItems": false,
          "items": {
            "oneOf": [
              {
                "type": "object",
                "properties": {
                  "mode": {
                    "enum": [
                      "ftp"
                    ]
                  },
                  "account": {
                    "type": "string",
                    "pattern": "^[a-f|0-9]{8}$"
                  }
                },
                "required": [
                  "mode",
                  "account"
                ],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "mode": {
                    "enum": [
                      "email"
                    ]
                  },
                  "mailingList": {
                    "type": "string",
                    "pattern": "^[a-f|0-9]{8}$"
                  }
                },
                "required": [
                  "mode",
                  "mailingList"
                ],
                "additionalProperties": false
              }
            ]
          }
        }
      },
      "required": [
        "modes"
      ],
      "additionalProperties": false
    }
  },
  "additionalProperties": false,
  "required": [
    "transfer"
  ]
}
```

And the data:

``` json
{
  "transfer": {
    "modes": [
      {
        "mode": "ftp",
        "account": "e69b3f54"
      },
      {
        "mode": "email",
        "mailingList": "c3d12752"
      }
    ]
  }
}
```

I tried to validate the data against the schema to different online tools:
http://json-schema-validator.herokuapp.com/index.jsp
http://jsonschemalint.com/draft4/#

All these tools validate successfully my data

It's like the validator try to match the 1st item to the 1st schema and the second item to the second schema. Order should be not important.

I use version 3.8.1.

Could you help me ?

Thank you in advance
