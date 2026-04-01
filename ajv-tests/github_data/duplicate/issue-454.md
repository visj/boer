# [454] Add resolveRefs option or method

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

v4.11.5

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
const options = {
    v5: true,
    allErrors: true,
    verbose: false,
    jsonPointers: false,
    uniqueItems: true,
    unicode: true,
    format: 'full',
    formats: {},
    unknownFormats: 'ignore',
    schemas: {},
    missingRefs: true,
    extendRefs: true,
    loadSchema: undefined,
    removeAdditional: false,
    useDefaults: true, 
    coerceTypes: false,
    async: undefined,
    transpile: undefined,
    meta: true,
    validateSchema: true,
    addUsedSchema: true,
    inlineRefs: true,
    passContext: false,
    loopRequired: Infinity,
    ownProperties: false,
    multipleOfPrecision: 0.1,
    errorDataPath: 'object',
    sourceCode: true,
    messages: true,
    beautify: false
}
```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
const schema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "properties": {
        "date": { "$ref": "#/definitions/DateTime" },
        "notes": { "$ref": "#/definitions/String500" }
    },
    "additionalProperties": false,
    "definitions": {
        "DateTime": {
            "type": "string",
            "format": "date-time"
        },
        "String500": {
            "type": "string",
            "maxLength": 500
        }
    }
}
```

**Your code (please use `options`, `schema` and `data` as variables):**

See [RunKit example](https://runkit.com/58e2f649e08ac000145efd81/58e402c144084500137d19c5).
```javascript
var ajv = Ajv(options);
console.log(ajv.compile(schema).schema.properties); 
```
Outputs:
```javascript
{
    "date": { "$ref": "#/definitions/DateTime" }, // still defined as $ref
    "notes": { "$ref": "#/definitions/String500" } // ..
}
```

**What results did you expect?**
I need `$ref` values to be resolved within the compiled schema. But (as noted in docs) `.compile()` method stores the schema as a reference without resolving references. 

`inlineRefs` option seems to be used for inlining referenced schemas but it doesn't. `extendRefs` is something else either.