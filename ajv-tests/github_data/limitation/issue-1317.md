# [1317] Duplicate `$id`s within the same document passes schema validation...

hey there :wave:

i'm guessing i'm missing something 🤗 - the docs say:

>You cannot have the same $id (or the schema identifier) used for more than one schema - the exception will be thrown

([source](https://github.com/ajv-validator/ajv#combining-schemas-with-ref))

...but assigning the same `$id` to different schemas (within the same document) passes schema validation. 


**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`v6.12.6`, yes


**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript
{
	allErrors: true,
	useDefaults: true,
	extendRefs: 'fail',
	missingRefs: 'fail',
	strictNumbers: true,
	strictDefaults: true,
	strictKeywords: true,
	unknownFormats: true,
	validateSchema: true,
	removeAdditional: 'all'
}
```

**JSON Schema**

```json
{
    "$schema": "https://particle.io/draft-07/schema#",
    "$id": "http://example.com/example.json",
    "type": "object",
    "title": "Fake Custom Schema",
    "description": "A customized JSON schema for testing",
    "properties": {
        "foo": {
            "$id": "#/nope",
            "type": "integer"
        },
        "bar": {
            "$id": "#/nope",
            "type": "string"
        }
    }
}
```

**Sample data**

```json
{
    "foo": 1,
    "bar": "ok"
}
```

**Your code**

```javascript
const ajv = new AJV({
    allErrors: true,
    useDefaults: true,
    extendRefs: 'fail',
    missingRefs: 'fail',
    strictNumbers: true,
    strictDefaults: true,
    strictKeywords: true,
    unknownFormats: true,
    validateSchema: true
});

if (!ajv.validateSchema(schema)){
    throw new Error('Invalid schema!');
}
```

**What results did you expect?**

i expected my schema to be considered invalid and an error to be throw - `Error: Invalid schema!`

