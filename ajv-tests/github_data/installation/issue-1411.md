# [1411] Module '"../node_modules/ajv/lib/ajv"' has no exported member 'DefinedError'.ts(2305)

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

I recently installed the ajv  and I seeing an issue with the following line of code 
import Ajv, {JSONSchemaType, DefinedError} from "ajv"

Any help on how I can resolve this issue? I have tried deleting node_modules and trying then install them, but I am still facing the same issue.

This template is for installation and dependency issues.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md

Before submitting the issue, please try the following:
- use the latest stable Node.js and npm
- use yarn instead of npm - the issue can be related to https://github.com/npm/npm/issues/19877
- remove node_modules and package-lock.json and run install again
-->

**The version of Ajv you are using**

**Operating system and node.js version**

**Package manager and its version**

**Link to (or contents of) package.json**

"dependencies": {
          ...    
         "ajv": "^6.12.6",
         ...
         }
     
**Error messages**
Module '"../node_modules/ajv/lib/ajv"' has no exported member 'JSONSchemaType'.
Module '"../node_modules/ajv/lib/ajv"' has no exported member 'DefinedError'.ts(2305)

**The output of `npm ls`**
| +-- @angular-devkit/core@10.1.7
| | +-- ajv@6.12.4
| | | +-- fast-deep-equal@3.1.3 deduped
| | | +-- fast-json-stable-stringify@2.1.0 deduped
| | | +-- json-schema-traverse@0.4.1
| | | `-- uri-js@4.4.1 deduped
| | +-- fast-json-stable-stringify@2.1.0 deduped