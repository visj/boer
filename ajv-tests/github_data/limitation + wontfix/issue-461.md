# [461] Validating self-referencing data structures

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
5.0.4-beta.1

**Ajv options object**

```javascript
{}
```


**JSON Schema**

```json
{ "properties": { "self": { "$ref": "#" } } }
```


**Data**

```javascript
const data = {};
data.self = data;
```


**Your code**

```javascript
ajv.validate(schema, data);
```

**Validation result, data AFTER validation, error messages:**

```
RangeError: Maximum call stack size exceeded
    at validate (eval at localCompile (/node_modules/ajv/lib/compile/index.js:118:26), <anonymous>:3:29)
    at validate (eval at localCompile (/node_modules/ajv/lib/compile/index.js:118:26), <anonymous>:3:389)
    at validate (eval at localCompile (/node_modules/ajv/lib/compile/index.js:118:26), <anonymous>:3:389)
    at validate (eval at localCompile (/node_modules/ajv/lib/compile/index.js:118:26), <anonymous>:3:389)
    at validate (eval at localCompile (/node_modules/ajv/lib/compile/index.js:118:26), <anonymous>:3:389)
    at validate (eval at localCompile (/node_modules/ajv/lib/compile/index.js:118:26), <anonymous>:3:389)
    at validate (eval at localCompile (/node_modules/ajv/lib/compile/index.js:118:26), <anonymous>:3:389)
    at validate (eval at localCompile (/node_modules/ajv/lib/compile/index.js:118:26), <anonymous>:3:389)
    at validate (eval at localCompile (/node_modules/ajv/lib/compile/index.js:118:26), <anonymous>:3:389)
    at validate (eval at localCompile (/node_modules/ajv/lib/compile/index.js:118:26), <anonymous>:3:389)
```

**What results did you expect?**
The validation should pass. Recursive structures should be handled. 

**Are you going to resolve the issue?**
No