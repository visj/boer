# [1145] loadSchema is called 2 times for the same refferenced schema

**UPDATED**:

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Version 6.10.2

**Ajv options object**
{
    loadSchema: loadExternalSchema
}

```javascript
function loadExternalSchema (uri) {
	return jQuery.ajax(uri)
	     .then(function (res) {
                        ...
			return res;
	    });
}

```


**JSON Schema**
````json
"allOf": [
	{ "$ref": "http://adaptivecards.io/schemas/adaptive-card.json#/definitions/AdaptiveCard" }
]
````

When trying to create Ajv instance, **loadSchema** function is being called 2 times for adaptive cards' schema.  I cannot afford to make 2 ajax calls for the same refferenced schema. How can I avoid that?




