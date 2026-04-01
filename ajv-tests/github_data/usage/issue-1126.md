# [1126] Schema absolute / relative doesn't seem to work

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Using version `v6.10.2`



**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
const ajv = new Ajv({
	async: true
});
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
// schemas/requests/GET/organisations/organisationId.json

{
	"$id": "requests/GET/organisations/_organisationId",
	"$schema": "http://json-schema.org/draft-07/schema#",
	"type": "object",

	"properties": {
		"params": {
			"type": "object",
			"properties": {
				"organisationId": {
					"$ref": "/organisations/organisation#/id"
				}
			},
			"required": ["organisationId"]
		}
	},

	"required": ["params"]
}

// schemas/organisations/organisation.json
{
	"$id": "organisations/organisation",
	"$schema": "http://json-schema.org/draft-07/schema#",
	"type": "object",

	"properties": {
		"id": {
			"type": "string",
			"format": "uuid"
		}
	},

	"required": ["id"]
}

```


**Sample data**

```json
{
	"query": {},
	"params": {
		"organisationId": "a71b3aa2-c5c4-44b3-ba1b-fb5ab9659471"
	},
	"body": {}
}
```

**Your code**

```javascript
ajv.addSchema(require("./schemas/organisations/organisation"));
ajv.addSchema(require("./schemas/requests/GET/organisations/_organisationId"));

ajv.validate("requests/GET/organisations/_organisationId", {
	query: {},
	params: {
		organisationId: "a71b3aa2-c5c4-44b3-ba1b-fb5ab9659471"
	},
	body: {}
})
```

**Validation result, data AFTER validation, error messages**

```
{
    "message": "can't resolve reference /organisations/organisation#/id from id requests/GET/organisations/_organisationId#",
    "missingRef": "/organisations/organisation#/id",
    "missingSchema": "/organisations/organisation"
}
```

**What results did you expect?**

I expected Ajv to internally validate that a schema with ID `organisations/organisation` was added, and would use this to validate further. However, regardless of using `/organisations/organisation#/id` (with the leading `/`) or `organisations/organisation#/id` (without leading `/`), it does not seem to resolve in any way.

I thought it was possible to not use full URLs as `$id`. The reason for not wanting to include full URLs in my `$id` fields is that I run multiple environments that might have different versions of the schemas, but they all have a different URL (e.g. `https://schemas.domain.com` and `https://schemas.dev.domain.com`).

*Edit*
I have noticed that I got it working without specifying a domain for each `$id`, however, the error is misleading. While testing all the possible cases, the error seemed to indicate that the schema was not found, however, in some cases it was the part after the `#` that was the issue, while the schema could be resolved. Maybe it's worth improving the error?

**Are you going to resolve the issue?**

No