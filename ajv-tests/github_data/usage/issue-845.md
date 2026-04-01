# [845] $data 

This is not really an issue, because it works, but I am not sure why it does.
I want to make a property within an object `personalDetails.occupation` required if the data does not contain a certain top-level object (`payor`). I tried a few options without much success and then I fiddled with $data and came out with the solution below. If works as I expect, but I am not sure it is really correct (or may have side-effects) because i can't really make sense of what's going on.
Thanks for your help!

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.5.3

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
const ajv = new Ajv({
    $data: true,
    allErrors: true,
    jsonPointers: true,
    format : "full",
    useDefaults : true,
    removeAdditional : true});
// using ajv-errors
require('ajv-errors')(ajv, { keepErrors: false, singleError : false });
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "$schema": "http://json-schema.org/schema#",
    "$id": "https://example.com/schemas/ztest.schema.json",
    "type": "object",
    "properties": {
        "personalDetails": {
            "allOf" : [
                {
                    "if" : { "required" : { "$data": "/payor" }},
                    "then" : { "required": ["occupation"] }
                }
            ]
        },
        "payor" : {
            "type" : "object"
        }
    }
}
```
Please note the use of the $data pointer within the `if` condition.
Perhaps counter-intuitively, when `payor` is not specified the condition becomes true and therefore `occupation` becomes required. Conversely, when `payor` is defined the condition is never true. 

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

This validates because no `occupation` is required if a `payor` is defined
```json
{
  "personalDetails" : {},
  "payor" : {}
}
```

This also validates because `occupation` is defined when `payor` is not defined
```json
{
  "personalDetails" : { "occupation" : "butcher" }
}
```

This (correctly) fails validation because `payor` is not defined
```json
{
  "personalDetails" : { }
}
```

**What results did you expect?**

The behaviour is correct. However I am not sure this is happening by chance or if the schema above is correct, given the counter-intuitive condition. 