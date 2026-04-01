# [2241] strictTuples warning when using 2020-12 draft prefixItems with optional

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
I'm using latest Ajv version as of now (8.12.0)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const options = { allErrors: true };
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$id": "https://www.example.com/schemas/test",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "description": "A schema for unit testing",
  "type": "object",
  "properties": {
    "foo": {
      "type": "string",
      "minLength": 2
    },
    "bar": {
      "type": "number",
      "minimum": 0
    },
    "baz": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 2,
      "prefixItems": [{ "const": "test" }]
    }
  },
  "required": ["foo", "baz"]
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "foo": "foo",
  "bar": 1,
  "baz": ["test", "ok"]
}
```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
import Ajv from 'ajv/dist/2020';
const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(data); // warn: strict mode: "prefixItems" is 2-tuple, but minItems or maxItems/items are not specified or different at path "#/properties/baz"
```

**Validation result, data AFTER validation, error messages**

```javascript
{
  errors: null,
  schema: {
    '$id': 'https://www.example.com/schemas/test',
    '$schema': 'https://json-schema.org/draft/2020-12/schema',
    description: 'A schema for unit testing',
    type: 'object',
    properties: { foo: [Object], bar: [Object], baz: [Object] },
    required: [ 'foo', 'baz' ]
  },
  schemaEnv: <ref *1> SchemaEnv {
    refs: {},
    dynamicAnchors: {},
    schema: {
      '$id': 'https://www.example.com/schemas/test',
      '$schema': 'https://json-schema.org/draft/2020-12/schema',
      description: 'A schema for unit testing',
      type: 'object',
      properties: [Object],
      required: [Array]
    },
    schemaId: '$id',
    root: [Circular *1],
    baseId: 'https://www.example.com/schemas/test',
    schemaPath: undefined,
    localRefs: {},
    meta: undefined,
    '$async': undefined,
    validateName: ValueScopeName {
      str: 'validate20',
      prefix: 'validate',
      value: [Object],
      scopePath: [_Code]
    },
    validate: [Circular *2]
  },
  evaluated: {
    props: { foo: true, bar: true, baz: true },
    items: undefined,
    dynamicProps: false,
    dynamicItems: false
  }
}
```

**What results did you expect?**
No warning. The spec has specifically [changed the way to declare tuples and arrays](https://json-schema.org/draft/2020-12/release-notes.html#changes-to-items-and-additionalitems) to avoid this sort of confusion and I'm not sure the warning is still needed

**Are you going to resolve the issue?**
You mean through an PR? I can certainly do that if that's wanted