# [534] Can't resolve reference inside a schema to an external .json file on a server

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->
I have the following problem:
I want to build an Angular 2 service that loads json schemes from a server by simple http-get calls and stores them in json objects. These objects should then be added to the ajv instance to being able to perform a validation.
My json schema api on the server side is structured in a folder with all top level json schemes and a folder next to these top level schemes, with all the referenced definitions:

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I use json-schema-draft-04

**Ajv options object**

```javascript
this.ajvInstance = new Ajv( {
      meta: false,
      extendRefs: true,
      unknownFormats: 'ignore',
      allErrors: true
    });

```


**JSON Schema**

```json
{
  "$id":          "http://url/to/folder/getPlan_V0.json",
  "title":        "getPlan_V0.0.6",
  "$schema":      "http://json-schema.org/draft-04/schema#",
  "type":         "object",
  "properties": {
    "session_id": {
      "$ref": "definitions/session_id_V0.json"
    },
    "barcode": {
      "$ref": "definitions/barcode_V0.json"
    }
  },
  "additionalProperties": false,
  "required": [ "session_id", "barcode" ]
}

```
The file session_id_V0.json is in a separate folder next to getPlan_V0.json:

```json
{
  "title":        "session_id_V0.0.2",
  "$schema":      "http://json-schema.org/draft-04/schema#",
  "type":         "string",
  "minLength":    32,
  "maxLength":    32
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json


```


**Your code**
The 2 schemes are already stored as json objects in the two variables given to .addSchema

```javascript
let metaSchema = require( 'ajv/lib/refs/json-schema-draft-04.json' );
    this.ajvInstance.addMetaSchema( metaSchema );
    this.ajvInstance._opts.defaultMeta = metaSchema.id;
    this.ajvInstance.addSchema( this.json_schemes.getPlan_V0, 'getPlan_V0' );
    this.ajvInstance.addSchema( this.json_schemes_definitions.session_id_V0, 'session_id_V0.json' );

let valid = this.ajvInstance.validate( schema, object_to_validate );

    if( valid ) {
      returnValue = true;
    } else {
      returnValue = false;
    }
```


**Validation result, data AFTER validation, error messages**

```
Error: can't resolve reference definitions/session_id_V0.json from id http://url/to/folder/getPlan_V0.json#

```

**What results did you expect?**
I expected valid to not being true, as the object_to_validate is not of the tested type.

**Are you going to resolve the issue?**
