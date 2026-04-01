# [1895] only array $ref not resolving, object $ref does from same file

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.3
**Ajv options object**
``` {
        customOptions: {
          coerceTypes: true,
        },
      }
```

**JSON Schema**
```javascript
{
  "$id": "http://example.com/common",
  "type": "object",
  "definitions": {
    "ThoughtLeader": {
      "properties": {
        "dossierId": {
          "type": "string"
        },
        "firstName": {
          "type": "string"
        }
      }
    },
    "CreatedBy": {
      "type": "object",
      "properties": {
        "userId": {
          "type": "string"
        },
        "fullName": {
          "type": "string"
        }
      }
    },
    "ImperativeGroup": {
      "title": "Imperative Group",
      "type": "object",

      "properties": {
        "createdBy": {
          "$ref": "#/definitions/CreatedBy"
        },
        "recentThoughtLeaders": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/ThoughtLeader"
          }
        }
      }
    }
  }
}

```

So the issue is that the `ImperativeGroup.createdBy` resolves fine but the `ImperativeGroup.recentThoughtLeaders` errors with: 
`can't resolve reference #/definitions/ThoughtLeader from id #"`

I've tried every combination of $id and ref structure and still same issue. I'm missing something?