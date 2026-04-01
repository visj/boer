# [1627] Improvement for JTD schema validation errors

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

v8.5.0

**What problem do you want to solve?**

At the moment, the errors produced by `ajv` in the case that an invalid JTD schema is supplied are quite verbose. For example, in the case where you specify a `"type": "number"` instead of the correct `"float32"`/`"float64"`, you receive a lot of error output.

Given, for example, a JTD schema in the file `example.jtd.json`:
```json
{
  "definitions": {
    "length": {
      "type": "number"
    }
  }
}
```

When I run `npx ajv --spec=jtd -s example.jtd.json -d example.json`, I receive:

> schema example.jtd.json is invalid
> error: schema is invalid: data/definitions/length/type must NOT have additional properties, data/definitions/length must have property 'ref', data/definitions/length/type must be equal to one of the allowed values, data/definitions/length must have property 'enum', data/definitions/length must have property 'elements', data/definitions/length must have property 'properties', data/definitions/length must have property 'optionalProperties', data/definitions/length must have property 'discriminator', data/definitions/length must have property 'values', data/definitions/length must match a schema in union, data must have property 'ref', data must have property 'type', data must have property 'enum', data must have property 'elements', data must have property 'properties', data must have property 'optionalProperties', data must have property 'discriminator', data must have property 'values', data must match a schema in union

**What do you think is the correct solution to problem?**

I think ideally the error would be much shorter, and make it more obvious what the problem is. Since `/definitions/length` has a `"type"` property, it would be ideal if the schema parser could assume that we did mean for this to be a primitive and not bother producing errors which account for all possible JTD schema forms such as discriminator, properties, etc. For example if the error just said:

> data/definitions/length/type must be equal to one of the allowed values

that would already make it much easier to track down. Even better than that would be

> data/definitions/length/type must be equal to one of the allowed values: 'boolean', 'int8', 'int32', ... , 'float32', 'float64', ...

**Will you be able to implement it?**

It's quite unlikely that I can set the time aside to look into this, sadly.