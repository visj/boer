# [423] Fails to find and validate schemas that are defined as a $ref by URN

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->
## The code is available on runkit:
https://runkit.com/sondrele/58a88642b5e12e0013c5bf15

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
4.11.2 (also tested on 5.0.2-beta.0)


**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
var Ajv = require('ajv@4.11.2');
ajv = new Ajv({
    v5: true,
    allErrors: true,
    errorDataPath: 'property',
    verbose: true,
    missingRefs: "fail",
    unknownFormats: 'ignore',
    multipleOfPrecision: 12,
    extendRefs: true,
    passContext: true,
    i18n: false
});

```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
var schema = {
    "type": "object",
    "properties": {
        "ip1": {
            "id": "urn:some:ip:prop",
            "type": "string",
            "format": "ipv4"
        },
        "ip2": {
            "$ref": "urn:some:ip:prop"
        }
    },
    "required": [ 
        "ip1", 
        "ip2"
    ]
};

```


**Data (please make it as small as posssible to reproduce the issue):**

```json

var data = {
    "ip1": "0.0.0.0",
    "ip2": "0.0.0.0"
};


```


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
console.log(ajv.validate(schema, data));

```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->


**Validation result, data AFTER validation, error messages:**

```
false

```

**What results did you expect?**
I had expected the data to be successfully validated, instead the validation ends with the error message `"can't resolve reference urn:some:ip:prop from id #"`.

It seams like there might be a problem with the `id` being encoded as URN's, because the validation will succeed if we change the `"id": "urn:some:ip:prop"` to e.g. `"id": "urn:some/ip:prop"` (notice that I've only replaced the second `:` with a `/`).

When I'm looking at the object that keeps references to the internal schemas, I can see that the key for the `ip1` schema gets translated to `urn:some/ip:prop`, so that when ajv tries to validate `ip2` it fails to find the schema by it's original id.
It looks like the id's of the schemas might be treated like URL's instead of URN's, but I can't say this for sure. 
