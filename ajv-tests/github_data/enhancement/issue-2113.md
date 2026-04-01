# [2113] More specific error messages when validating mutual exclusive properties

I need to define a `range` object which has two set of mutual exclusive properties `(gt, gte)` and `(lt, lte)` meaning that if there is `gt` property then `gte` must not be present (and viceversa), and if there is `lt` property then `lte` property must not be present (and viceversa). This basically models a lower and upper range using operators `(<, <=, >, >=)`.

So far, I am using `dependencies` to model the mutual exclusive behaviour:

```ts
import Ajv from 'ajv';

const ajv = new Ajv();

const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        gt: { type: 'string' },
        gte: { type: 'string' },
        lt: { type: 'string' },
        lte: { type: 'string' },
    },
    dependencies: {
        gt: { not: { required: ['gte'] } },
        gte: { not: { required: ['gt'] } },
        lt: { not: { required: ['lte'] } },
        lte: { not: { required: ['lt'] } },
    }
}

const validate = ajv.compile(schema);

console.log(validate({ gt: 'a', lte: 'z' }), validate.errors);
console.log();
console.log(validate({ gt: 'a', gte: 'b' }), validate.errors);
```

This works, but unfortunately the error message is not super helpful:

```
true null

false [
  {
    instancePath: '',
    schemaPath: '#/dependencies/gt/not',
    keyword: 'not',
    params: {},
    message: 'must NOT be valid'
  }
]
```

This validation should be performed by an Api and ideally I would like to return to the client a more specific error like `gte must not be present if gt is specified` or something like this. Is there any way to model mutual exclusive set of properties like in this example and get more specific error messages?
