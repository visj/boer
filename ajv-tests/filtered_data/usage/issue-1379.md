# [1379] Unicode escapes in regex patterns are marked invalid as of Ajv v7

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v7.0.3, yes.

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

All options are default, `ajv-formats` added the the `avj` instance.

**JSON Schema**

```json
{
  "$id": "http://example.com/util/myschema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Example",
  "type": "string",
  "pattern": "\\x{00a1}"
}
```

**Sample data**
Not relevant.

**Your code**
Tested with ts-node, I am simply reproducing in the shell.

```ts
import Ajv from 'ajv'

const schema = {
  "$id": "http://example.com/util/myschema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Example",
  "type": "string",
  "pattern": "\\x{00a1}"
}

const ajv = new Ajv()
ajv.compile(schema)
```

**Validation result, data AFTER validation, error messages**
> Uncaught SyntaxError: Invalid regular expression: /\x{00a1}/: Invalid escape

**What results did you expect?**
No compilation error, this works with v6 of ajv and `new RegExp("\\x{00a1}")` works without issues.

**Are you going to resolve the issue?**
No