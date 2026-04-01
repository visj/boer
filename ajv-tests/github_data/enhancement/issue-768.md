# [768] passContext is not used with "$ref" referenced schema

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

6.4.0, yes

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{ passContext: true }
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
	"$id": "https://www.example.com/schemas/resource.json",
	"type": "object",
	"properties": {
		"leaf": {
			"type": "string",
			"leaf": true
		},
		"resources": {
			"$ref": "resource.json"
		}
	}
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
	"leaf": "first",
	"resources": {
		"leaf": "second"
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
ajv.addKeyword('leaf', {
	type: 'string',
	validate: function(schema, data) {
	// for second leaf is false
        console.log(this && this.context === 'my-context')
        return true
    }
})

const validate = ajv.compile(schema)

validate.call({ context: 'my-context' }, {
    leaf: 'one',
    resources: {
        leaf: 'second'
    }
})

```


**What results did you expect?**

`this` from `validate.call(this, data)` === `this` from custom keyword function
in test is not true for schema referenced with `$ref`

**Are you going to resolve the issue?**
My guess is, in this line https://github.com/epoberezkin/ajv/blob/e88e5f53d71e11f94898fb9f7fe8bd0b0bd43692/lib/compile/index.js#L74

must be `this`, `var result = validate.apply(this, arguments);`