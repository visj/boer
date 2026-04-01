# [2068] Dot notation is not recognised for validation

**Description of the issue**

If I have a property nested deeply in the data object at e.g. `data.properties.nested`, I cannot reference this property for validation in the schema by using dot notation. I can reference nested data from the schema this way however in  [JSON Forms](https://jsonforms.io/), which leads to a mismatch of behaviour (as JSON forms uses Ajv to validate).

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.0

**Ajv options object**

```javascript
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
  strictRequired: true
});

addFormats(ajv);
```

**JSON Schema**

```javascript
const schema = {
  type: "object",
  properties: {
    notNested: {
      type: "string"
    },
    "properties.nested": {
      type: "string"
    }
  },
  required: ["notNested", "properties.nested"]
};
```

**Sample data**

```javascript
const data = {
  notNested: undefined,
  properties: {
    nested: undefined
  }
};
```

**Your code**

Here's a link to a [RunKit repro](https://runkit.com/olliejm/ajv-issue)

```javascript
var Ajv = require('ajv');
var addFormats = require("ajv-formats");

var ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
  strictRequired: true
});

addFormats(ajv);

var schema = {
  type: "object",
  properties: {
    notNested: {
      type: "string"
    },
    "properties.nested": {
      type: "string"
    }
  },
  required: ["notNested", "properties.nested"]
};

var data = {
  notNested: undefined,
  properties: {
    nested: undefined
  }
};

const validate = ajv.compile(schema);
validate(data);

console.log("Expect two errors", validate.errors);

data.notNested = "Hello";
validate(data);

console.log("Expect one error", validate.errors);

data.properties.nested = "Hello";
validate(data);

console.log("Expect no errors", validate.errors);
```

**Validation result, data AFTER validation, error messages**

```
must have required property 'properties.nested'
```

**What results did you expect?**

No validation errors, as Ajv should detect that `properties.nested` is now defined in the data structure, the same way it detected that `notNested` was now defined.

**Are you going to resolve the issue?**

At the present time I likely do not have either the time or familiarity with the Ajv repository to begin working on a fix myself.

**Additional Context**

I discovered the issue when using this dot notation to define properties when using [JSON Forms](https://jsonforms.io/), it recognises the dot notation completely fine.

It is possible to make it work by 'expanding' the schema out to e.g. 

```js
var schema = {
  type: "object",
  properties: {
    notNested: {
      type: "string"
    },
    properties: {
      type: "object",
      properties: {
        nested: {
          type: 'string'
        }
      },
      required: ['nested']
    }
  },
  required: ["notNested"]
};
```

But I think with very large deeply nested data structures this makes schemas unnecessarily confusing, and it's not clear which library here out of Ajv or JSON Forms is behaving 'correctly'.