# [1536] Type `uuid` isn't exists for Array in Ajv v7/v8?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

**Ajv options object**
```javascript
{ allErrors: true, strict: true }
```

**JSON Schema**

```json
{
        "type": "array",
        "items": { "type": "string", "format": "uuid" }
}
```

**Sample data**

```json
["0d7051b1-7d4d-4d26-b5ee-9a20ea30e310", "0d7051b1-7d4d-4d26-b5ee-9a20ea30e310"]
```

**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

https://runkit.com/dalisoft/606c9ce9ccb884001b7e9794

**Validation result, data AFTER validation, error messages**

```bash
Error: unknown format "uuid" ignored in schema at path "#/items"
```

**What results did you expect?**

Correct validation

**Are you going to resolve the issue?**

I don't know enough yet, but if someone from team can help, i really want solve this issue
