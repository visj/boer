# [539] Validation Fails for Type String when specifying Items with ref to object

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
5.2.0

**Ajv options object**



<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{ allErrors: true, v5: true, removeAdditional: true }

```


**JSON Schema**

```json
{
	"createBlock": {
		"additionalProperties": false,
		"type": "object",
		"properties": {
			"name":	{
				 "type": "string"
			},
			"blocks": {
				"type": "array",
				"items": {
					 "$ref": "#/definitions/blockObj"
				}
			}
		},
		"required": ["name", "blocks"]
	},
	"blockObj":{
		"type": "object",
		"properties": {
			"quantity": {
				"type": "integer"
			},
			"rate": {
				"type": "integer"
			},
			"id": {
				"type": "string",
				"not": "integer"
			}
		},
		"required": [ "quantity", "rate", "id"]
	}
}

```


**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json

 { "data": {
			"name": "Some random name",
			"blocks": [
				{"cj5458hyl0001zss42td3waww": {
					"quantity": "",
					"rate": 356.77,
					"id": "ewdwe4434"
				}},
				{"cj5458hyl0001zss42td3wawu": {
					"quantity": 4,
					"rate": 356.77,
					"id": "3434ewdwe4434"
				}}]
		}
 }

```
**Your code**
https://gist.github.com/ahlusar1989/0a077c5dc769ee15854b8bb97074d04b
<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript


```


**Validation result, data AFTER validation, error messages**

```
Valid is true

```

**What results did you expect?**

It should be false as the type indicated is string

**Are you going to resolve the issue?**
Not sure where to start 😄 . If need be I'll be happy to open a PR for the patch. 