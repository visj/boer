# [474] strange choice of default values and validation fail

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
I tested both on 4.x and 5.0.0


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
allErrors: true,
removeAdditional: true,
useDefaults: true,
verbose: true
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
	"$schema": "http://json-schema.org/draft-06/schema#",
	"type": "object",
	"additionalProperties": false,
	"properties": {
		"graphs": {
			"type": "array",
			"default": [],
			"items": {
				"oneOf": [
					{ "$ref": "#/definitions/natures/throughput" },
					{ "$ref": "#/definitions/natures/histogram" },
					{ "$ref": "#/definitions/natures/marker" }
				]
			}
		}
	},
	"required": ["graphs"],
	"definitions": {
		"color_scale": {
			"_comment": "Only for histograms",
			"type": "string",
			"enum": ["absolute", "relative", "ranked"],
			"default": "absolute"
		},
		"nature": {
			"type": "string",
			"enum": ["throughput", "histogram", "marker"],
			"default": "throughput"
		},
		"natures": {
			"throughput": {
				"type": "object",
				"additionalProperties": false,
				"properties": {
					"kurwa": {
						"type": "string",
						"default": "2"
					},
					"nature": {
						"type": "string",
						"const": "throughput"
					}
				},
				"required": ["nature"]
			},
			"histogram": {
				"type": "object",
				"additionalProperties": false,
				"properties": {
					"kurwa": {
						"type": "string",
						"default": "1"
					},
					"color_scale": { "$ref": "#/definitions/color_scale" },
					"nature": {
						"type": "string",
						"const": "histogram"
					}
				},
				"required": ["color_scale", "nature"]
			},
			"marker": {
				"type": "object",
				"additionalProperties": false,
				"properties": {
					"kurwa": {
						"type": "string",
						"default": "3"
					},
					"nature": {
						"type": "string",
						"const": "marker"
					}
				},
				"required": ["nature"]
			}
		}
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

```javascript

var validateInstructions = ajv.compile(schema);

var case1 = {
	graphs: [{
		color_scale: 'absolute',
		nature: 'histogram'
	}]
};
let valid1 = validateInstructions(case1);
console.log(case1, validateInstructions.errors);// fails, and kurwa=1

var case2 = {
	graphs: [{
		nature: 'marker'
	}]
};
let valid2 = validateInstructions(case2);
console.log(case2, validateInstructions.errors);// works, and kurwa=1 too
```



**What results did you expect?**
I expect AJV to validate both case1 and case2 successfully. Also I expect case2.graphs[0].kurwa == 3 (not 1)
