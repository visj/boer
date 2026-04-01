# [255] Include property name in error object

Hi, I'm passing in a schema and getting a collection of errors back.  However, I need to know the property that is causing the error.  In the error object, there is "dataPath" however, most of the time that value is "".
When it does show it, it is in the path notation as explained in the docs, and I would still have to parse it to get the name, but more importantly, most of the time it's blank.  If it's a required field error I can dig into the "params" and get missing field, but if it's a format error then I'd have to have different logic.   I suspect I'm doing something wrong, so I'm include some data.

this is what the out put of the errors array looks like, and it's in verbose, sorry trying to be thorough.

``` json
[
    {
        "keyword": "format",
        "dataPath": ".startTime",
        "schemaPath": "#/properties/startTime/format",
        "params": {
            "format": "time"
        },
        "message": "should match format \"time\"",
        "schema": "time",
        "parentSchema": {
            "type": "string",
            "format": "time"
        },
        "data": ""
    },
    {
        "keyword": "required",
        "dataPath": "",
        "schemaPath": "#/required",
        "params": {
            "missingProperty": "endTime"
        },
        "message": "should have required property 'endTime'",
        "schema": {
            "id": {
                "type": "string",
                "format": "uuid"
            },
            "startTime": {
                "type": "string",
                "format": "time"
            },
            "endTime": {
                "type": "string",
                "format": "time"
            },
            "display": {
                "type": "string"
            },
            "color": {
                "description": "color to display tasks",
                "type": "string"
            }
        },
        "parentSchema": {
            "title": "Example Schema",
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "format": "uuid"
                },
                "startTime": {
                    "type": "string",
                    "format": "time"
                },
                "endTime": {
                    "type": "string",
                    "format": "time"
                },
                "display": {
                    "type": "string"
                },
                "color": {
                    "description": "color to display tasks",
                    "type": "string"
                }
            },
            "required": [
                "startTime",
                "endTime",
                "display",
                "color"
            ]
        },
        "data": {
            "startTime": ""
        }
    },
    {
        "keyword": "required",
        "dataPath": "",
        "schemaPath": "#/required",
        "params": {
            "missingProperty": "display"
        },
        "message": "should have required property 'display'",
        "schema": {
            "id": {
                "type": "string",
                "format": "uuid"
            },
            "startTime": {
                "type": "string",
                "format": "time"
            },
            "endTime": {
                "type": "string",
                "format": "time"
            },
            "display": {
                "type": "string"
            },
            "color": {
                "description": "color to display tasks",
                "type": "string"
            }
        },
        "parentSchema": {
            "title": "Example Schema",
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "format": "uuid"
                },
                "startTime": {
                    "type": "string",
                    "format": "time"
                },
                "endTime": {
                    "type": "string",
                    "format": "time"
                },
                "display": {
                    "type": "string"
                },
                "color": {
                    "description": "color to display tasks",
                    "type": "string"
                }
            },
            "required": [
                "startTime",
                "endTime",
                "display",
                "color"
            ]
        },
        "data": {
            "startTime": ""
        }
    },
    {
        "keyword": "required",
        "dataPath": "",
        "schemaPath": "#/required",
        "params": {
            "missingProperty": "color"
        },
        "message": "should have required property 'color'",
        "schema": {
            "id": {
                "type": "string",
                "format": "uuid"
            },
            "startTime": {
                "type": "string",
                "format": "time"
            },
            "endTime": {
                "type": "string",
                "format": "time"
            },
            "display": {
                "type": "string"
            },
            "color": {
                "description": "color to display tasks",
                "type": "string"
            }
        },
        "parentSchema": {
            "title": "Example Schema",
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "format": "uuid"
                },
                "startTime": {
                    "type": "string",
                    "format": "time"
                },
                "endTime": {
                    "type": "string",
                    "format": "time"
                },
                "display": {
                    "type": "string"
                },
                "color": {
                    "description": "color to display tasks",
                    "type": "string"
                }
            },
            "required": [
                "startTime",
                "endTime",
                "display",
                "color"
            ]
        },
        "data": {
            "startTime": ""
        }
    }
]
```

here is my json.schema

``` json
{
  "title": "Example Schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid"
    },
    "startTime": {
      "type": "string",
      "format": "time"
    },
    "endTime": {
      "type": "string",
      "format": "time"
    },
    "display": {
      "type": "string"
    },
    "color": {
      "description": "color to display tasks",
      "type": "string"
    }
  },
  "required": [
    "startTime",
    "endTime",
    "display",
    "color"
  ]
}
```
