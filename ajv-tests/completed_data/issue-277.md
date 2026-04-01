# [277] Can't resolve refs with protocol-relative URI

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

4.4.0

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

``` javascript
{}
```

**JSON Schema (please make it as small as possible to reproduce the issue):**

``` json
{
  "id": "//e.com/types",
  "definitions": {
    "int": { "type": "integer" }
  }
}
```

**Data (please make it as small as posssible to reproduce the issue):**

``` json
1
```

**Your code (please use `options`, `schema` and `data` as variables):**

``` javascript
var ajv = new Ajv;
ajv.addSchema(schema);
var validate = ajv.compile({ $ref: '//e.com/types#/definitions/int' });
validate(1);
```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->

See https://tonicdev.com/esp/57b22582fff2dc1200399e03

If protocol added to the URLs everything works.

**Validation result, data AFTER validation, error messages:**

Can't compile schema

```
Error: can't resolve reference //e.com/types#/definitions/int from id #
missingRef: "//e.com/types#/definitions/int"
missingSchema: "e.com/types"
```

**What results did you expect?**

data is valid
