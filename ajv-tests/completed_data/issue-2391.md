# [2391] Ref within def does not act consistently

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Yes 

```
├── ajv-cli@5.0.0
├── ajv@8.12.0
```

**Ajv options object**

CLI invocation `ajv validate -s test.schema.json -d test.json`

**JSON Schema**

This schema would work complain that:

```
schema schema/test.schema.json is invalid
error: can't resolve reference #/$defs/JSONValue from id KVMap
```

```json
{
  "$ref": "#/$defs/KVMap",
  "$defs": {
    "JSONValue": {
      "$id": "JSONValue"
    },
    "KVMap": {
      "$id": "KVMap",
      "type": "object",
      "patternProperties": {
        "^(.*)$": {
          "$ref": "#/$defs/JSONValue"
        }
      }
    }
  }
}
```

I am unsure if refs should use IDs instead of JSON Pointers everywhere, but IDs do seem to work.

The inconsistency between VSCode and ajv's validator wrt IDs is that ajv accepts ID as `JSONValue` instead of `#JSONValue` too, whereas VSCode does not. I cant find any mention of this on JSONSchema and think it might be VSCode which is wrong here.

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{}
```

**What results did you expect?**

This should be a valid case in JSON schema, because dictionaries are not sorted so it would be impossible to refer to a non-id anchor based def.

**Are you going to resolve the issue?**
I dont know
