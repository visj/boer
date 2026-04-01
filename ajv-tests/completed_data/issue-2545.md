# [2545] Error message from strict schema validation does not contain whole path

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Latest version (8.17.1)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const ajvOptions = {
    unicodeRegExp: false,
    allErrors: true,
    strict: 'log',
    allowUnionTypes: true
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$id": "https://example.com/schema/1.0",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": {
      "description": "unique ID of this event",
      "properties": {}
    },
    "ref": {
      "$ref": "#/definitions/ref"
    },
    "anotherRef": {
      "$ref": "#/definitions/anotherRef"
    }
  },
  "required": [
    "id"
  ],
  "definitions": {
    "anotherRef": {
      "allOf": [
        {
          "type": "string"
        },
        {
          "properties": {}
        }
      ]
    },
    "ref": {
      "allOf": [
        {
          "$ref": "#/definitions/anotherRef"
        },
        {
          "properties": {}
        }
      ]
    }
  }
}
```

**Error messages of strict valdation**

```
strict mode: missing type "object" for keyword "properties" at "https://example.com/schema/1.0#/properties/id" (strictTypes)

strict mode: missing type "object" for keyword "properties" at "https://example.com/schema/1.0#/definitions/anotherRef/allOf/1" (strictTypes)

strict mode: missing type "object" for keyword "properties" at "https://example.com/schema/1.0#/allOf/1" (strictTypes)
```

**What results did you expect?**
Last error message does not contain the whole path, so the user does not know where to look for the mentioned error. Especially with a big schema it can be a problem.

Message should contain whole path and look like:
```
strict mode: missing type "object" for keyword "properties" at "https://example.com/schema/1.0#/definitions/ref/allOf/1" (strictTypes)
```