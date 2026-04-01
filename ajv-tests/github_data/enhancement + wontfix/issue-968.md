# [968] additionalProperties: 'fail'

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**

`6.9.2`

**What problem do you want to solve?**
```javascript
{
    type: 'object',
    additionalProperties: false,
    properties: {
        prop1: {type: 'string'}
    }
}
```

When accepting strict set of properties from insecure input, it would be handy if you could declare the schema so that on presence of any other additional property, validation would fail. Filtering out properties with `additionalProperties:false` is fine most of the time, however sometimes, when dealing with "sensitive" data, you want to explicitly reject the input.

**What do you think is the correct solution to problem?**

One solution would be to allow to set `additionalProperties` to `"fail"` in json-schema.

**Will you be able to implement it?**
not in the nearest future