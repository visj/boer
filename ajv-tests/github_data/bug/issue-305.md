# [305] v5 constant keyword doesn't work with null value

**Ajv options object:**

``` javascript
{ v5: true }
```

**JSON Schema:**

``` json
{ "constant": null }
```

**Data:**

anything

**Your code:**

``` javascript
var validate = ajv.compile(schema);
```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->

**Validation result, data AFTER validation, error messages:**

```
TypeError: Cannot read property '$data' of null
    at Object.generate_custom [as code] (/Users/evgenypoberezkin/Work/mol-config/node_modules/ajv/lib/dotjs/custom.js:13:38)
    at generate_validate (/Users/evgenypoberezkin/Work/mol-config/node_modules/ajv/lib/dotjs/validate.js:230:37)
    at localCompile (/Users/evgenypoberezkin/Work/mol-config/node_modules/ajv/lib/compile/index.js:79:22)
    at Ajv.compile (/Users/evgenypoberezkin/Work/mol-config/node_modules/ajv/lib/compile/index.js:47:13)
    at _compile (/Users/evgenypoberezkin/Work/mol-config/node_modules/ajv/lib/ajv.js:325:29)
    at Ajv.validate (/Users/evgenypoberezkin/Work/mol-config/node_modules/ajv/lib/ajv.js:92:33)
    at repl:1:5
    at REPLServer.defaultEval (repl.js:262:27)
    at bound (domain.js:287:14)
    at REPLServer.runBound [as eval] (domain.js:300:12)
```

**What results did you expect?**

Compiled validation function
