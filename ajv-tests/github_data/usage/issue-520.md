# [520] Missing error message after validation failed by missing required property

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
5.1.5


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
undefined


```


**JSON Schema**
```json
{
	"title": "Count Input",
	"type": "object",
	"properties": {
		"items": {
			"type": "array",
			"items": {
				"title": "Count Item",
				"type": "object",
				"properties": {
					"type": {
						"title": "Count Item Type",
						"type": "string"
					}
				},
				"required": [
					"type"
				]
			}
		}
	},
	"required": [
		"items"
	]
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{

	"items": [
		{"type": "MO"},
		{}
	]
}

```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const Ajv = require('ajv');
ajv = new Ajv();
validate = ajv.compile(schema);

if (!validate(data)) {
	console.log(ajv.errorsText());
}

```


**Validation result, data AFTER validation, error messages**

```
validate(data) == false && ajv.errorsText() == "No errors"

```

**What results did you expect?**

Meaningful error message (path of failing property) if validate returns false

**Are you going to resolve the issue?**

No