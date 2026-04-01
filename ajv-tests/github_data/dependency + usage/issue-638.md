# [638] Invalid value for `required` field in schema causes vague error

If required is erroneously passed an array or arrays there is a cryptic difficult to trace error.
Ajv should validate the actual schema.

```
TypeError: str.replace is not a function
    at escapeQuotes (xxx/node_modules/.registry.npmjs.org/ajv/5.5.0/node_modules/ajv/lib/compile/util.js:116:14)
    at Object.getProperty (xxx/node_modules/.registry.npmjs.org/ajv/5.5.0/node_modules/ajv/lib/compile/util.js:111:22)
    at Object.generate_required [as code] (xxx/node_modules/.registry.npmjs.org/ajv/5.5.0/node_modules/ajv/lib/dotjs/required.js:229:33)
    at generate_validate (xxx/node_modules/.registry.npmjs.org/ajv/5.5.0/node_modules/ajv/lib/dotjs/validate.js:347:35)
    at localCompile (xxx/node_modules/.registry.npmjs.org/ajv/5.5.0/node_modules/ajv/lib/compile/index.js:87:22)
    at Ajv.compile (xxx/node_modules/.registry.npmjs.org/ajv/5.5.0/node_modules/ajv/lib/compile/index.js:56:13)
    at Ajv._compile (xxx/node_modules/.registry.npmjs.org/ajv/5.5.0/node_modules/ajv/lib/ajv.js:358:27)
    at Ajv.compile (xxx/node_modules/.registry.npmjs.org/ajv/5.5.0/node_modules/ajv/lib/ajv.js:118:37)
    at AjvValidator.compileValidator (xxx/node_modules/.registry.npmjs.org/objection/0.9.2/node_modules/objection/lib/model/AjvValidator.js:114:25)
    at AjvValidator.getValidator (xxx/node_modules/.registry.npmjs.org/objection/0.9.2/node_modules/objection/lib/model/AjvValidator.js:98:24)
    at AjvValidator.validate (xxx/node_modules/.registry.npmjs.org/objection/0.9.2/node_modules/objection/lib/model/AjvValid
```

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

5.5.0

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json5
{
    type: 'object',
    required: [[
      'id',
      'name',
    ]],
  }
```
