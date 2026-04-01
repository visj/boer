# [697] Bug: custom formats work wrong in v6.1.1

Testcase:

```
var formats = {
  positiveIntegerFormat: /^[0-9]*$/,
};
var options = {
  allErrors: true,
  errorDataPath: 'property',
  format: 'full',
  formats: formats,
  useDefaults: true,
  v5: true,
};

var schema = {
    type: 'object',
    properties: {
      maxFundsInDollars: {
        format: 'positiveIntegerFormat',
        type: 'number',
        default: null,
        minimum: 0,
        maximum: 10,
      },
    },
    required: ['maxFundsInDollars'],
  };

var object = { maxFundsInDollars: 2.1 };
var ajv = Ajv(options);
var validate = ajv.compile(schema);
var valid = validate(object);

console.log('ajv:', valid);
console.log('regex:', formats.positiveIntegerFormat.test(object.maxFundsInDollars));
```

expected output:
```
"ajv:" false
"regex:" false
```

Testcase output:
```
"ajv:" true
"regex:" false
```