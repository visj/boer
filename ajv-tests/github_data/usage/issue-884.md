# [884] Unable to reference a property of a definition

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.5.3

**Ajv options object**

```javascript
const ajv = new Ajv({ allErrors: true, extendRefs: true, verbose: true });
```


**JSON Schema to be Referenced**
```json
{
    "$id": "http://example.com/schemas/view.schema.json",
    "$ref": "#/definitions/view",
    "definitions": {
        "view": {
            "type": "object",
            "required": ["name", "label", "component"],
            "additionalProperties": false,
            "properties": {
                "name": {
                    "type": "string",
                    "description": "The name of this page",
                    "pattern": "^[a-zA-Z0-9]+$"
                }
            }
        }
    }
}
```

**Referencing JSON Schema**
```json
{   
    "$id": "http://example.com/schemas/theme.schema.json",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/theme",
    "definitions": {
        "theme": {
            "properties": {
                "layouts": {
                    "$ref": "#/definitions/themeLayout",
                    "minProperties": 1
                }
            },
            "additionalProperties": false
        },
        "themeLayout": {
            "type": "object",
            "propertyNames": {
                "pattern": "^[A-Za-z]+$"
            },
            "additionalProperties": {
                "type": "object",
                "properties": {
                    "view": {
                        "$ref": "view.schema.json#/definitions/view/name"
                    }
                },
                "additionalProperties": false
            }
        }
    }
}
```


**Sample data**

```json
{
    "layouts": {
        "hero": {
            "view": "heroLayout"
        },
        "default": { 
            "view": "headerAndFooter"
        },
    }
}
```


**Validation result, data AFTER validation, error messages**

```
/Users/tconn/dev/ui-metadata-schema/node_modules/ajv/lib/ajv.js:356
    throw e;
    ^
Error: can't resolve reference view.schema.json#/definitions/view/name from id http://example.com/schemas/theme.schema.json#
```

**What results did you expect?**
I should be able to reference the name property of the view, I can reference the view, just not `view/name`

**Are you going to resolve the issue?**
Happy to help