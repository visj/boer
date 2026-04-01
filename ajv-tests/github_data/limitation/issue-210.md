# [210] Support mutual recursive $refs when both refs are pointing to schema fragments

I am currently working on a project where we are splitting up a very large JSON schema. In doing so I am breaking up the definitions  into separate definition files/schemas. However when doing this I seem to be getting a stack over flow whenever one schema file refers to another (using IDs) that also refers back to it. What is odd is I have tested some simple examples doing the same thing but that do work. I was trying to make an example case to show here but was not able to make one to cause the same error. I have looked extensively for information about this and haven't been able to find anything. I also upgraded to AJV 4.1.2 and got the same error. I am adding all these schemas programmatically with "addSchema". They work fine when they are not circular but when they are circular it no longer works.
Is this just a limitation? Am I doing something wrong? Any help us appreciated. This is the looped call stack:

```
RangeError: Maximum call stack size exceeded
    at String.replace (native)
    at Url.format (url.js:413:23)
    at Url.parse (url.js:344:20)
    at Object.urlParse [as parse] (url.js:84:5)
    at Ajv._resolve (node_modules/ajv/lib/compile/resolve.js:62:15)
    at Ajv.resolve (node_modules/ajv/lib/compile/resolve.js:39:22)
    at Object.resolveRef (node_modules/ajv/lib/compile/index.js:128:21)
    at Object.generate_ref [as code] (node_modules/ajv/lib/dotjs/ref.js:22:22)
    at Object.generate_validate [as validate] (node_modules/ajv/lib/dotjs/validate.js:374:37)
    at Object.generate_allOf [as code] (node_modules/ajv/lib/dotjs/allOf.js:22:27)
    at Object.generate_validate [as validate] (node_modules/ajv/lib/dotjs/validate.js:374:37)
    at Object.generate_properties [as code] (node_modules/ajv/lib/dotjs/properties.js:198:26)
    at Object.generate_validate [as validate] (node_modules/ajv/lib/dotjs/validate.js:374:37)
    at Object.generate_allOf [as code] (node_modules/ajv/lib/dotjs/allOf.js:22:27)
    at generate_validate (node_modules/ajv/lib/dotjs/validate.js:374:37)
    at localCompile (node_modules/ajv/lib/compile/index.js:53:22)
    at Ajv.compile (node_modules/ajv/lib/compile/index.js:42:10)
    at Ajv.localCompile (node_modules/ajv/lib/compile/index.js:48:22)
    at Ajv.resolve (node_modules/ajv/lib/compile/resolve.js:52:19)
    at Object.resolveRef (node_modules/ajv/lib/compile/index.js:128:21)
    at Object.generate_ref [as code] (node_modules/ajv/lib/dotjs/ref.js:22:22)
    at Object.generate_validate [as validate] (node_modules/ajv/lib/dotjs/validate.js:374:37)
    at Object.generate_anyOf [as code] (node_modules/ajv/lib/dotjs/anyOf.js:34:27)

```
