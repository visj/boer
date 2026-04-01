# [282] Add allowedValues to params of error for "enum" keyword

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

I know that using verbose will show the enum values, but it is bloated with unnecessary information (especially for validating required properties).  I have to make due with limited bandwith and processing power and do not want to waste them by enabling verbose mode (in the environment I am using, a request that fails validation in verbose mode can take up to 5 seconds for an object with 15 primitive properties).

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Version: 4.5.0
It is the latest version.

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

``` javascript
{
    allErrors: true,
    verbose: false
}
```

**JSON Schema (please make it as small as possible to reproduce the issue):**

``` json
{
    "type": "string",
    "enum": [
        "yes", "no"
    ]
}
```

**Data (please make it as small as posssible to reproduce the issue):**

``` json
"maybe"
```

**Your code (please use `options`, `schema` and `data` as variables):**

``` javascript

const ajv = new Ajv(options);

const valid = ajv.validate(schema, data);

if (!valid) {
    // send ajv.errors to the client
}
```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->

**Error messages:**

``` json
[
    {
        "keyword": "enum",
        "dataPath": "",
        "schemaPath": "#/enum",
        "params": {},
        "message": "should be equal to one of the allowed values"
    }
]
```

**What results did you expect?**

An indication about the possible enum values.

i.e.:

``` json
[
    {
        "keyword": "enum",
        "dataPath": "",
        "schemaPath": "#/enum",
        "params": {},
        "allowedValues": [
            "yes",
            "no"
        ],
        "message": "should be equal to one of the allowed values"
    }
]
```

**Are you going to resolve the issue?**

I might if the client for which I am using this library personnally requests it.
