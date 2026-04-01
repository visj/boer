# [1048] Custom keyword does not resolve $data reference when it's inside an object.

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.0


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{
	$data: true
}

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
   "type": "object",
   "properties": {
      "someone": {
         "type": "string"
      },
      "something": {
         "type": "string",
         "dependsOnData": {
            "some": "keyword",
            "related": "things",
            "depends": {
               "$data": "/someone"
            }
         }
      }
   }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
	"someone": "someone here",
	"something": "something here"
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
ajv.addKeyword("dependsOnData", {
	$data: true,
	validate: (keywordSchema, value) => {
		console.log(keywordSchema.depends); // --> { $data: "/someone" }
		return true;
	}
});
```


**Validation result, data AFTER validation, error messages**

`keywordSchema.depends` is a `$data` pointer and is never resolved.

**What results did you expect?**
Expected `keywordSchema.depends` to resolve to the value: `someone here`

In the docs, there's a mention:
> If the keyword has meta-schema it would be extended to allow $data and it will be used to validate the resolved value.

So I also tried the giving metaSchema to keyword definition:

```javascript
ajv.addKeyword("dependsOnData", {
	$data: true,
	metaSchema: {
		type: "object",
		properties: {
			some: {
				type: "string"
			},
			related: {
				type: "string"
			},
			depends: {
				type: "string"
			},
		}
	},
	validate: (keywordSchema, value) => {
		console.log(keywordSchema.depends); // --> { $data: "/someone" }
		return true;
	}
});
```
But then the error is thrown:
> keyword schema is invalid: data.depends should be string, data should NOT have additional properties, data should match some schema in anyOf

**Are you going to resolve the issue?**
No