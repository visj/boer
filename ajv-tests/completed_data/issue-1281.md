# [1281] uri format fails for valid URI

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
version 6.12.0

**Ajv options object**
None


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/schema#",
  "type": "object",
  "properties": {
    "link_image_url": {
      "type": ["string", "null"],
      "format": "uri"
    }
  }
}
```


**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

Example URI: `https://d1v1e13ebw3o15.cloudfront.net/data/53673/pool_and_spa_master/..jpg`
Yes it's an unconventional URI, but it _is_ valid.

**Validation result, data AFTER validation, error messages**
Error message: should match format "uri"

**What results did you expect?**
I expect the aforementioned example URI to validate properly
