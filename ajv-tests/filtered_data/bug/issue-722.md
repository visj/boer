# [722] Incorrect error message for exclusiveMaximum/exclusiveMinimum keywords with $data

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.2.0
yes


**Ajv options object**

```javascript
const ajv = new Ajv({
  allErrors: true,
  coerceTypes: true,
  $data: true,
});
```
**JSON Schema**

```json
const schema = {
  "$async": true,
  "properties": {
    "smaller": {
      "type": "number",
      "exclusiveMaximum": { "$data": "1/larger" }
    },
    "larger": { "type": "number" }
  }
};

```

**Sample data**

```json
{ 
  "smaller": 5, 
  "larger": 2
}
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

```javascript
const Ajv = require('ajv');
const ajv = new Ajv({
  allErrors: true,
  coerceTypes: true,
  $data: true,
});

const schema = {
  "$async": true,
  "properties": {
    "smaller": {
      "type": "number",
      "exclusiveMaximum": { "$data": "1/larger" }
    },
    "larger": { "type": "number" }
  }
};

const data = { "smaller": 5, "larger": 2 };
const validate = ajv.compile(schema);

validate(data)
  .catch(exception => {
    console.log(ajv.errorsText(exception.errors)); // data.smaller should be < undefined
  });
```


**Validation result, data AFTER validation, error messages**

**data** remains the same.
Error message: `data.smaller should be < undefined`

**What results did you expect?**
Error message: `data.smaller should be < 2`

**Are you going to resolve the issue?**
I don't think so.