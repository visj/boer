# [1074] Resolve JSON Reference in instance

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What problem do you want to solve?**
I am using JSON References as defined by [draft-pbryan-zyp-json-ref-03](https://tools.ietf.org/html/draft-pbryan-zyp-json-ref-03) in my instances. Though it isn't directly related to JSON Schema, it is relevant to the validation strategy.

With the schema:


```js
{
  "properties": {
    "prop": { "type": "string" }
  }
}
```

I would want this instance to pass,

```js
{ "prop": { "$ref": "https://jsonplaceholder.typicode.com/todos/1#/title" } }
```

and this to fail

```js
{ "prop": { "$ref": "https://jsonplaceholder.typicode.com/todos/1#/completed" } }
```
**What do you think is the correct solution to problem?**

It seems similar to the `useDefaults` and `coerceTypes` options, in that it deviates from JSON Schema to facilitate users of the library, so adding an `resolveRefs` option that enables this behavior wouldn't be unreasonable.

However, a more useful option may be a `visit` callback (disabled by default), which would be called at every node of the input data (And the node of the schema that will be used to validate it?), and 

```js
const { parse } = require("jsonref")

const ajv = new Ajv({
  async visit(parent, key) {
    let node = parent[key]
    const keys = Object.keys(node)
    if (keys.length === 1 && keys[0]  === "$ref")
      parent[key] = node = await parse(node.$ref, {
        retriever(url) {
          return fetch(url).then(res => res.json());
        }
      })
    return node
  }
})
const validate = ajv.compile(schema)
if (!validate(data)) console.error(validate.errors)
```

**Will you be able to implement it?**
Assuming it isn't incompatible with the current internals, I'm happy to make a PR