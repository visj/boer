# [457] Does not compile JSON schema metaschema, fails to validate schema files

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

latest (4.11.5)

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

{ }


**JSON Schema (please make it as small as possible to reproduce the issue):**

content of http://json-schema.org/draft-06/schema


**Data (please make it as small as posssible to reproduce the issue):**

any


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript

  let metaSchema = meta.readContent() ; // metaschema contains draft 06 JSON-schema object
  let jschemaEngine = new Ajv() ; 
  let validate = jschemaEngine.compile(metaSchema) ;  // this call fails

```

**Validation result, data AFTER validation, error messages:**

```
Error: no schema with key or ref "http://json-schema.org/draft-06/schema#"
    at validate (c:\DEV\project-designer\node_modules\ajv\lib\ajv.js:92:21)
    at validateSchema (c:\DEV\project-designer\node_modules\ajv\lib\ajv.js:162:19)
    at _addSchema (c:\DEV\project-designer\node_modules\ajv\lib\ajv.js:288:7)
    at Ajv.compile (c:\DEV\project-designer\node_modules\ajv\lib\ajv.js:113:21)
    at Object.<anonymous> (c:\DEV\project-designer\validate.js:61:32)
    at Module._compile (module.js:570:32)
    at Object.Module._extensions..js (module.js:579:10)
    at Module.load (module.js:487:32)
    at tryModuleLoad (module.js:446:12)
    at Function.Module._load (module.js:438:3)
```

**What results did you expect?**

Compile the metaschema.


**Are you going to resolve the issue?**

Have no idea how.

