# [1240] additionalProperties considers properties with "undefined" value as additional

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.10.2

**Ajv options object**

```javascript
// empty
{} 
```

**JSON Schema**

```json
{
    "type": "object",
    "additionalProperties": false,
    "properties": {}
}
```

**Sample data**

The input is not a json but a javascript object with a key set to undefined, which is common when constructing objects with conditional fields:
```javascript
{ "a": undefined }
```


**Your code**

```javascript
const Ajv = require("ajv");
const ajv = new Ajv();
const v = ajv.compile({ type: "object", additionalProperties: false, properties: {} });
console.log(v({ a: undefined }), v.errors);
```

**Validation result, data AFTER validation, error messages**

```
$ node -p 'const Ajv = require("ajv"); const ajv = new Ajv(); const v = ajv.compile({ type: "object", additionalProperties: false, properties: {} }); console.log(v({ a: undefined }), v.errors)'
false [
  {
    keyword: 'additionalProperties',
    dataPath: '',
    schemaPath: '#/additionalProperties',
    params: { additionalProperty: 'a' },
    message: 'should NOT have additional properties'
  }
]
```

**What results did you expect?**

I was expecting keys which are undefined to be ignored by `additionalProperties: false`

**Are you going to resolve the issue?**
