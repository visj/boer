# [2212] Type coercion disables strict validating of non-finite numbers in object schema

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.12.0, yes

**Ajv options object**

```javascript
{coerceTypes: true, strict: true}
```

**JSON Schema**

I used this Typebox schema

```js
const PositiveIntegerObjSchema = typebox.Type.Object({
  id: typebox.Type.Integer({ minimum: 0 }),
});

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
[
  {"id": "Infinity"},
  {"id": "-Infinity"}
]

```


```javascript
const typebox = require("@sinclair/typebox");
const Ajv = require("ajv");
new Ajv();
const ajv = new Ajv({coerceTypes: true, strict: true});

const PositiveIntegerObjSchema = typebox.Type.Object({
  id: typebox.Type.Integer({ minimum: 0 }),
});

function compile(input) {
  console.log(
    `${input.id} (${typeof input.id}): ${ajv.compile(PositiveIntegerObjSchema)(
      input
    )}`
  );
}

const idValues = [
  Infinity,
  -Infinity,
  "Infinity",
  "-Infinity",
  42,
  "42",
  NaN,
  "NaN",
];

idValues.forEach((val) => compile({ id: val }));

```

**Validation result, data AFTER validation, error messages**

```
Infinity (number): false
-Infinity (number): false
Infinity (string): true
-Infinity (string): true
42 (number): true
42 (string): true
NaN (number): false
NaN (string): false

```

**What results did you expect?**
Infinity (number): false
-Infinity (number): false
Infinity (string): **false**
-Infinity (string): **false**
42 (number): true
42 (string): true
NaN (number): false
NaN (string): false

**Are you going to resolve the issue?**

If I'm able. Currently, Resorting to Regex Type for reliable integer validation. 
