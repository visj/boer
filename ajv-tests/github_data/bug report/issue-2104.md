# [2104] Validation failing for multipleOf

     const Ajv = require("ajv")
     const ajv = new Ajv(); 

    const schema = {
      type: 'object',
      properties: {
        foo: { multipleOf: 1.01, type: 'number' },
        bar: { type: 'string' },
      },
      required: ['foo'],
      additionalProperties: false,
    };

    const validate = ajv.compile(schema);

    const data = {
      foo: 5001.77,
      bar: 'abc',
    };

    const valid = validate(data);

    console.log('----->validate.errors', validate.errors);
    console.log('----->valid', valid);


The above schema throws an error for mutipleOf, even though it's 0.01. is there any other way to achieve 2 decimal numbers
