# [2272] Property is not made mandatory conditionally

Hi, 

_As per this below schema,_
```
{
  "type": "object",
  "properties": {
    "minLengthValidate": {
      "type": "boolean"
    },
    "minLength": {
      "type": "number"
    }
  },
  "dependencies": {
    "minLength": {
      "required": [
        "minLengthValidate"
      ],
      "if": {
        "properties": {
          "minLengthValidate": {
            "const": true
          }
        }
      },
      "then": {
        "required": [
          "minLength"
        ]
      },
      "else": {
        "not": {
          "required": [
            "minLength"
          ]
        }
      }
    }
  }
}
```
**_Note:_**: I want if-else condition within inbuilt key "dependencies" object for further process.

I want the error to be thrown, when **"minLength"** property is not present and "**minLengthValidate"** is **true** based on below structure,
```
{
  "minLengthValidate": true
}
```

But no error is as thrown, and shows as valid schema!

_Please click the below link to check the issue mentioned above._
https://codesandbox.io/s/pedantic-robinson-q3gnrq?file=/src/app/app.component.ts

**_Versions:_**
"ajv": "^8.12.0",
"ajv-errors": "^3.0.0",
"ajv-keywords": "^5.1.0",