# [1360] Error: unknown format "uri" ignored in schema

**Version: 7.0.1**

**Code**

```javascript
const {default: Ajv} = require('ajv');

const ajv = new Ajv();
ajv.compile({
  type: 'object',
  properties: {
    url: {type: 'string', format: 'uri'},
  }
});
```

Error:

```
Error: unknown format "uri" ignored in schema at path "#/properties/url"
    at unknownFormat (...\ajv\dist\vocabularies\format\format.js:63:23)
    at validateFormat (...\ajv\dist\vocabularies\format\format.js:50:17)
    at Object.code (...\ajv\dist\vocabularies\format\format.js:22:13)
    at Object.keywordCode (...\ajv\dist\compile\validate\keyword.js:12:13)
    at ...\ajv\dist\compile\validate\iterate.js:54:27
    at CodeGen.code (...\ajv\dist\compile\codegen\index.js:423:13)
    at CodeGen.block (...\ajv\dist\compile\codegen\index.js:552:18)
    at iterateKeywords (...\ajv\dist\compile\validate\iterate.js:51:9)
    at groupKeywords (...\ajv\dist\compile\validate\iterate.js:31:13)
    at ...\ajv\dist\compile\validate\iterate.js:23:13
```

It works with version **6.12.5**.