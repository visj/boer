# [780] keyword select requires $data option

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

latest

**Ajv options object**

{ allErrors: true, jsonPointers: true, removeAdditional: true, unicode: true, verbose: true }



**JSON Schema**

    const schem = {
      type: 'object',
      required: ['kind', 'bar'],
      properties: {
        kind: { type: 'string' }
      },
      select: { $data: 'kind' },
      selectCases: {
        foo: {
          required: ['foo'],
          properties: {
            kind: {},
            foo: { type: 'string' }
          },
          additionalProperties: false
        },
        bar: {
          required: ['bar'],
          properties: {
            kind: {},
            bar: { type: 'number' }
          },
          additionalProperties: false
        }
      },
      selectDefault: {
        propertyNames: {
          not: { enum: ['foo', 'bar'] }
        }
      }
    };


**Sample data**

    const invalidDataList = { kind: 'bar', bar: 'it must be a number' };


**Your code**


```import Ajv from 'ajv';

    const ajv = Ajv({ allErrors: true, jsonPointers: true, removeAdditional: true, unicode: true, verbose: true });
    require('ajv-errors')(ajv);
    require('ajv-keywords')(ajv);
    const validate = ajv.compile(schem);
    const valid = validate(invalidDataList);
    if (valid) {
console.log('s');
    } else {
console.log('n');
console.log(validate.errors);
    }
```


**Validation result, data AFTER validation, error messages**

```
true

```

**What results did you expect?**

the kind property has the value 'bar'
So it should validate the inherent bar section and notice that the bar must be a number and not a string

Instead, in my opinion, it can not read the value of kind
In fact, the error appears:

keyword select requires $data option