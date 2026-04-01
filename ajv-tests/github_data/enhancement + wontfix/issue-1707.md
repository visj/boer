# [1707] Add option to silent "resolves to more than one schema" errors

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

v6.12.6

**What problem do you want to solve?**

I have a schema with their references inlined, those still have their `id`, e.g.

```js
const Ajv = require('ajv@6.12.6')
const s = [{
  "id": "Test",
  "type": "object",
  "properties": {
    "rel": {
      "id": "Rel",
      "type": "object",
      "properties": {
        "value": {
          "type": "string"
        }
      }
    }
  }
}, {
  "id": "Rel",
  "type": "object",
  "properties": {
    "value": {
      "type": "string"
    }
  }
}]

const ajv = new Ajv({
  validateSchema: true,
  addUsedSchema: false,
  schemaId: 'auto',
  schemas: s,
});

const valid = ajv.validate({ "$ref": "Test" }, {});

valid
```

I'm getting `Error: schema with key or id "Rel" already exists` above.

> ⚠️ On v8.6.2 I got `Error: schema with key or id "" already exists` instead.

If I rename one of the `Rel` schemas to something else, it validates, but in the actual code I'm not expecting to manipulate the schemas in order to achieve that.

**What do you think is the correct solution to problem?**

Looking at the code, there is a call to a uniqueness validation, if we provide an option to skip duplicated schemas instead of throwing an Error it would be wonderful, e.g.

```diff
  key = resolve.normalizeId(key || id);
+ try {
  checkUnique(this, key);
+ } catch (e) {
+   // if we don't explicitly skip duplicates, then rethrow
+   if (!this._options.skipNestedDuplicates) throw e;
+   return;
+ }
  this._schemas[key] = this._addSchema(schema, _skipValidation, _meta, true);
```

> In my use case that fits perfectly and is what I would expect from actual options.

**Will you be able to implement it?**

Yes, of course.
