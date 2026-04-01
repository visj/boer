# [958] ajv.getSchema cant resolve reference <schema-id> from id#

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Tested with `Ajv@6.9.1` & `Ajv@6.5.4`

**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
//however fails also without any user defined options being set
const validator = new require('ajv')({
    $data: true,
    allErrors: false,
    verbose: true,
    schemaId: '$id',
    nullable: true,
    extendRefs: 'fail',
    additionalProperties: true,
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    passContext: true
});

validator.addSchema([
    {
        '$id': 'discount.id',
        minimum: 1,
        maximum: Number.MAX_SAFE_INTEGER,
        type: 'integer',
    }
]);

const schema = {
    "type": "array",
    "items": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "product_item": {
                "type": "object",
                "additionalProperties": false,
                "properties": {
                    "discount_id": {
                        "$ref": "dicount.id"
                    }
                }
            }
        }
    }
}

validator.addSchema(schema, 'schema-name');
validator.getSchema('schema-name'); //FAILS WITH  cant resolve reference discount.id from id# error


```
> Error: can't resolve reference dicount.id from id #

**What results did you expect?**

I'd expect validation function to be returned.

**Are you going to resolve the issue?**
Negative