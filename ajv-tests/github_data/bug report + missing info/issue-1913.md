# [1913] Reference to another schema is not resolved

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.10.0

**Ajv options object**
{ strict: false }

**JSON Schema**
```
  {
                $schema: "http://json-schema.org/draft-07/schema#",
                $id: "http://base.json",
                type: "object",
                fileExtension: "schema",
                definitions: {
                    name: { type: "string", minLength: 1, maxLength: 120, pattern: "^[a-zA-Z0-9/_@]+$", default: "" }
                }
   }
```

and

```
 {
                $schema: "http://json-schema.org/draft-07/schema#",
                $id: "http://ref.json",
                type: "object",
                properties: { name: { $ref: "http://base.json#/definitions/name" } }
 }
```

**Sample data**
{ name: "(dummy" }


**Your code**
 const ajv = new Ajv({ strict: false });
        ajv.addSchema(
            {
                $schema: "http://json-schema.org/draft-07/schema#",
                $id: "http://base.json",
                type: "object",
                fileExtension: "schema",
                definitions: {
                    name: { type: "string", minLength: 1, maxLength: 120, pattern: "^[a-zA-Z0-9/_@]+$", default: "" }
                }
            },
            "base",
            true
        );
        ajv.addSchema(
            {
                $schema: "http://json-schema.org/draft-07/schema#",
                $id: "http://ref.json",
                type: "object",
                properties: { name: { $ref: "http://base.json#/definitions/name" } }
            },
            "ref",
            true
        );

        const isValid = ajv.validate("ref", { name: "(dummy" });

**Validation result, data AFTER validation, error messages**

Error: can't resolve reference http://base.json#/definitions/name from id http://ref.json
    at Object.code (node_modules\ajv\lib\vocabularies\core\ref.ts:19:39)
    at keywordCode (node_modules\ajv\lib\compile\validate\index.ts:523:9)
    at C:\Users\D041516\WebstormProjects\x4\node_modules\ajv\lib\compile\validate\index.ts:228:21
    at CodeGen.code (node_modules\ajv\lib\compile\codegen\index.ts:525:33)
    at CodeGen.block (node_modules\ajv\lib\compile\codegen\index.ts:680:20)
    at schemaKeywords (node_modules\ajv\lib\compile\validate\index.ts:228:9)
    at typeAndKeywords (node_modules\ajv\lib\compile\validate\index.ts:161:3)
    at subSchemaObjCode (node_modules\ajv\lib\compile\validate\index.ts:147:3)
    at subschemaCode (node_modules\ajv\lib\compile\validate\index.ts:124:7)
    at KeywordCxt.subschema (node_modules\ajv\lib\compile\validate\index.ts:491:5)
    at applyPropertySchema (node_modules\ajv\lib\vocabularies\applicator\properties.ts:45:11)
    at Object.code (node_modules\ajv\lib\vocabularies\applicator\properties.ts:32:9)
    at keywordCode (node_modules\ajv\lib\compile\validate\index.ts:523:9)
    at C:\Users\D041516\WebstormProjects\x4\node_modules\ajv\lib\compile\validate\index.ts:265:9
    at CodeGen.code (node_modules\ajv\lib\compile\codegen\index.ts:525:33)
    at CodeGen.block (node_modules\ajv\lib\compile\codegen\index.ts:680:20)
    at iterateKeywords (node_modules\ajv\lib\compile\validate\index.ts:262:7)
    at groupKeywords (node_modules\ajv\lib\compile\validate\index.ts:241:7)
    at C:\Users\D041516\WebstormProjects\x4\node_modules\ajv\lib\compile\validate\index.ts:233:38
    at CodeGen.code (node_modules\ajv\lib\compile\codegen\index.ts:525:33)
    at CodeGen.block (node_modules\ajv\lib\compile\codegen\index.ts:680:20)
    at schemaKeywords (node_modules\ajv\lib\compile\validate\index.ts:232:7)
    at typeAndKeywords (node_modules\ajv\lib\compile\validate\index.ts:161:3)
    at C:\Users\D041516\WebstormProjects\x4\node_modules\ajv\lib\compile\validate\index.ts:100:5
    at CodeGen.code (node_modules\ajv\lib\compile\codegen\index.ts:525:33)
    at C:\Users\D041516\WebstormProjects\x4\node_modules\ajv\lib\compile\validate\index.ts:61:45
    at CodeGen.code (node_modules\ajv\lib\compile\codegen\index.ts:525:33)
    at CodeGen.func (node_modules\ajv\lib\compile\codegen\index.ts:699:24)
    at validateFunction (node_modules\ajv\lib\compile\validate\index.ts:60:9)
    at topSchemaObjCode (node_modules\ajv\lib\compile\validate\index.ts:94:3)
    at validateFunctionCode (node_modules\ajv\lib\compile\validate\index.ts:42:7)
    at Ajv.compileSchema (node_modules\ajv\lib\compile\index.ts:163:25)
    at Ajv._compileMetaSchema (node_modules\ajv\lib\core.ts:744:21)
    at Ajv._compileSchemaEnv (node_modules\ajv\lib\core.ts:732:24)
    at Ajv.getSchema (node_modules\ajv\lib\core.ts:536:34)
    at Ajv.validate (node_modules\ajv\lib\core.ts:358:16)

**What results did you expect?**
Reference 
 $ref: "http://base.json#/definitions/name" 
should be found.

**Are you going to resolve the issue?**
No