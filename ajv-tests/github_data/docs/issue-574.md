# [574] Compiling when using separate definition files

Hello.
Given this local directory structure (that is, the files are in the same directory) on my server:
```
<schema>
   schema.json
   definitions.json
```
...with definitions.json containing definitions referenced by schema.json, could you tell me the way to **compile** this pair both synchronously and asynchronously? (To date, I've only been compiling a single schema file, but now I'd like to break common things out into the separate definitions.json file.)

And, if definitions.json looked like this:
```
{
	"$schema": "http://json-schema.org/draft-04/schema#",
	"id": "definitions.json",
	"definitions": {
		"stringMinOne": {
			"type": "string",
			"minLength": 1
		}
	}
}
```
...would a property in my schema.json that references the above look like the following?

```
"urlId": {"$ref": "definitions.json#/definitions/stringMinOne"}
```
Thank you.
-Allan