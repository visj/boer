# [2315] Validation fails for `unevaluatedProperties` in nested `allOf`

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

* `v8.12.0`
* We are using the 2019 distribution also for `unevaluatedProperties`: `const Ajv = require("ajv/dist/2019");`

**Ajv options object**


```javascript
{}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "unevaluatedProperties": false,
  "allOf": [
    {
      "type": "object",
      "properties": {
        "foo": {
          "type": "string"
        }
      }
    },
    {
      "unevaluatedProperties": false, "// <- need to comment this out for the tests to pass",
      "allOf": [
        {
          "type": "object",
          "properties": {
            "bar": {
              "type": "string"
            }
          }
        },
        {
          "type": "object",
          "properties": {
            "baz": {
              "type": "string"
            }
          }
        }
      ]
    }
  ]
}

```

**Sample data**

Fails with "must NOT have unevaluated properties" (not expected):

```json
{
  "foo": "bar",
  "bar": "baz",
  "baz": "qux"
}
```


Fails (expected)
```json
{
  "foo": "bar",
  "bar": "baz",
  "baz": "qux",
  "qux": "quux"
}
```

**Your code**

The use case is actually in an OpenAPI testing context, where we are comparing expected response bodies to what is defined in the response schema, with polymorphic and inheritance use cases. [`unevaluatedProperties`](https://json-schema.org/understanding-json-schema/reference/object.html#unevaluated-properties) allows us to extend the schema in a safe way (i.e. a way that prevents false positives where any object will satisfy the schema).

A working clonable gist can be found here: https://gist.github.com/mefellows/283f130d5db6fad33b805b54b3416ec6

There is a similar nested `allOf` (nested.js) example in that repro that seems to pass, so at first glance, it appears there is inconsistent behaviour and there is a bug.

```javascript
const validateJson = (schema, json) => {
  const ajv = new Ajv()

  ajv.validate(schema, json);

  return ajv.errors || [];
};

const schema = { ... } // as per above

const validPayload = {
  foo: "bar",
  bar: "baz",
  baz: "qux"
};

const invalidPayload = {
  ...validPayload,
  qux: "quux"
};

var errors = validateJson(schema, validPayload);
assert(errors.length === 0, "valid payload should not have errors");

var errors = validateJson(schema, invalidPayload);
assert(errors.length === 1, "invalid payload should have errors");

```

**Validation result, data AFTER validation, error messages**

```
[
  {
    instancePath: '',
    schemaPath: '#/allOf/1/unevaluatedProperties',
    keyword: 'unevaluatedProperties',
    params: { unevaluatedProperty: 'foo' },
    message: 'must NOT have unevaluated properties'
  }
]
```

**What results did you expect?**

The validation to succeed, as the properties are valid for the schema.

**Are you going to resolve the issue?**

We would be open to helping fix the problem if it's confirmed as a bug and pointers can be given.