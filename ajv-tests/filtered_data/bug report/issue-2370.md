# [2370] `oneOf` with coercion produces the wrong coerced value

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

TL;DR:

AJV coercion causes an input that matches a schema to be mutated to an input that does not match.

When using AJV with coercion, it will try to coerce to every type in a `oneOf` to ensure only one type matches. But after doing this for all types in the `oneOf` it does not restore the value to the (coerced) value of whatever the matched type was. My example below shows how a valid input is turned into an invalid input after validation with coercion.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

v8.12.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{
    allErrors: true,
    coerceTypes: 'array',
    strictSchema: false,
    formats: fullFormats,
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
                "test": {
                        "oneOf": [
                                { "const": null },
                                { "type": "string", "minLength": 1 }
                        ]
                }
        }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{ "test": null }
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

```javascript
const Ajv = require('ajv');

const ajv = new Ajv({allErrors:true,coerceTypes:'array',strictSchema:false})

const schema = {
	"$schema": "http://json-schema.org/draft-07/schema#",
	"type": "object",
	"properties": {
		"test": {
			"oneOf": [
				{ "const": null },
				{ "type": "string", minLength: 1 }
			]
		}
	}
};

const validator = ajv.compile(schema);

const input1 = { "test": null };
const input2 = { "test": "test" };

const result1 = validator(input1);
const result2 = validator(input2);

console.log(result1, input1);
console.log(result2, input2);

```

**Validation result, data AFTER validation, error messages**

```javascript
// $ node test.js
true { test: '' } // this no longer matches the schema!
true { test: 'test' }
```

**What results did you expect?**

``javascript
// $ node test.js
true { test: null }
true { test: 'test' }
``

**Are you going to resolve the issue?**
I can try