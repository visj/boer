# [1387] Modifying custom keyword not working

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
latest (v 7.0.3)
This was working in v6


**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

```javascript
{
   allErrors: true 
  // btw this is a regression from v6, as without this flag, the custom validation will not run at all
  // which doesn't make sense for a modifying keyword
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "type": "object",
    "properties": {
        "p1": {
            "type": "string",
            "enum": ["v1", "v2"],
            "case_insensitive_enums": true
        }
    }
}
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
    "p1": "V2"
}
```

**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const KEYWORD_NAME = "case_insensitive_enums";
const schema = {
    type: "object",
    properties: {
        p1: {
            type: "string",
            enum: ["v1", "v2"],
            [KEYWORD_NAME]: true
        }
    }
};

const Ajv = require("ajv").default;
const ajv = new Ajv({
    allErrors: true
});

ajv.addKeyword({
    keyword: KEYWORD_NAME,
    type: "string",
    modifying: true,
    validate: function (kwVal, data, metadata, dataCxt) {
        for (const entry of metadata.enum) {
            if (data.toLowerCase() === entry.toLowerCase()) {
                dataCxt.parentData[dataCxt.parentDataProperty] = entry;
                console.log("enum normalized");
                break;
            }
        }

        return true;
    }
});

const validate = ajv.compile(schema);
const valid = validate({
    p1: "V2"
});

console.log(valid ? "Validation success" : "Validation error:", validate.errors);

```

**Validation result, data AFTER validation, error messages**

```
Validation error: [
  {
    keyword: 'enum',
    dataPath: '/p1',
    schemaPath: '#/properties/p1/enum',
    params: { allowedValues: [Array] },
    message: 'should be equal to one of the allowed values'
  }
]
```

**What results did you expect?**

Validation success (as was in v6)

**Are you going to resolve the issue?**
no