# [2494] removeAdditional not workig as expected

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.17.1

**Ajv options object**


<!-- See https://ajv.js.org/options.html -->

```javascript
{
removeAdditional: true
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
export const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/ClassProperties",
  "definitions": {
    "ClassProperties": {
      "type": "object",
      "properties": {
	"additionalProperties": false,
        "flags": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Flags"
          }
        },
      },
       "propertyNames": {
          "$ref": "#/definitions/StyleParams"
        }
    },
    "StyleParams": {
	  "additionalProperties": false,
	  "type": "string",
      "enum": [
		"flags",
		...Object.keys(StyleParameters) // includes "BACKGROUND_COLOR" but not "CHEESE"
	  ]
    },
    "Flags": {
	  "type": "string",
          "enum": [
              "FLAG_ONE"
              "FLAG_TWO"
      ]
    }
  }
} as const
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
         flags: ["FLAG_ONE"],
         BACKGROUND_COLOR: '#FFFFFF',
         CHEESE: 'CHEDDAR'
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

import Ajv from "ajv";

export class JsonValidationHelper {

    enum StyleParameters {
        BACKGROUND_COLOR = 'backgroundcolor'
        // many more
    }

    private static JsonValidationHelper <T>(typeProperties: object, schema: JSONSchema) {
	 const result = SchemaParser.ajv.validate(schema, typeProperties)
	 return typeProperties;
    }

}

```

**Validation result, data AFTER validation, error messages**

```
validation result: false
data: {
flags: ["FLAG_ONE"],
BACKGROUND_COLOR: '#FFFFFF',
CHEESE: 'CHEDDAR'
}
```

**What results did you expect?**
Since removeAdditional is set to true in the options and additionalProperties are not allowed, all properties not defined in the schema should be removed and since there are no required properties set the validation result should always be true.

In short:
- The validation result should be true.
- property CHEESE schould have been removed from the data
**Are you going to resolve the issue?**
