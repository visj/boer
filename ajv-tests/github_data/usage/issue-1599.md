# [1599] I'm having problems with ajv 8. draft 07 metaschema and the uri format.   Works fine with version ajv 6.12.6

File: flipper.json
Error: unknown format "uri" ignored in schema at path "#/properties/%40xsd%3AnoNamespaceSchemaLocation"
    at unknownFormat (/home/coderextreme/x3dvalidate/node_modules/ajv/dist/vocabularies/format/format.js:63:23)
    at validateFormat (/home/coderextreme/x3dvalidate/node_modules/ajv/dist/vocabularies/format/format.js:50:17)
    at Object.code (/home/coderextreme/x3dvalidate/node_modules/ajv/dist/vocabularies/format/format.js:22:13)
    at keywordCode (/home/coderextreme/x3dvalidate/node_modules/ajv/dist/compile/validate/index.js:451:13)
    at /home/coderextreme/x3dvalidate/node_modules/ajv/dist/compile/validate/index.js:222:17
    at CodeGen.code (/home/coderextreme/x3dvalidate/node_modules/ajv/dist/compile/codegen/index.js:439:13)
    at CodeGen.block (/home/coderextreme/x3dvalidate/node_modules/ajv/dist/compile/codegen/index.js:568:18)
    at iterateKeywords (/home/coderextreme/x3dvalidate/node_modules/ajv/dist/compile/validate/index.js:219:9)
    at groupKeywords (/home/coderextreme/x3dvalidate/node_modules/ajv/dist/compile/validate/index.js:200:13)
    at /home/coderextreme/x3dvalidate/node_modules/ajv/dist/compile/validate/index.js:192:13

I'll start looking into format.js