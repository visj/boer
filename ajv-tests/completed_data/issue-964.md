# [964] enum or allOf within oneOf false negative validation

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv: `6.5.0`
ajv-cli: `3.0.0`

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

**Note:** I run in `draft-04` mode.

`ajv4.js`:
```javascript
import Ajv from 'ajv'
import metaSchema from 'ajv/lib/refs/json-schema-draft-04.json'

// Needed to continue to use draft-04 schemas
// @link https://github.com/epoberezkin/ajv/releases/tag/5.0.0
const Ajv4 = (options = {}, ...args) => {
  const ajv = new Ajv({
    ...options,
    meta: false, // optional, to prevent adding draft-06 meta-schema
    extendRefs: true, // optional, current default is to 'fail', spec behaviour is to 'ignore'
    unknownFormats: 'ignore', // optional, current default is true (fail)
  }, ...args)

  ajv.addMetaSchema(metaSchema)
  ajv._opts.defaultMeta = metaSchema.id

  // optional, using unversioned URI is out of spec, see https://github.com/json-schema-org/json-schema-spec/issues/216
  ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema'

  // Optionally you can also disable keywords defined in draft-06
  ajv.removeKeyword('propertyNames')
  ajv.removeKeyword('contains')
  ajv.removeKeyword('const')

  return ajv
}

export default Ajv4
```

```js
import Ajv from './ajv4'

const ajv = new Ajv({
  // avoid no schema with key or ref "http://json-schema.org/draft-04/schema"
  validateSchema: false,
})
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "$id": "http://www.axa.ch/schemas/types/children.json",

  "type": "array",
  "title": "Children",
  "description": "Components rendered within a Component.",

  "additionalItems": false,
  "items": {
    "oneOf": [
      {
        "type": "object",
        "title": "Foo",
         "description": "Renders a Foo.",
        "properties": {
          "custom_to_foo": { "type": "number"  },
          "component": {
            "type": "string",
            "title": "Component",
            "description": "The name of the component used to be displayed.",
            "enum": ["Foo"]
          }
        }
      },
      {
        "type": "object",
        "title": "Bar",
         "description": "Renders a Bar.",
        "properties": {
          "custom_to_bar": { "type": "string"  },
          "component": {
            "type": "string",
            "title": "Component",
            "description": "The name of the component used to be displayed.",
            "enum": ["Bar"]
          }
        }
      }
    ]
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
[
  { "component": "Foo", "custom_to_foo": 12345 },
  { "component": "Bar", "custom_to_bar": "Will never be valid because of above enum..." },
]
```


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

https://codesandbox.io/s/yvp968ly89

**Validation result, data AFTER validation, error messages**

```json
[
  {
    "keyword": "enum",
    "dataPath": "[1].component",
    "schemaPath": "#/items/oneOf/0/properties/component/enum",
    "params": {
      "allowedValues": [
        "Foo"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "type",
    "dataPath": "[1].custom_to_bar",
    "schemaPath": "#/items/oneOf/1/properties/custom_to_bar/type",
    "params": {
      "type": "number"
    },
    "message": "should be number"
  },
  {
    "keyword": "oneOf",
    "dataPath": "[1]",
    "schemaPath": "#/items/oneOf",
    "params": {
      "passingSchemas": null
    },
    "message": "should match exactly one schema in oneOf"
  }
]
```

**What results did you expect?**

Failing `enum`s  or `allOf` within `oneOf` should be ignored as long as one matches.

**Are you going to resolve the issue?**

Don't think so.