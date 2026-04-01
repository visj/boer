# [2058] Wrong warning for array schema

I use `aоv` in `fastify` and get a message in tests

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`8.10.0`

**Ajv options object**
```javascript
{ 
  allowUnionTypes: true 
}
```

**JSON Schema**
```json
{
   "type":"array",
   "minItems":1,
   "items":{
      "type":"object",
      "properties":{
         "name":{ "type":"string" },

         "labels":{
            "type":"array",
            "minItems":1,
            "items":[{ "type":["string", "number", "boolean"] }]
         },

         "value":{ "type":[ "string", "number" ] }
      },
      "required":[ "name", "labels", "value"]
   }
}
```

**Sample data**
```json
[
    {
        "name": "appVersion",
        "labels": ["test1"],
        "value": 1,
    }
]
```

**Validation result, data AFTER validation, error messages**
```
strict mode: "items" is 1-tuple, but minItems or maxItems/additionalItems are not specified or different at path 
"#/properties/params/items/properties/labels"

at checkStrictMode (../../node_modules/@fastify/ajv-compiler/node_modules/ajv/lib/compile/util.ts:212:18)
at checkStrictTuple (../../node_modules/@fastify/ajv-compiler/node_modules/ajv/lib/vocabularies/applicator/items.ts:54:22)
at validateTuple (../../node_modules/@fastify/ajv-compiler/node_modules/ajv/lib/vocabularies/applicator/items.ts:27:3)
at Object.code (../../node_modules/@fastify/ajv-compiler/node_modules/ajv/lib/vocabularies/applicator/items.ts:14:39)
at keywordCode (../../node_modules/@fastify/ajv-compiler/node_modules/ajv/lib/compile/validate/index.ts:523:9)     
at ../../node_modules/@fastify/ajv-compiler/node_modules/ajv/lib/compile/validate/index.ts:265:9
at CodeGen.code (../../node_modules/@fastify/ajv-compiler/node_modules/ajv/lib/compile/codegen/index.ts:525:33)    
at CodeGen.block (../../node_modules/@fastify/ajv-compiler/node_modules/ajv/lib/compile/codegen/index.ts:680:20)  
```

**What results did you expect?**
to have no any warning

