# [517] How can i check a values exists in an array ?

I have a simple question. I have a property **groupBy** which is an array and contain only two possible values "product" and "date". Now i want to make another property required based upon a _value exists_ in the **groupBy** array. In this case when my **groupBy** array contains **"date"** i want to make resolution required! How can i do that ?

Who can i check if an array contains a value ?

```
var data = {
    "pcsStreamId": 123123,
    "start": moment().valueOf(),
    "end": moment().valueOf(),
    "groupBy" : ["product"]
};

var schema = {
        "type": "object",
        "properties": {
            "pcsStreamId": { "type": "number" },
            "start": { "type": "integer", "minimum" : 0 },
            "end": { "type": "integer", "minimum" : 0 },
            "groupBy": {
                "type": "array",
                "uniqueItems": true,
                "items" : {
                    "type": "string",
                    "enum": ["product", "date"]
                },
               "oneOf": [
                   {
                       "contains": { "enum": ["date"] },
                       "required": ["resolution"]
                   }
                ]
            },
            "resolution" : {
                "type": "string",
                "enum": ["day", "year", "month", "shift"]
            },
        },
        "required": ["pcsStreamId", "start", "end", "groupBy"]

};
```