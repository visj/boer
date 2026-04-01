# [992] Support coercion of a single object into an array of objects

**What version of Ajv you are you using?**

6.10.0

**What problem do you want to solve?**

Coercion to and from array currently does not work for objects. What would be very useful is,

- If an object is present and an array of objects is required, Ajv wraps the object in an array. `{} -> [ {} ]`
- If an array with one object is present and an object is required, Ajv coerces array into its item.`[{}] -> {} `

Here is a test that also illustrates the desired behaviour:
```js
'use strict';

var Ajv = require('../ajv');
require('../chai').should();

describe('issue #991: option coerceTypes: "array" does not coerce objects', function() {
  it('should support coercion of a single object into an array of objects', function() {
    var ajv = new Ajv({
      coerceTypes: 'array'
    });

    var schema = {
      type: 'object',
      properties: {
        arrayOfObjects: {
          type: 'array',
          items: {
            type: 'object'
          }
        }
      },
    };
    var validate = ajv.compile(schema);

    var data = {
      arrayOfObjects: [{}]
    };
    validate(data) .should.equal(true);
    data .should.have.property('arrayOfObjects');
    data.arrayOfObjects .should.be.an('array');

    // This does not work!
    data = {
      arrayOfObjects: {}
    };
    validate(data) .should.equal(true);
    data .should.have.property('arrayOfObjects');
    data.arrayOfObjects .should.be.an('array');
  });
});
```

**What do you think is the correct solution to problem?**

Not sure if this is possible. I suspect the fact that it has not been implemented yet, implies that it is not (?)

**Will you be able to implement it?**

May be. But first wanted to get some indication whether this is possible at all / how difficult it would be / where to get started.