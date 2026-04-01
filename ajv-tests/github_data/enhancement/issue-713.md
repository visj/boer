# [713] Add "allowedValue" to error params of "const" keyword

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`6.1.1`, yes.


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{
  allErrors: true,
  useDefaults: true,
  removeAdditional: 'all',
  coerceTypes: 'array',
}
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "string",
  "const": "EVENT",
  "default": "EVENT"
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
"FOO"
```


**Your code**

```javascript
ajv.validate({
  "type": "string",
  "const": "EVENT"
}, 'FOO');
```


**Validation result, data AFTER validation, error messages**

```json
[
  {
    "keyword": "const",
    "dataPath": "",
    "schemaPath": "#/const",
    "params": {},
    "message": "should be equal to constant"
  }
]
```

**What results did you expect?**

This issue is virtually identical to #282, i.e. that it would be nice if the error payload contained a reference to the required constant value.

**Are you going to resolve the issue?**

I would need to investigate the templating stuff before submitting a fix, but the issue should be resolved by adding `allowedValue` (or similar) [here](https://github.com/epoberezkin/ajv/blob/master/lib/dot/errors.def#L170).