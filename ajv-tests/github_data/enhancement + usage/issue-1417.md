# [1417] strictTuples with additionalItems -> strictArrays

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

7.0.3

**Ajv options object**

```javascript
{}
```

**JSON Schema**

```json
{
  "type": "array",
  "items": [
    {
      "type": "number"
    }
  ],
  "minItems": 1,
  "additionalItems": {
    "type": "string"
  }
}
```

**Sample data**

N/A

**Your code**

```javascript
new (require("ajv").default)().compile({ type: "array", items: [{type: "number"}], minItems: 1, additionalItems: {type: "string"} })
```

**Validation result, data AFTER validation, error messages**

Warning printed during compilation:

```
strict mode: "items" is 1-tuple, but minItems or maxItems/additionalItems are not specified or different
```

**What results did you expect?**

No warning message.

I'm trying to express the schema "an array with at least one element, which must be a number, followed by any number of strings". Is this the correct way to declare it?

Assuming that it is, I understand that I can turn off this warning with `strictTuples` but it seems like a case that shouldn't emit a warning, or am I misunderstanding the purpose of `strictTuples`?

**Are you going to resolve the issue?**

I suppose I could try my hand at creating a PR. Should this

https://github.com/ajv-validator/ajv/blob/ca2ae61c489f45fa2ec3ff2ee78b10136cb1ed3c/lib/vocabularies/applicator/items.ts#L68-L70

perhaps read something like

```ts
function fullTupleSchema(len: number, sch: any): boolean {
  return len === sch.minItems && (len === sch.maxItems || sch.additionalItems !== undefined)
}
```

?
