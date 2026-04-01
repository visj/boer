# [1140] Coerce types in mixed arrays using anyOf takes the first one

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

latest

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{coerceTypes: 'array'}
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "type" : "object",
    "properties" : {
      "data": { 
        "type": "array", 
        	"items": { "anyOf": [{ "type": "integer" }, { "type": "string" }] }
        
       }
     }
  };
```

Repro link : https://jsfiddle.net/wdjz0u34/

for array
`["1", 2, "3"]`
I expect to get back
`["1", 2, "3"]`
But I get
`[1, 2, 3]`
or
`["1", "2", "3"]`
depends on the order of anyOf

