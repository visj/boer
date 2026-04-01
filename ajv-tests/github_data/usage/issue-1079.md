# [1079] Not able to validate properties not equal to another using keyword 'not'

Ajv version used: 6.10.2, this issue exists in the latest version.

I want to validate a property value not equal to another property's value of an object. I defined following two schemas, none of them works for me.

**Ajv options object**
{allErrors: true, verbose: true}

**JSON Schema**

{
    "type": "object",
    "properties": {
        "foo": { "type": "string" },
        "bar": { "type": "string" },
    },
    "not": {
    "properties": {"bar": {"const": {"$data": "/foo"}}}
    }
}

{
    "type": "object",
    "properties": {
        "foo": { "type": "string" },
        "bar": { "type": "string", not: {"const": {"$data": "/foo"}}},
    }
}
**Sample data**

{"foo": "foo", "bar": "foo"}


**Validation result, data AFTER validation, error messages**

Valid

**What results did you expect?**
Invalid

**Are you going to resolve the issue?**
