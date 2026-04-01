# [1015] Blacklist specific properties for type object

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**

v6.1.1

**What problem do you want to solve?**

Can specific properties of type object be blacklisted?

Apologies if this is already addressed somewhere and I missed it. I read through the documentation and I tried looking on stack overflow without success. I know it's possible to set `additionalProperties: false` to blacklist all other properties not identified in the JSON schema but I'm only concerned with having a list of properties that are not valid, rather than all properties not listed in the schema. Perhaps this can already be solved with the compound keyword `not`?

**What do you think is the correct solution to problem?**

Maybe something like below?

```json
{
  "type": "object",
  "properties": {
    "foo": { "type": "string" },
    "bar": { "type": "string" }
  },
  "invalidProperties": ["baz"]
}
```
valid: `{ "foo": "a" }`, `{ "bar": "b" }`, `{}`
invalid: `{ "foo": "a", "baz": 5 }`

**Will you be able to implement it?**

Possibly