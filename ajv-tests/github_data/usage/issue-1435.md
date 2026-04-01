# [1435] How to validate the array of string item with array property present in json.

Hi Team,
I want to validate the array of string item with array property present in a json. I am trying with enum keyword as mention below but not getting any solution. I want to validate the item, which is present in a enum array, if anyone enter the any value into the resultType array then error should be display. So can you guys tell me how to implement this in my project.
My schema :

```json
"properties": {
				"resultType": {
					"$id": "#root/ruleProperties/resultType", 
					"title": "Resulttype", 
					"type": "array",
					"default": [],
					"enum":["a","b","c"],
					"items":{
						"$id": "#root/ruleProperties/resultType/items", 
						"title": "Items", 
						"type": "string",
						"default": "",
						"examples": [
							"expression"
						],
						"pattern": "^.*$"
					}
				}
```

My array : resultType:["a","c"]
version :  "ajv": "^7.0.0"

Thanks !