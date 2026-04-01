# [844] "No Error" error message when using schema with external $ref

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v6.5.3

**Ajv options object**

```javascript
{ schemas: [optSchema, splitOptsSchema] }
```

**JSON Schema**
Schema 1: ```optSchema```
```json
{
  "$schema": "http://json-schema.org/schema#",
  "$id": "https://example.com/schemas/opt.json",
  "type": "string",
  "minLength": 1
}
```
Schema 2: ```splitOptsSchema```
```json
{
  "$schema": "http://json-schema.org/schema#",
  "$id": "https://example.com/schemas/opts.json",
  "type": "array",
  "items": {
    "$ref": "opt.json"
  }
```
Schema 3: ```singleOptsSchema```
```json
{
  "$schema": "http://json-schema.org/schema#",
  "$id": "https://example.com/schemas/optsOne.json",
  "definitions": {
    "opt": {
      "type": "string",
      "minLength": 1
    }
  },
  "type": "array",
  "items": {
    "$ref": "#/definitions/opt"
  }
```

**Sample data**

```json
["test", ""]
```
This data fails due to the empty 2nd element

**Your code**
```javascript
// Run validation with ```splitOptsSchema```
let valid = ajv.getSchema("https://example.com/schemas/opts.json")(data);
if (!valid) console.log("Split schema: ", ajv.errorsText());

// Run validation with ```singleOptsSchema```
valid = ajv.validate(singleOptsSchema, data);
if (!valid) console.log("Single schema: ", ajv.errorsText());
```

[Full script on runkit.com](https://runkit.com/hokiedsp/ajv-issue) (It does not run on runkit.com due to ajv missing a dependent package)
**Validation error messages**
```
Split schema:  No errors
Single schema:  data[1] should NOT be shorter than 1 characters
```

**What results did you expect?**
The split-file schema error should be exactly the same as the single-file schema

**Are you going to resolve the issue?**
I could, but I need some pointers as I'm not familiar with the innards of ajv.