# [686] Ignore $comment when used together with $ref

When `$ref` is used, no other keyword shall be used alongside it. That is enforced with the *extendRefs* option set to `"ignore"` or `"fail"`.

However, `$comment`s should be ignored by implementations. They are useful to give other developers additional knowledge about a property without affecting the schema.

Is it possible to change the behavior of the *extendRefs* option so that it will still warn / fail if other keywords except `$comment` are present alongside `$ref` but allow `$comment`?

---

**Example:** Here, the `$ref`s are rather used as a special type to avoid code duplication and the comments adds additional information.

```json
  ...
  "nonEmptySingleLineString": {
    "$id": "nonEmptySingleLineString",
    "type": "string",
    "pattern": "^[^\n]+$"
  },
  ...
  "name": {
    "$comment": "unique in file",
    "$ref": "nonEmptySingleLineString"
  },
  "shortName": {
    "$comment": "unique globally; if not set: name is used",
    "$ref": "nonEmptySingleLineString"
  },
  ...
```