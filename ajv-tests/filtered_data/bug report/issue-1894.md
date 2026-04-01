# [1894] What's wrong with this?

```
"meta": {
            "type": "object",
            "description": "Optional customer meta data",
            "properties": {
                "email": {
                    "type": "string",
                    "format": "email",
                    "description": "eMail"
                },
                "name": {
                    "type": "string",
                    "description": "Name"
                },
                "address": {
                    "type": "string",
                    "description": "Address"
                },
                "description": {
                    "type": "string",
                    "description": "A descriptive text"
                }
            }
        },
```

Result: "unknown format \"email\" ignored in schema at path \"#/properties/meta/properties/email\""