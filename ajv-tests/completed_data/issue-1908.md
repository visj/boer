# [1908] Schema with discriminator for separated definition of array's items is invalid

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.10.0

Example is here
https://jsfiddle.net/goleon/gvtnL9ao/

**JSON Schema**
```json
{
    "$defs": {
        "A": {
            "properties": {
                "foo": {
                    "const": "x"
                },
                "a": {
                    "type": "string"
                },
            },
            "required": ["a"],
        },
        "B": {
            "properties": {
                "foo": {
                    "enum": ["y", "z"]
                },
                "b": {
                    "type": "string"
                },
            },
            "required": ["b"],

        },
        "C": {
            "type": "object",
            "discriminator": {
                "propertyName": "foo"
            },
            "required": ["foo"],
            "oneOf": [{
                    "$ref": "#/$defs/A"
                }, {
                    "$ref": "#/$defs/B"
                },
            ]
        }
    },
    "type": "object",
    "properties": {
        "cs": {
            "items": {
                "$ref": "#/$defs/C"
            },
            "type": "array"
        }
    },
    "required": [
        "cs"
    ]	

}
```

**Validation result, data AFTER validation, error messages**
ajv7.bundle.js:4842 Uncaught Error: discriminator: oneOf subschemas (or referenced schemas) must have "properties/foo"

But this schema is valid:
```json
{
    "$defs": {
        "A": {
            "properties": {
                "foo": {
                    "const": "x"
                },
                "a": {
                    "type": "string"
                },
            },
            "required": ["a"],
        },
        "B": {
            "properties": {
                "foo": {
                    "enum": ["y", "z"]
                },
                "b": {
                    "type": "string"
                },
            },
            "required": ["b"],

        }
    },
    "type": "object",
    "properties": {
        "cs": {
            "items": {
                "type": "object",
                "discriminator": {
                    "propertyName": "foo"
                },
                "required": ["foo"],
                "oneOf": [{
                        "$ref": "#/$defs/A"
                    }, {
                        "$ref": "#/$defs/B"
                    },
                ]
            },
            "type": "array"
        }
    },
    "required": [
        "cs"
    ]
}
```

