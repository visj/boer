# [502] `contains` allows empty array if `$ref` is used in sibling property.

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Latest (5.1.3)


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
options = {}

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
schema = {
   "definitions":{
      "def":{
         "type":"string"
      }
   },
   "type":"object",
   "properties":{
      "str":{
         "$ref":"#/definitions/def"
      },
      "arr":{
         "type":"array",
         "contains":{
            "type":"number"
         }
      }
   }
}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
data = {"str":"", "arr":[]}

```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
ajv = new Ajv(options);
ajv.validate(schema, data)

```


**Validation result, data AFTER validation, error messages**

```
true
```

**What results did you expect?**
```
false
```

**Are you going to resolve the issue?**
No, I can't.