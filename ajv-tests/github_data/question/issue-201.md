# [201] how to reduce validation errors to chosen path of `anyOf`

relevant code example:

```
let PointSchema = {
  id: 'point',
  anyOf: [
    {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' }
      },
      required: [ 'latitude', 'longitude' ]
    },
    {
      type: 'array',
      description: 'GeoJSON format',
      items: [ { type: 'number' }, { type: 'number' } ],
      additionalItems: false,
      minItems: 2
    }
  ]
};

const Ajv = require('ajv');
let ajv = Ajv();
ajv.addSchema(PointSchema, 'point');
let validate = ajv.compile(PersonSchema);
let valid = validate({
  name: 'BadBob',
  location: [ 200 ]
});

console.log(validate.errors);
```

results in:

```
[ { keyword: 'type',
    dataPath: '.location',
    schemaPath: 'point/anyOf/0/type',
    params: { type: 'object' },
    message: 'should be object' },
  { keyword: 'minItems',
    dataPath: '.location',
    schemaPath: 'point/anyOf/1/minItems',
    params: { limit: 2 },
    message: 'should NOT have less than 2 items' },
  { keyword: 'anyOf',
    dataPath: '.location',
    schemaPath: 'point/anyOf',
    params: {},
    message: 'should match some schema in anyOf' } ]
```

In this case, the first path of `anyOf` should not have been followed (as the input is not an object but instead an array). Unfortunately, I get back a sort of confusing collection of errors for the user which I'll now have to go back and parse my way through manually it seems. 

Is there a way to reduce the output errors to only the path followed which best matches the input?
