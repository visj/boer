# [904] Update draft-04 meta-schema

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`6.6.1` and I am using the latest version

**Ajv options object**

```javascript
{schemaId: 'id', verbose: true, allErrors: true, jsonPointers: true};

```

**JSON Schema**
```json
{
  "id": "https://example.com/example.json#",
  "$schema": "http://json-schema.org/draft-04/schema#",
  "description": "Some description",
  "type": "object",
  "required": [
    "id"
  ],
  "properties": {
    "id": {
      "type": "string",
      "description": "some id."
    },
    "foo": {
      "type": "array",
      "description": "some foos",
      "items": {
        "$ref": "http://json-schema.org/draft-04/schema#"
      }
    }
  }
}
```


**Sample data**
```json
{
  "id": "dataId",
  "description": "data description",
  "foo": [
    {
      "id": "dataSchema0",
      "title": "string typed title",
      "type": "object"
    }
  ]
}
```


**Your code**

```javascript
var ajvTest = function () {
  var ajv = new Ajv({schemaId: 'id', verbose: true, allErrors: true, jsonPointers: true});
  ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

  var schema = {
    "id": "https://example.com/example.json#",
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "Some description",
    "type": "object",
    "required": [
      "id"
    ],
    "properties": {
      "id": {
        "type": "string",
        "description": "some id."
      },
      "foo": {
        "type": "array",
        "description": "some foos",
        "items": {
          "$ref": "http://json-schema.org/draft-04/schema#"
        }
      }
    }
  };

  var validate = ajv.compile(schema);
  var data = {
    "id": "dataId",
    "description": "data description",
    "foo": [
      {
        "id": "dataSchema0",
        "title": "string typed title",
        // note: if I change the value to be an object I will get another error.
        // because "title" property is defined to be "string" typed in the reference schema file
        "type": "object"
      }
    ]
  };

  console.log('running test');
  var valid = validate(data);
  if (!valid) {
    console.log(validate.errors);
  }
}

ajvTest();

```


**Validation result, data AFTER validation, error messages**
console output:
```
schema $id ignored http://json-schema.org/draft-07/schema#
schema $id ignored http://json-schema.org/draft-07/schema#
schema $id ignored http://json-schema.org/draft-07/schema#
[ { keyword: 'format',
    dataPath: '/schemas/0/id',
    schemaPath: '#/properties/id/format',
    params: { format: 'uri' },
    message: 'should match format "uri"',
    schema: 'uri',
    parentSchema: { type: 'string', format: 'uri' },
    data: 'dataSchema0' } ]
```

**What results did you expect?**

from `http://json-schema.org/draft-04/schema#`: (omitting other properties)
```json
  "properties": {
    "id": {
        "type": "string"
    }
  }
```
`id` field does not have to be 'uri' format but somehow `format: 'uri'` is used at runtime. 
I'm expecting the data in the example to pass the validation without errors.


**Are you going to resolve the issue?**

No