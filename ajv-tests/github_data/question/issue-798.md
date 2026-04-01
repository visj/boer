# [798] additionalProperties/removeAdditional not working with "select"

**Ajv version: 6.5.0**

**Ajv options**

```javascript
{
	format:'full',
	logger:false,
	removeAdditional:true
}
```

**JSON Schema**

```json
{
	"type":"object",
	"properties":{
		"to_contacts":{
			"type":"array",
			"items":{
				"type":"object",
				"additionalProperties":false,
				"properties":{
					"type":{
						"type":"string",
						"enum":[
							"channel",
							"user"
						]
					},
					"contact_id":{
						"type":"string",
						"minLength":1,
						"maxLength":60
					},
					"channel_id":{
						"type":"string",
						"minLength":1,
						"maxLength":30
					},
					"user_id":{
						"type":"string",
						"minLength":1,
						"maxLength":30
					}
				},
				"select":{
					"$data":"0/type"
				},
				"selectCases":{
					"channel":{
						"required":[
							"type",
							"contact_id",
							"channel_id"
						]
					},
					"user":{
						"required":[
							"type",
							"contact_id",
							"user_id"
						]
					}
				},
				"selectDefault":false
			},
			"minItems":1
		}
	}
}
```

**Sample data**

```json
{
      "to_contacts":[
		{
			"type":"user",
			"contact_id":"reGuyGMB8hHdr1KUjhRc",
			"user_id":"U9RQJQHJ9",
			"removethisproperty":"anyvalue"
		}
	]
}
```

**Output**

```
{
      "to_contacts":[
		{
			"type":"user",
			"contact_id":"reGuyGMB8hHdr1KUjhRc",
			"user_id":"U9RQJQHJ9",
			"removethisproperty":"anyvalue"
		}
	]
}
```

Am I missing something here or Ajv is not removing additional properties when **select** is used?