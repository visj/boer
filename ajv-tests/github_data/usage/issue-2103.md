# [2103] schema as cache key not working

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I'm use v8.11.0

**Code to reproduce the bug**

```javascript
const Ajv = require("ajv");
const ajv = new Ajv();

const schema = {
  type: "object",
  properties: {
    foo: {type: "integer"},
    bar: {type: "string"}
  },
  required: ["foo"],
  additionalProperties: false
};

ajv.addSchema(schema).getSchema(schema);
```

This code throws the following error:

```text
Uncaught TypeError: id.replace is not a function
    at Function.normalizeId (/srv/git/ditsmod/ditsmod/node_modules/ajv/lib/compile/resolve.js:221:18)
    at _getSchemaObj (/srv/git/ditsmod/ditsmod/node_modules/ajv/lib/ajv.js:232:20)
    at Ajv.getSchema (/srv/git/ditsmod/ditsmod/node_modules/ajv/lib/ajv.js:202:19)
```

**What results did you expect?**

As the documentation says:

> Cache key: schema vs key vs $id
> In the example above, the key passed to the addSchema method was used to retrieve schemas from the cache. Other options are:
>
> ...
> use schema object itself as a key to the cache (it is possible, because Ajv uses Map). This approach is not recommended, because it would only work if you pass the same instance of the schema object that was passed to addSchema method - it is easy to make a mistake that would result in schema being compiled every time it is used.
[#](https://ajv.js.org/guide/managing-schemas.html#pre-adding-all-schemas-vs-adding-on-demand)

So I expect I can use schema as a key.

