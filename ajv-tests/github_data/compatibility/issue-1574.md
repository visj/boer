# [1574] Cannot use AJV Formats, documentation incorrect.

Using the example code results in errors and simply does not work.

```
const Ajv = require("ajv")
const addFormats = require("ajv-formats")

const ajv = new Ajv()
addFormats(ajv)
```

The above code, from the documentation, does not work.

Both `const ajv = new Ajv()` and `addFormats(ajv)` produce an error "This expression is not constructable." 

Package versions:

```
    "ajv": "^8.2.0",
    "ajv-formats": "^2.0.2"
```

NB - I can get rid of one error, from `const ajv = new Ajv()` by add `.default` to the require statement, but `addFormats(ajv)` still errors.