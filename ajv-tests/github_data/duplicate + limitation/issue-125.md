# [125] Question: Anyway to get a "compiled" version of the schema?

First, let me thank you for the work on the validator. We're using it to satisfy quite a few needs we've had with data validation on older data sets we have. 

Is there anyway to get a "compiled" version of the schema that is built with $ref's? We need to pass it to a 3rd party utility we don't have control over and this utility doesn't seem to support $ref's in any way we've been able to figure out.

Specifically, where you would normally have the following ( I trimmed it down for readability ):

Product

``` javascript
{
    "type": "object",
    "id": "#Product",
    "properties": {
        "label": { 
            "type": "string"
        },
        "category": { 
            "$ref": "Category"
        }
    },
    "required": [
        "label",
        "category"
    ],
    "additionalProperties": false
}
```

Category

``` javascript
{
    "type": "object",
    "id": "#Category",
    "properties": {
        "label": { 
            "type": "string"
    },
    "required": [
        "label"
    ],
    "additionalProperties": false
}
```

Is there anyway to execute something so that we could get something similar to the following? I'm sorry if "compiled" is not the right term.

``` javascript
{
    "type": "object",
    "id": "#Product",
    "properties": {
        "label": { 
            "type": "string"
        },
        "category": { 
            "type": "object",
            "properties": {
                "label": { 
                    "type": "string"
                }
            },
            "required": [
                "label"
            ],
            "additionalProperties": false
        }
    },
    "required": [
        "label",
        "category"
    ],
    "additionalProperties": false
}
```
