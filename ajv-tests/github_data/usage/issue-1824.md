# [1824] Generating Standalone Validation Module misses meta-schema

Sorry to raise another issue.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Freshly installed (2021-11-20) ajv-cli according to https://ajv.js.org/standalone.html#usage-with-cli

**Ajv options object**

**JSON Schema**
https://specif.de/v1.1/schema.json

```json
{
  "$id": "https://specif.de/v1.1/schema#",
  "$schema": "https://json-schema.org/draft/2019-09/schema#",
  "title": "JSON-Schema for SpecIF v1.1",
...
}
```

**Sample data**
n/a

**Your code**
```
ajv compile -s schema.json -o validate_schema.js
```
(according to https://ajv.js.org/standalone.html#usage-with-cli)

**Validation result, data AFTER validation, error messages**
![grafik](https://user-images.githubusercontent.com/8947971/142726541-ae626ac6-bc24-43c6-8a74-3be279219c17.png)

- First trial with the schema as shown above
- Second trial with the $schema in the first line

**What results did you expect?**
The error message indicates that a wrong meta-schema is specified, but it isn't.

**Are you going to resolve the issue?**
No idea.