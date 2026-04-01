# [801] "Maximum call stack size exceeded" when using compileAsync + circular references in some schemas

Hi,
i'm working on a project where we want to validate json data based using various schema files that are interconnected via $refs.
My plan was to use compileAsync on a starting schema and load the referenced schemas by implementing a loadSchema function. However i run into `Maximum call stack size exceeded` errors when i execute the validation function.
Below is a (hopefully) minimal example of the schema structure causing the error (see _Your code_ for the full example) .
Some additional notes about this:

- i also tried manually loading the additional schemas (see `validate()` in the code example below) which seems to work, the error occured for me only when using compileAsync (see `validateAsync()`) 
- the schemas `foo` and `bar` form a circular reference
- for some reason, the reference to the seemingly unrelated `other` schema needs to be there to cause the error. Therefore i suspect that the circular reference itself is not the root cause
- The `other` reference can also be moved to the `bar` schema for similar result

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.5.0, yes


**Ajv options object**


```javascript
{
    loadSchema: (uri) => {
      switch(uri) {
        case 'foo':
          return Promise.resolve(fooSchema);
        case 'bar':
          return Promise.resolve(barSchema);
        case 'other':
          return Promise.resolve(otherSchema);
      }
    }
  }
```


**JSON Schema**

```json
const fooSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "foo",
  "type": "object",
  "properties": {
    "bar": {
      "$ref": "bar"
    },
    "other": {
      "$ref": "other"
    }
  }
};

const barSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "bar",
  "type": "object",
  "properties": {
    "foo": {
      "$ref": "foo"
    }
  }
};

const otherSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "other"
};

const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "list",
  "type": "object",
  "properties": {
    "foo": {
      "$ref": "foo"
    }
  }
};

```


**Sample data**

```json
{
  "foo": {}
};

```


**Your code**

```javascript
const ajv = require('ajv');

const fooSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "foo",
  "type": "object",
  "properties": {
    "bar": {
      "$ref": "bar"
    },
    "other": {
      "$ref": "other"
    }
  }
};

const barSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "bar",
  "type": "object",
  "properties": {
    "foo": {
      "$ref": "foo"
    }
  }
};

const otherSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "other"
};

const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "list",
  "type": "object",
  "properties": {
    "foo": {
      "$ref": "foo"
    }
  }
};

const data = {
  "foo": {}
};

function validate() {
  const validator = new ajv();

  validator.addSchema(fooSchema);
  validator.addSchema(barSchema);
  validator.addSchema(otherSchema);

  const validate = validator.compile(schema);
  console.log('sync', validate(data));
}

async function validateAsync() {
  const validator = new ajv({
    loadSchema: (uri) => {
      switch(uri) {
        case 'foo':
          return Promise.resolve(fooSchema);
        case 'bar':
          return Promise.resolve(barSchema);
        case 'other':
          return Promise.resolve(otherSchema);
      }
    }
  });

  try {
    const validate = await validator.compileAsync(schema);
    console.log('async', validate(data));
  } catch(error) {
    console.error('async', error);
  }
}

validate();
validateAsync();
```


**Validation result, data AFTER validation, error messages**

```
sync true
async RangeError: Maximum call stack size exceeded
    at callValidate (.../ajv/lib/ajv.js:1:1)
    at callValidate (.../ajv/lib/ajv.js:370:28)
    ...
```

**What results did you expect?**
compile() and compileAsync() should provide the same result - no `call stack exceeded` error should occure

**Are you going to resolve the issue?**
no sure - propably not...