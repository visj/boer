# [2077] Empty key is not validated by "required" keyword

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.0

**Ajv options object**

Without options

```javascript

```

**JSON Schema**

```json
{
   "$schema":"http://json-schema.org/draft-07/schema",
   "type":"object",
   "properties":{
      "": { "type": "number" }
   },
   "required": [ "" ]
}
```

**Sample data**

```json
{}
```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  console.log("Broken example",validate(data))
```
https://runkit.com/hosekp/630f1b9d59cb9b000b008aaf

**Validation result, data AFTER validation, error messages**

No errors

**What results did you expect?**

I expect an error about missing "" property

**Are you going to resolve the issue?**

I have found a workaround. If you use loopRequired=0 option, it is working.
