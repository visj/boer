# [2047] Syntax for Ajv import?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Version 8.11.0, installed today

**Ajv options object**
None.

**Your code**

```typescript
// ProjectJSON.mts

// this works, https://github.com/microsoft/TypeScript/issues/24847}
import { default as Ajv } from "ajv";

// this doesn't work, but is the currently recommended import line
//import Ajv from "ajv";
/*
_02_passthrough_types/source/ProjectJSON.mts(98,17): error TS2351: This expression is not constructable.
  Type 'typeof import("/home/ajvincent/code-generation/cross-stitch/node_modules/ajv/dist/ajv")' has no construct signatures.
*/
const ajv = new Ajv();
void(ajv);
```

I was bitten on this exact error with https://github.com/dsherret/code-block-writer/issues/42 a few weeks ago.

**Are you going to resolve the issue?**

I can, by adding a little bit of documentation.  I just need to know where people want it, if they don't want to quickly fix this themselves.