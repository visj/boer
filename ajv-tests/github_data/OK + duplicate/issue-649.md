# [649] remove-additional on schema with allOf fails

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
ajv-cli@2.1.0


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```
fails> ajv -s bug.schema.json -d bug.test.json --remove-additional=all 
works> ajv -s bug.schema.json -d bug.test.json
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
	"$schema": "http://json-schema.org/draft-06/schema#",
	"id": "file:///bug.schema.json",
	"definitions": {
		"A": {
			"type": "object",
			"properties": {
				"a": {
					"type": "number"
				}
			},
			"required": [
				"a"
			]
		},
		"B": {
			"type": "object",
			"properties": {
				"b": {
					"type": "number"
				}
			},
			"required": [
				"b"
			]
		}
	},
	"type": "object",
	"allOf": [
		{
			"$ref": "#/definitions/A"
		},
		{
			"$ref": "#/definitions/B"
		}
	]
}


```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json

{ "a": 1, "b": 2 }
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

```
Command Line:
fails> ajv -s bug.schema.json -d bug.test.json --remove-additional=all 
works> ajv -s bug.schema.json -d bug.test.json

```


**Validation result, data AFTER validation, error messages**

```
bug.test.json invalid
[ { keyword: 'required',
    dataPath: '',
    schemaPath: '#/definitions/B/required',
    params: { missingProperty: 'b' },
    message: 'should have required property \'b\'' } ]

```

**What results did you expect?**
bug.test.json valid

**Are you going to resolve the issue?**
No