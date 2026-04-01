# [468] more than 2 patch calls gives an error about `add`

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
ajv: 5.0.0
ajv-cli: 2.0.0
ajv-merge: 3.0.0

**JSON Schema**



```json
{
    "$schema": "http://json-schema.org/draft-06/schema#",
    "$id": "example.json#",
	"type": "object",
	"properties": {
		"anObject": {
			"$patch": {
				"source": {
					"$ref": "#/definitions/C",
					"additionalProperties": false
				},
				"with": []
			}
		}
	},
	"definitions": {
		"A": {
			"type": "object",
			"properties": {
				"item1": {
					"type": "string"
				}
			},
			"additionalProperties": false,
			"required": ["item1"]
		},
		"B": {
			"$patch": {
				"source": {
					"$ref": "#/definitions/A"
				},
				"with": [{
					"op": "add",
					"path": "/properties/item2",
					"value": {
						"type": "string"
					}
				}]
			},
			"required": ["item2"]
		},
		"C": {
			"$patch": {
				"source": {
					"$ref": "#/definitions/B"
				},
				"with": [{
					"op": "add",
					"path": "/properties/item3",
					"value": {
						"type": "string"
					}
				}]
			},
			"required": ["item3"]
		}
	}
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
    "thing": {
        "item1": "item1",
        "item2": "item2"
    }
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

```bash
ajv -s schema -d instance --all-errors -c ajv-merge-patch
```


**Validation result, data AFTER validation, error messages**

```
schema example is invalid
error: Cannot perform an `add` operation at the desired path

```

**What results did you expect?**
$patch is applied recursively