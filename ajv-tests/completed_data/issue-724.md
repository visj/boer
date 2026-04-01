# [724] Strange behaviour when checked variable is missing



**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.1.1

**Ajv options object**
<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
var ajv = new Ajv({allErrors: true, validateSchema: true, $data: true})
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```js
var schema = {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  '$id': 'schemaId',
  'type': 'object',
  'allOf': [
    {
      'if': {
        'properties': {
          'code': {
            'enum': ['01', '02']
          }
        }
      },
      'then': {
        'required': ['reason']
      }
    }
  ]
}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
}

```

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->


**Validation result, data AFTER validation, error messages**

```
[ { keyword: 'required',
    dataPath: '',
    schemaPath: '#/allOf/0/then/required',
    params: { missingProperty: 'reason' },
    message: 'should have required property \'reason\'' }]
```

**What results did you expect?**
If the variable `code` is missing, the object should be valid, and the variable `reason` should not be required.

**Are you going to resolve the issue?**
No