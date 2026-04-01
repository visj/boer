# [2505] uri check fails

Ajv reports a validation error for a valid uri string.

URI: `https://hi.wikipedia.org/wiki/जर्मनी`
Validation error text: `data must match format "uri"`

I know e.g. `नी` is not ASCII and RFC 3086 does not define the use of other characters. Nethertheless it is a valid url and
shouldn't the strings representing an URL be u subset of the strings representing an URI?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
ajv version: 8.17.1 (latest version)

**Ajv options object**
```
{
  allErrors: true, 
  strictSchema: true
}
```

**JSON Schema**
```
{
    "type": "string",
    "format": "uri"
}
```

**Sample data**

```
"https://hi.wikipedia.org/wiki/जर्मनी"
```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```
import Ajv from "ajv";
const addFormats = require("ajv-formats");
const ajv = new Ajv(options);
const validResult = ajv.validate(schema, data);
const errors = ajv.errors;
const message = ajv.errorsText(ajv.errors);
```

**Validation result, data AFTER validation, error messages**

```
validationResult: false

errors: [{
    "instancePath": "",
    "schemaPath": "#/format",
    "keyword": "format",
    "params": {
        "format":"uri"
    },
    "message": "must match format \"uri\""
}]

message: data must match format "uri"
```

**What results did you expect?**

```
validationResult: true

errors: null

message: No errors
```
