# [1647] Unable to use Ajv with esModuleInterop set to true

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://ajv.js.org/contributing/
-->

**The version of Ajv you are using**
8.6.0
ajv-formats 2.1.0

**The environment you have the problem with**
Node v12.13.0
 typescript 4.0.2
 tsc for compiles

**Your code (please make it as small as possible to reproduce the issue)**
```
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
const ajv = new Ajv({coerceTypes: true})
addFormats(ajv)
return ajv.compile(schema)
```


**Results and error messages in your platform**

Setting `esModuleInterop` to false resolves the error below but it should be set to true for this project.

```
 node_modules/ajv/lib/compile/resolve.ts:5:1
    5 import * as traverse from "json-schema-traverse"
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Type originates at this import. A namespace-style import cannot be called or constructed, and will cause a failure at runtime. Consider using a default import or import require here instead.

node_modules/ajv/lib/compile/resolve.ts:101:38 - error TS7006: Parameter 'sch' implicitly has an 'any' type.

101   traverse(schema, {allKeys: true}, (sch, jsonPtr, _, parentJsonPtr) => {
                                         ~~~

  node_modules/ajv/lib/compile/resolve.ts:4:1
    4 import * as equal from "fast-deep-equal"
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Type originates at this import. A namespace-style import cannot be called or constructed, and will cause a failure at runtime. Consider using a default import or import require here instead.
```
    
    