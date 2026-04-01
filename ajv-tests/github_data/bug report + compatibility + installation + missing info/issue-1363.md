# [1363] Cannot read property 'test' of undefined

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`7.0.2`

**Ajv options object**

```javascript
const ajv = new Ajv.default({ code: { source: true } });
```

**JSON Schema**

-

**Sample data**

-

**Your code**

```javascript
import * as schemas from "validate.js";

const validator = schemas[MyRef];

const valid = validator(data);
```

**Validation result, data AFTER validation, error messages**

On Karma:
```
TypeError: Cannot read property 'test' of undefined
```

At Runtime:

```
TypeError: You provided 'null' where a stream was expected. You can provide an Observable, Promise, Array, or Iterable.
```

Both errors are raised by `validator(data);`

**What results did you expect?**

On 7.0.1 I have no errors at runtime, so this is a regression introduced with the latest version. Karma fails also with 7.0.1 but due to a different error (duplicated functions fixed with 7.0.2)

**Are you going to resolve the issue?**

The runtime error is pretty obscure but I tried to work around the error provided by karma.

the only 'test' property that I found in the validation functions is:

`if(!(formats2.test(data0))`

where formats2 is:

`const formats2 = {"_items":["require(\"ajv-formats/dist/formats\").",{"str":"fullFormats"},""]}.email;`

I verified with a console.log that formats2 is undefined

On the 7.0.1 this part works well and I noticed that formats2 is created with a different syntax:

`const formats2 = require("ajv-formats/dist/formats").fullFormats.email;`
