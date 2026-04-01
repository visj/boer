# [2496] Error using stringify on schema with uri-encoded definition property

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?** I'm using the latest version.

I'm getting "can't resolve reference" error when having a schema with a definition property using a uri-encoding like '%3C' or '%22'. I started seeing this while using a schema with the fields oneOf, allOf or anyOf inside the definition.

The following code, based on a template provided in this repo, was used to debug the error.

```javascript
const Ajv = require("ajv")
const ajv = new Ajv({allErrors: true})

  const schema = {
    title: 'object with $ref',
    definitions: {
      'Some%3Cloremipsum3E': {
          additionalProperties: {
		type: 'string',
          },
          type: 'object'
      }
    },
    type: 'object',
    properties: {
      obj: {
        $ref: '#/definitions/Some%3Cloremipsum3E'
      }
    }
  }

  const object = {
    obj: {
      str: 'test'
    }
  }
const validate = ajv.compile(schema)

test(object)


function test(data) {
  const valid = validate(data)
  if (valid) console.log("Valid!")
  else console.log("Invalid: " + ajv.errorsText(validate.errors))
}
```

**Validation result, data AFTER validation, error messages**

```
MissingRefError: can't resolve reference #/definitions/Some%3Cloremipsum3E from id #
    at Object.code (./node_modules/ajv/dist/vocabularies/core/ref.js:43:19)
    at keywordCode (./node_modules/ajv/dist/compile/validate/index.js:480:13)
    at ./node_modules/ajv/dist/compile/validate/index.js:193:25
    at CodeGen.code (./node_modules/ajv/dist/compile/codegen/index.js:440:13)
    at CodeGen.block (./node_modules/ajv/dist/compile/codegen/index.js:570:18)
    at schemaKeywords (./node_modules/ajv/dist/compile/validate/index.js:193:13)
    at typeAndKeywords (./node_modules/ajv/dist/compile/validate/index.js:131:16)
    at subSchemaObjCode (./node_modules/ajv/dist/compile/validate/index.js:117:5)
    at subschemaCode (./node_modules/ajv/dist/compile/validate/index.js:92:13)
    at KeywordCxt.subschema (./node_modules/ajv/dist/compile/validate/index.js:448:9) {
  missingRef: '#/definitions/Some%3Cloremipsum3E',
  missingSchema: ''
}

```
The error is thrown in the line ` if (schOrEnv === undefined) throw new MissingRefError(it.opts.uriResolver, baseId, $ref)`.
The strucutre up to "it" seems to be as it should, but the props passed to  derived from it "resolveRef.call" seem to be missing definitions, turning schOrEnv to undefined and leading to the error.

```javascript
const def: CodeKeywordDefinition = {
  keyword: "$ref",
  schemaType: "string",
  code(cxt: KeywordCxt): void {
    const {gen, schema: $ref, it} = cxt
    const {baseId, schemaEnv: env, validateName, opts, self} = it
    const {root} = env
    if (($ref === "#" || $ref === "#/") && baseId === root.baseId) return callRootRef()
    const schOrEnv = resolveRef.call(self, root, baseId, $ref)
    if (schOrEnv === undefined) throw new MissingRefError(it.opts.uriResolver, baseId, $ref)
```
