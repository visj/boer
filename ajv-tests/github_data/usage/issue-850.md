# [850] Additional information in error message missing.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Latest

**Ajv options object**
{schemaId: 'auto',extendRefs:'ignore',missingRefs:'ignore',validateSchema:false,allErrors:false};

```javascript
var options = {schemaId: 'auto',extendRefs:'ignore',missingRefs:'ignore',validateSchema:false,allErrors:false};
var editor = new Ajv(options);
var validate = editor.compile(jsonSchema);
validate(parsedJson);
return validate.errors;			

```


**JSON Schema**
```json
{
				"$schema" : "http://json-schema.org/draft-06/schema#",
				"title" : "createServiceInstance",
				"type" : "object",
				"additionalProperties" : false,
				"properties" : {
					"Volume ID" : {
						"type" : "string",
						"description" : "Please provide the Id of the volume from which new vm must be created. Specify either a Volume Id or Backup Name."
					},
					"Backup Name" : {
						"type" : "string",
						"pattern" : "^[a-zA-Z0-9]+$",
						"description" : "Provide the name of the snapshot from which new vm must be created. Specify either a Volume Id or Backup Name.",
						"default" : "DefaultBackup"
					},
					"ports" : {
						"type" : "string",
						"pattern" : "^[ ]*[1-9][0-9]{0,4}([ ]*-[ ]*[1-9][0-9]{0,4})?([ ]*,[ ]*[1-9][0-9]{0,4}([ ]*-[ ]*[1-9][0-9]{0,4})?)*[ ]*$",
						"description" : "Specify a comma seperated list of ports which are to be opened on the vm. Ex 3000, 4000-4010"
					}
				},
				"dependencies" : {
					"Volume ID" : {
						"not" : {
							"required" : [ "Backup Name" ]
						}
					}
				},
				"required" : [ "ports"]
			}
```

**Sample data**
{
  "Volume ID" : "abc" , "Backup Name" : "pqr"
}

**Your code**
https://runkit.com/anirkulk/ajv-issue

**Validation result, data AFTER validation, error messages**
[{"keyword":"not","dataPath":"","schemaPath":"#/dependencies/Volume%20ID/not","params":{},"message":"should NOT be valid"}]

**What results did you expect?**
The "params" property of the error message object also indicates the properties of the schema that are in error condition i.e. also indicate "Volume ID" and "Backup Name" in this example.

**Are you going to resolve the issue?**
