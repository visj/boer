# [334] meta-schemas cannot be loaded asynchronously


**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv - 4.8.2

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
{
    loadSchema: function(uri, callback) {
        request(uri, function(err, res, body) {
          if (err || res.statusCode >= 400)
            callback(err || new Error('Loading error: ' + res.statusCode));
          else
            callback(null, JSON.parse(body));
        });
    }
}
```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
{
    "$schema": "http://json-schema.org/draft-04/hyper-schema#",
    "properties": {
        "links": {
            "type": "array",
            "items": {
                "$ref": "http://json-schema.org/draft-04/hyper-schema#/definitions/linkDescription"
            }
        }
    }
}
```


**Data (please make it as small as posssible to reproduce the issue):**

```json
{"links":[{"rel":"foo","href":"/foo"}]}
```


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
var request = require("request");
var Ajv = require('ajv');
var ajv = Ajv({
    loadSchema: function(uri, callback) {
        request(uri, function(err, res, body) {
          if (err || res.statusCode >= 400)
            callback(err || new Error('Loading error: ' + res.statusCode));
          else
            callback(null, JSON.parse(body));
        });
    }
});

var schema = {
    "$schema": "http://json-schema.org/draft-04/hyper-schema#",
    "properties": {
        "links": {
            "type": "array",
            "items": {
                "$ref": "http://json-schema.org/draft-04/hyper-schema#/definitions/linkDescription"
            }
        }
    }
};

ajv.compileAsync(schema, function(error, validate) {
  if (error) {
    console.log(error);
  } else {
    console.log('valid:', validate({"links":[{"rel":"foo","href":"/foo"}]}));
  };
});

```

https://runkit.com/lwhitaker/581b813da447b8001345f61f


I get this result:
```
Error: no schema with key or ref "http://json-schema.org/draft-04/hyper-schema#"
```

**What results did you expect?**

I expected the schema to be resolved.

**Are you going to resolve the issue?**

Sounds like you already have a fix for this coming in 5.0.