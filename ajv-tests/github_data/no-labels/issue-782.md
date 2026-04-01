# [782] Ajv.addKeywordSimple Feature

I had to do a lot of digging to figure out how to add a simple custom validator that could also modify the data as well, so I came up with a simple wrapper that I thought a lot of users would find useful.

### Example
```javascript
ajv.addKeywordSimple('unsined_add_one', data => {
  if (data < 0) throw new Error('must be positive or zero');
  return data + 1; // value is incremented by 1
});
```
I thought that this format takes a lot of complexity out of most simple custom validation cases.

Below is my implementation. I wasn't sure where this should be integrated into your project. If you like it and let me know where you would like this placed, I'll create a pull request.

Thanks for the great library

### Implementation
```javascript
/*global describe, it */
'use strict';

const Ajv = module.exports = require('ajv');


/*
Ajv.addKeywordSimple makes it easier to add custom keywords

keyword - string that defines the custom key
validator - function that
  - if invalid throws error
  - if valid returns undefined
  - if modifying value returns the modified value

Example

ajv.addKeywordSimple('unsined_add_one', data => {
  if (data < 0) throw new Error('must be positive or zero');
  return data + 1; // value is incremented by 1
});
*/
Ajv.prototype.addKeywordSimple = function(keyword, validator) {
  this.addKeyword(keyword, {
    validate: function wrapped(...args) {
      // Reference: https://github.com/epoberezkin/ajv/blob/master/CUSTOM.md#define-keyword-with-validation-function
      //            https://github.com/epoberezkin/ajv/issues/181#issuecomment-217858233
      const [
        schema, // eslint-disable-line no-unused-vars
        data,
        parentSchema, // eslint-disable-line no-unused-vars
        currentDataPath, // eslint-disable-line no-unused-vars
        parentDataObject,
        propertyKey,
        rootData, // eslint-disable-line no-unused-vars
      ] = args;

      try {
        const returnedVal = validator(data);
        if (returnedVal !== undefined)
          parentDataObject[propertyKey] = returnedVal;

        return true;
      } catch(err) {
        wrapped.errors = [{message: err.message}];
        return false;
      }
    },
    modifying: true,
    errors: true,
  });

  return this;
};
```

### Tests
```javascript
/*global describe, it */
'use strict';

const _ = require('lodash');

const chai = require('chai');
chai.should();
const {expect} = chai;

describe('addKeywordSimple validator', function () {
  const schema = {
    type: 'object',
    properties: {
      a: {
        type: 'boolean',
        b: true,
      },
    },
  };

  it('returns undefined and value is not modified', function() {
    const obj = {a: true},
          objRef = _.cloneDeep(obj);

    const ajv = new Ajv();
    ajv.addKeywordSimple('b', () => undefined);
    const validate = ajv.compile(schema);

    validate(obj)
      .should.be.true;

    objRef.should.eql(obj);
    expect(validate.errors).to.be.null;
  });

  it('returns non undefined value and the object is modified', function() {
    const obj = {a: true},
          objRef = {a: false};

    const ajv = new Ajv();
    ajv.addKeywordSimple('b', () => false);
    const validate = ajv.compile(schema);

    validate(obj)
      .should.be.true;

    objRef.should.eql(obj);
    expect(validate.errors).to.be.null;
  });

  it('throws error and error message is assigned to wrapper function propery "errors"', function() {
    const obj = {a: true},
          objRef = _.cloneDeep(obj),
          errMsg = 'error message test';

    const ajv = new Ajv();
    ajv.addKeywordSimple('b', () => {throw new Error(errMsg);});
    const validate = ajv.compile(schema);

    validate(obj)
      .should.be.false;

    objRef.should.eql(obj);
    [{
      dataPath: '.a',
      message: 'error message test',
      schemaPath: '#/properties/a/b',
    }].should.eql(validate.errors);
  });
});
```