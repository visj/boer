# [65] Why not return errors immediately after validation? (and remove ajv.errors)

Thanks for the great library! I've recently started migrating from tv4 to ajv, primarily because of the promised speed improvements. Thus far AJV appears to be very feature complete and I like pre-registering all schemas in a single instance beforehand; keeps my schemas managed centrally in the codebase which is nice.

I noticed one thing that might be a cause of tricky and hard to reproduce bugs when using the library improperly.

When accessing `ajv.errors` (or `ajv.errorsText` I presume as well) in a callback, promise or any tick after the one in which you've called `ajv.validate` there is no guarantee that `ajv.errors` contains the set of errors you might expect.

Example:

``` javascript
var async = require('async');
var Ajv = require('ajv');

var ajv = new Ajv();
ajv.addSchema({'type': 'string'}, 'testSchema');

function test(name, timeout, data, done) {
  var valid = ajv.validate('testSchema', data);
  console.log(name, 'valid =', valid + ', ajv.errors =', ajv.errors);
  setTimeout(function() {
    console.log(name + ' timeout', ' valid =', valid + ', ajv.errors =', ajv.errors);
    done();
  } , timeout);
}

async.parallel([
  function(cb) {
    test('Test 1', 100, false, cb);
  },
  function(cb) {
    test('Test 2', 50, 'test', cb);
  },
]);
```

This outputs:

```
Test 1 valid = false, ajv.errors = [ { keyword: 'type', dataPath: '', message: 'should be string' } ]
Test 2 valid = true, ajv.errors = null
Test 2 timeout  valid = true, ajv.errors = null
Test 1 timeout  valid = false, ajv.errors = null
```

Notice in the last line `Test 1` is not valid but contains no errors anymore.

The cause is fairly obvious but it is an easy mistake made given how the library currently works. Why not have `var valid = ajv.validate('testSchema', data);` return a result object containing errors, errorText etc. (a sort of `ValidationResult` object)? 

Another option to avoid misuse of the function is to rename `ajv.errors` to `ajv.lastErrors`. Not that I like that name, but it makes its intended use more clear.

I understand these changes would be backwards incompatible, but it might be worth a thought if planning a big new release.

But overall; thanks for the great library! :+1: 
