# [1916] Simple JTDDataType schema yields invalid schema error in compilation.

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.10.0

**Ajv options object**
None.

<!-- See https://ajv.js.org/options.html -->

```javascript

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```
 {
    type: "object",
    properties :
    {
	"foo bar":
	{
	    type: "string"
	}
    },
    additionalProperties:
    {
	type: "number"
    }
}

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```
{
  "foo bar": "ok",
  baz: 1
}


```
<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```
import Ajv, {JTDDataType} from "ajv/dist/jtd"
const ajv = new Ajv()

const schema = {
    type: "object",
    properties :
    {
	"foo bar":
	{
	    type: "string"
	}
    },
    additionalProperties:
    {
	type: "number"
    }
} as const

type MyData = JTDDataType<typeof schema>

// type inference is not supported for JTDDataType yet
const validate = ajv.compile<MyData>(schema)

const validData = {
  "foo bar": "ok",
  baz: 1
}

if (validate(validData))
{
    // data is MyData here
    console.log(validData["foo bar"])
    console.log(validData["baz"])
}
else
{
  console.log(validate.errors)
}

```
% node -v
v16.13.2
% tsc -v
Version 4.4.4
% tsc code.ts
% node code.js
node ick.js
.../node_modules/ajv/dist/core.js:266
                throw new Error(message);
                ^

Error: schema is invalid: data/type must NOT have additional properties, data must have property 'ref', data/type must be equal to one of the allowed values, data must have property 'enum', data must have property 'elements', data/additionalProperties must be boolean, data must have property 'optionalProperties', data must have property 'discriminator', data must have property 'values', data must match a schema in union
    at Ajv.validateSchema (.../node_modules/ajv/dist/core.js:266:23)
    at Ajv._addSchema (.../node_modules/ajv/dist/core.js:460:18)
    at Ajv.compile (.../node_modules/ajv/dist/core.js:158:26)
    at Object.<anonymous> (.../ick.js:17:20)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:17:47


```

```

**What results did you expect?**
% node code.js
ok
1

**Are you going to resolve the issue?**
