# [1711] A `$ref` to a fragment defined with `$id` in the same document isn't found.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Version: 8.6.2

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
new Ajv({
  allErrors: true
  schemas: { "yaml.json": schema } // see below
});
```

**JSON Schema**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "SeeAlso": { "$id": "#SeeAlso", "type": "number" },
    "Engine": {
      "$id": "#Engine",
      "type": "object",
      "properties": {
        "see_also": { "$ref": "#SeeAlso" }
      }
    }
  }
}
```

**Sample data**

```json
{
  "see_also": 1
}
```

**Your code**

```javascript
var Ajv = require('ajv');
var schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "SeeAlso": { "$id": "#SeeAlso", "type": "number" },
    "Engine": {
      "$id": "#Engine",
      "type": "object",
      "properties": {
        "see_also": { "$ref": "#SeeAlso" }
      }
    }
  }
};

var data = {
  see_also: 1
};

ajv = new Ajv({
    allErrors: true,
    schemas: {
      "yaml.json": schema
    }
});

var result = ajv.validate("yaml.json#/definitions/Engine", data);
console.log(result);
```

[View on runkit](https://runkit.com/rbuckton/60f9d3906738f8001aab8ca5)

**Validation result, data AFTER validation, error messages**

```
MissingRefError: can't resolve reference #SeeAlso from id yaml.json#Engine
```

**What results did you expect?**

As far as I can tell, it should be able to resolve fragment `#SeeAlso`, per https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-01#section-8.2.4 and https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-01#section-8.3.2.

**Are you going to resolve the issue?**

If I have some time I can put up a PR. If anyone else wants to take this on, my findings are below based on debugging ajv:

When the `$ref` keyword is evaluated for `{ "$ref": "#SeeAlso" }`, I end up here in _ref.js_:

![image](https://user-images.githubusercontent.com/3902892/126706975-cadc947b-94c7-445d-96f4-dba4cef82579.png "vocabularies/core/ref.js, line 19")

At this point, `baseId` is `yaml.json#Engine` and `$ref` is `#SeeAlso`.

When I step into `resolveRef`, the call to `resolveUrl` replaces `#SeeAlso` with `yaml.json#SeeAlso`:

![image](https://user-images.githubusercontent.com/3902892/126707282-1b3cf611-d0d2-402d-9f80-633b05d275c2.png "compile/index.js, line 130")

Since this isn't a root ref, I step through to line 136, where you might expect to resolve `#SeeAlso` against `root.localRefs`, however that fails because the fragment is qualified:

![image](https://user-images.githubusercontent.com/3902892/126707564-2176c1d7-9b86-4857-b423-a943ee93b6de.png "compile.index.js, line 136")

As you can see in the watch window, `root.localRefs` contains a definition for `#SeeAlso`, however the local ref can't be resolved because `ref` was changed from `"#SeeAlso"` to `"yaml.json#SeeAlso"`.

If this is *supposed* to work, then I expect the solution would be to check just the fragment (`#SeeAlso`) against `root.localRefs` (after ensuring that `ref` and `baseId` differ only by URL fragment).

I've run into this issue on and off for several years and have always worked around it by using `#/definitions/Foo`, but from what I can tell from reading the spec, this kind of `$ref` *should* work:

![image](https://user-images.githubusercontent.com/3902892/126708561-8daa68d4-9a3d-41b4-ae17-ebdeaab23d7e.png "json schema draft-07, example from page 15")
