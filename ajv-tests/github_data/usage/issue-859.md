# [859] Remove unvalidated data

Hello,
I'm trying to remove unvalidated properties from the data during validation.
See sample input, validation schema and expected output to grasp what I'm trying to do.
I can only get it to remove additional properties which is not listed in the schema, or failing validations, but not validations which is not run.

So, is it possible somehow? 

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v6.5.3


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
	"valid-field": true,
	"unvalidated-field": true
}
```

**Sample schema i've tried**

```json
{
	"type": "object",
	"properties": {
		"valid-field": {
			"type": "boolean"
		}
	},
	"required": ["valid-field"],
	"if": {
		"properties": {
			"valid-field": {
				"const": false
			}
		}
	},
	"then": {
		"properties": {
			"unvalidated-field": {
				"type": "boolean"
			}
		},
		"required": ["unvalidated-field"]
	}
}
```

**Validation result I'm trying to get**

```json
{
	"valid-field": true,
}
```
