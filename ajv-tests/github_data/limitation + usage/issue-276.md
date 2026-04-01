# [276] defaults don't work inside `anyOf` 

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
4.4.0, yes

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

``` javascript
{
  ownProperties: true,
  allErrors: true,
  useDefaults: true
}
```

**JSON Schema (please make it as small as possible to reproduce the issue):**

_not_ working:

``` json
{
  "type": "object",
  "properties": {
    "num": { "allOf": [ { "type": "number", "default": 2 }, { "acceptTerms": true } ] }
  },
  "required": [ "num" ]
}
```

working:

``` json
{
  "type": "object",
  "properties": {
    "num": { "type": "number", "default": 2 }
  },
  "required": [ "num" ]
}
```

**Data (please make it as small as posssible to reproduce the issue):**

``` json
{}
```

**Your code (please use `options`, `schema` and `data` as variables):**

``` javascript
let ajv = new Ajv(options);
ajv.addKeyword('acceptTerms', () => () => true);
let validate = ajv.compile(schema);
let valid = validate(data);
if (!valid) {
  console.log(validate.errors);
}
```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->

**Validation result, data AFTER validation, error messages:**

```
[ { keyword: 'required',
    dataPath: '',
    schemaPath: '#/required',
    params: { missingProperty: 'num' },
    message: 'should have required property \'num\'' } ]
```

**What results did you expect?**
no errors, the default of `2` would be used

**Do you intend to resolve the issue?**
