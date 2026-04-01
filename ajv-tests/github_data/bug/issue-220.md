# [220] got "Maximum call stack size exceeded" with compileAsync

The issue happens when $ref's hash has match the original schema, here is the code:

```
const Ajv = require('ajv');

const schema = {
  properties: {
    name: {
      $ref: 'Something#/properties/name',
    },
  },
};

const asyncSchema = {
  properties: {
    name: {
      type: 'string',
    },
  },
};

const data = {
  name: 'haha',
};

var ajv = new Ajv({ loadSchema: loadSchema });

ajv.compileAsync(schema, function (err, validate) {
    if (err) {
      console.log(err); // got Maximum call stack size exceeded
      return;
    }
    var valid = validate(data);
    console.log(valid);
});

function loadSchema(uri, callback) {
  setTimeout(() => {
    callback(null, asyncSchema);
  }, 100);
}
```

I debugged Ajv's code, the order of ajv try to resolve a $ref is "added schemas > schema it self > loadSchema function", I think the order should be changed to "added schemas > loadSchema function > schema it self" 
