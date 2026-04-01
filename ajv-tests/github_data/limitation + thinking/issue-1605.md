# [1605] Schema validation does not always fail when using custom meta schema

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.3.0

**Ajv options object**


```javascript
{}
```

**JSON Schema**
```json
{
	"$schema": "http://Custom",
	"type": "object",
	"properties": {
		"foo": { "oneOf": [
			{"type": "string"}, 
			{"type": "number"}
		]}
	}
}
```

**Sample data**
```json
{"foo": "abc"}
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
const meta = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "http://Custom",
  "title": "Custom",
  "definitions": {
    "simpleTypes": {
      "enum": ["array", "boolean", "integer", "null", "number", "object", "string"]
    },
    "stringArray": {
      "type": "array",
      "items": {"type": "string"},
      "uniqueItems": true,
      "default": []
    }
  },
  "type": ["object", "boolean"],
  "properties": {
    "$schema": {
      "type": "string",
      "format": "uri"
    },
    "default": true,
    "additionalProperties": {"$ref": "#"},
    "properties": {
      "type": "object",
      "additionalProperties": {"$ref": "#"},
      "default": {}
    },
    "type": {
      "anyOf": [
        {"$ref": "#/definitions/simpleTypes"},
        {
          "type": "array",
          "items": {"$ref": "#/definitions/simpleTypes"},
          "minItems": 1,
          "uniqueItems": true
        }
      ]
    },
    "format": {"type": "string"},
  },
  "additionalProperties": false, // added
  "default": true
};

ajv.addMetaSchema(meta);

const compileAndValidate = () => {
	try 
	{
		var validate = ajv.compile(schema);

		console.log(validate(data));
		console.log(validate.errors);
	} 
	catch (e) {
		console.error(e);
	}
}
console.log("first run");
compileAndValidate();
console.log("second run");
compileAndValidate();
```
http://runkit.com/remyblok/ajv-issue-custom-schema-validation-issue

**Validation result, data AFTER validation, error messages**

```
"first run"
Error: schema is invalid: data/properties/foo must NOT have additional properties
"second run"
true
null
```

**What results did you expect?**
I'm trying to make a custom schema based on the default draft-7 schema, but without complex features, like oneOf, anyOf etc. So the schema *should* fail validation. I expect the validation of the schema to always fail if it is invalid according to the meta schema.

**Are you going to resolve the issue?**
I've traced the error back to premature caching of the schema in _addSchema(). The schema is cached here:
https://github.com/ajv-validator/ajv/blob/df964e43cbd10cf16c1ee07a71c0c6a2698f10d2/lib/core.ts#L684
But the schema is validated after that at: https://github.com/ajv-validator/ajv/blob/df964e43cbd10cf16c1ee07a71c0c6a2698f10d2/lib/core.ts#L690
The second time it just gets the cached schema without validation.
I'm not sure if I can just move the cache to after the validate?