# [703] `anyOf`/`oneOf` with recursive schemas causes out of memory exception

I'm using the latest version of ajv:

```js
new Ajv({ allErrors: true })
```

Essentially it seems there's a huge inefficiency _somewhere_ when dealing with recursive schemas.

I have a fairly large schema so I'm unable to extract an example of this happening (I'll keep trying to narrow it down). But essentially I have something along the lines of:

```json
{
  "anyOf": [ { "$ref": "#/definitions/generic" } ],
  "definitions": {
    "generic": {
      "type": "object",
      "anyOf": [
        { "$ref": "#/definitions/model1" },
        { "$ref": "#/definitions/model2" }
      ]
    },
    "genericChildren": {
      "type": "array",
      "items": { "$ref": "#/definitions/generic" },
      "additionalItems": false
    },
    "model1": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [ "model1" ]
        },
        "model1_a": { "type": "string" },
        "model1_b": { "type": "string" },
        "children": { "$ref": "#/definitions/genericChildren" }
      },
      "required": [ "type" ],
      "additionalProperties": false
    },
    "model2": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [ "model2" ]
        },
        "children": { "$ref": "#/definitions/genericChildren" }
      },
      "required": [ "type" ],
      "additionalProperties": false
    }
  }
}
```

If you have data like:

```json
{
  "type": "model1",
  "model1_a": "foo",
  "model1_b": "bar",
  "children": [
    {
      "type": "model2",
      "non-existent-property": null
    }
  ]
}
```

As you can see, `model2` will be invalid, as expected. Because `additionalProperties` is false.

This _does_ validate correctly (assuming what I wrote above off the top of my head is syntactically correct).

_However_, it produces a huge amount of errors internally. In my case, I get 2,900+ errors. This seems directly proportional to how many schemas exist in the `anyOf` of `generic`.

In cases where I have a large object, deeply nested, I often get 1 million or more errors from ajv. Most of these errors look like duplicates or at least very similar to each other.

I've stepped through ajv's generated code for some time now and didn't really get anywhere of use. All I found out was:

- If an object is invalid, it will have the sum of all errors from all `anyOf` entries (which is already a lot, but not the thousands I saw)
- The parent will no longer match any entries of the `anyOf` (due to its `children` not being matched either), so it too generates the same amount of errors, if not more
- Using `oneOf` causes performance to decrease massively because, unlike `anyOf`, it won't quit early once it matches
- Even if an object matches one of the `anyOf` entries, it seems it will produce errors for all other entries (even if they may not be used in the end)

**This causes node to throw an out of memory exception due to the max heap size being reached**. In the browser, it will crash the page (along with dev tools). Essentially the `vErrors` array grows to such a large size that it can use 2GB+ of memory in my case.

