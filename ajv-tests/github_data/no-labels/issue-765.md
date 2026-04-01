# [765] `not` keyword should return more specific details.

I'm working with AJV 6.4.0 and trying to provide a bit more specifics when material is invalid because it matches a "not" rule.  For example, say I have this schema and data:

```
var AJV = require("ajv");
var ajv = new AJV({ allErrors: true });
var validator = ajv.compile({
    not: {
        type: "string"
    }
});

var validationResults = validator({foo: "bar"});

/*
  Validation Errors:

  [{
    "keyword": "not",
    "dataPath": "",
    "schemaPath": "#/not",
    "params": {},
    "message": "should NOT be valid"
  }]

*/
```

While this is accurate, it is less useful than the output of something like an `allOf` rule validation failure, where, instead of flagging `allOf` itself as the failure, the failing rule itself is reported and highlighted as the `keyword`, as shown here:

```
var AJV = require("ajv");
var ajv = new AJV({ allErrors: true });
var validator = ajv.compile({
    allOf: [{
        type: "string"
    }]
});

var validationResults = validator(false);

/*
Validation Errors:

[
  {
    "keyword": "type",
    "dataPath": "",
    "schemaPath": "#/allOf/0/type",
    "params": {
      "type": "string"
    },
    "message": "should be string"
  }
]
*/
```

I understand there may be performance issues in reporting all errors, but in reading through [this issue](https://github.com/epoberezkin/ajv/issues/131), it sounds like AJV is at least aware of the first rule that the content being validated matches within the `not` block.  It would be helpful to report  that detail within `params`, as in:

```
  {
    "keyword": "not",
    "dataPath": "",
    "schemaPath": "#/not",
    "params": {
      "firstFailingSchemaSubPath": "#/not/type
     },
    "message": "should NOT be valid"
  }
```

If there is agreement in principle that this is reasonable and possible, I am happy to put together a pull request.