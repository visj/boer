# [1180] Validation error (required boolean property), but property is present

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
ajv 6.11.0: Another JSON Schema Validator

**JSON Schema**
```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "version": {
            "type": "integer",
            "description": "the version of this schema",
			"enum": [
                1
            ]
        },
        "status": {
            "type": "string",
            "description": "the status (running, not running or undefined=no configuration present) of the backup",
            "enum": [
                "running",
                "notRunning",
                "undefined"
            ]
        },
        "message": {
            "type": "string",
            "description": "the message (ok msg, nok msg, last backup msg, ...)"
        },
        "dbSnapshotExists": {
            "type": "boolean",
            "description": "true, if a db snapshot exists which is not older then 72 h"
        }
    },
    "required": [
        "version",
        "status",
        "dbSnaphotExists"
    ]
}
```

**Sample data**
```json
{
  "version": 1,
  "status": "undefined",
  "message": "",
  "dbSnapshotExists": true
}
```

**Validation result, data AFTER validation, error messages**
```json
[
  {
    "keyword": "required",
    "dataPath": "",
    "schemaPath": "#/required",
    "params": {
      "missingProperty": "dbSnaphotExists"
    },
    "message": "should have required property 'dbSnaphotExists'"
  }
]
```

**What results did you expect?**
The required field is present, the json should be valid.

**Are you going to resolve the issue?**
No.