# [925] Confusion between "properties" element name vs. schema keyword

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv@6.7.0

**Ajv options object**
(see code below)

**JSON Schema**
(see code below)

**Sample data**
(see code below)

**Your code**

```javascript
const ajv = require('ajv')({
    $data: true,
    allErrors: true,
    verbose: true,
    jsonPointers: true,
    patternGroups: true,
    extendRefs: true
});

let schema = 
{
    "type": "object",
    "properties": {
        "type": "object",
        "properties": {
            "foo": { },
        },
        "required": ["foo"]
    },
    "required": ["properties"]
};

let data =
{
    "properties": {
        "foo": "bar"
    }
}

const validate = ajv.compile(schema);   // throws exception (validation error)
const valid = validate(data);
```

**Validation result, data AFTER validation, error messages**

`compile()` throws an exception (while calling `validateSchema()` internally)
```
Error: schema is invalid: data/properties/type should be object,boolean, data/properties/required should be object,boolean
    at Ajv.validateSchema (..../node_modules/ajv/lib/ajv.js:176:16)
    at Ajv._addSchema (..../node_modules/ajv/lib/ajv.js:305:10)
    at Ajv.compile (..../node_modules/ajv/lib/ajv.js:111:24)
    at Object.<anonymous> (..../index.js:30:22)
    at Module._compile (internal/modules/cjs/loader.js:721:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:732:10)
    at Module.load (internal/modules/cjs/loader.js:620:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:560:12)
    at Function.Module._load (internal/modules/cjs/loader.js:552:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:774:12)
```

**What results did you expect?**
The goal is require that the object has a property named `properties`, and the `properties` element is required to have a property named `foo` (i.e., `data.properties.foo` is required).  Ajv seems to get confused when a property is named `properties` (probably because it's also a keyword), and throws an exception.  If you remove "type" and "required" elements from the schema, then it no longer throws an exception during `compile()`, but still fails to validate because the generated code is looking for `foo` at the wrong level (i.e., it expects `data.foo` (incorrect) instead of `data.properties.foo` (correct)).  Substituting any other name (e.g., `_properties`) for the top-level `properties` fixes the problem, but unfortunately that's not a viable solution for my situation.