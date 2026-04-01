# [538] oneOf for alternate sets of properties not working

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
5.1.5 not sure what latest version does.


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript


```


**JSON Schema Snippet**

    "ProtoInstance": {
      "type": "object",
      "additionalProperties": false,
      "oneOf": [
        {
          "type": "object",
          "properties": {
            "@USE": {
              "type": "string"
            }
          },
          "required": [
            "@USE"
          ],
          "additionalProperties": false
        },
        {
			"type": "object",
			"properties": {
				"@DEF": {
					"type": "string"
				},
				"@name": {
					"type": "string"
				},
				"fieldValue": {
					"$ref": "#/definitions/fieldValue"
				},
				"IS": {
					"$ref": "#/definitions/IS"
				},
				"-children": {
					"type": "array",
					"minItems": 1,
					"items": {
						"type": "object",
						"properties": {
							"#comment": {
								"type": "string"
							}
						},
						"additionalProperties": false
					}
				},
				"-metadata": {
					"$ref": "#/definitions/-metadata"
				}
			},
			"required": [
				"@name"
			],
			"additionalProperties": false
		}
	]
    },

```json


```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json


               { "ProtoInstance":
                  {
                    "@name":"f",
                    "@DEF":"kl"
                  }
                }

```

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


```


**Validation result, data AFTER validation, error messages**

```
keyword: additionalProperties
 dataPath: X3D > Scene > -children > 25 > Group > -children > 5 > ProtoInstance
 value: {"@name":"f","@DEF":"kl"}
 message: should not have additional properties
 params: {"additionalProperty":"@name"}
 file: ../Examples/VRMLBanner/vrmlbanner.json
 version: 3.3


 keyword: additionalProperties
 dataPath: X3D > Scene > -children > 25 > Group > -children > 5 > ProtoInstance
 value: {"@name":"f","@DEF":"kl"}
 message: should not have additional properties
 params: {"additionalProperty":"@DEF"}
 file: ../Examples/VRMLBanner/vrmlbanner.json
 version: 3.3


```

**What results did you expect?**

valid.  ajv doesn't seem to be picking up the second array element in the oneOf array,   I am not sure if the schema is valid draft-04 or not.  If more recent metaschema passes or supports oneOf better, let me know.

**Are you going to resolve the issue?**

Not yet.  Waiting to find out if the schema is valid.  should type be oneOf?