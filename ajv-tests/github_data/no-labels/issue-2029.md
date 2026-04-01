# [2029] [JTD] async keywords are not supported

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports. For other issues please use:
- security vulnerability: https://tidelift.com/security)
- a new feature/improvement: https://ajv.js.org/contributing/#changes
- browser/compatibility issues: https://ajv.js.org/contributing/#compatibility
- JSON-Schema standard: https://ajv.js.org/contributing/#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I use the latest version (8.11.0).

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{
    jtd: true,
    strictSchema: 'log',
    strictNumbers: true,
    strictTypes: true,
    strictTuples: true,
    verbose: true,
    allErrors: true,
    timestamp: 'date',
    parseDate: true,
    allowDate: true,
    int32range: true,
    passContext: true,
    messages: true,
    keywords: [someAsyncValidator]
}
```

**JTD Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "properties": {
        "id": { "type": "string", "metadata": { "someAsyncValidator": true } }
    },
    "$async": true
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "id": "foo_bar"
}
```

<!--**Your code** -->

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

<!--```javascript

```-->

**Validation result, data AFTER validation, error messages**

With `$async: true`:
```
[Jest]     Error: schema is invalid
```

Without `$async: true` (or with `metadata: { $async: true }`):
```
[Jest]     Error: async keyword in sync schema
[Jest] 
[Jest]       at checkAsyncKeyword (../../../node_modules/ajv/lib/compile/validate/keyword.ts:117:45)
[Jest]       at funcKeywordCode (../../../node_modules/ajv/lib/compile/validate/keyword.ts:41:3)
[Jest]       at keywordCode (../../../node_modules/ajv/lib/compile/validate/index.ts:531:2)
[Jest]       at ../../../node_modules/ajv/lib/compile/validate/index.ts:267:6
[Jest]       at CodeGen.code (../../../node_modules/ajv/lib/compile/codegen/index.ts:525:33)
[Jest]       at CodeGen.block (../../../node_modules/ajv/lib/compile/codegen/index.ts:680:20)
[Jest]       at iterateKeywords (../../../node_modules/ajv/dist/compile/validate/index.js:221:9)
[Jest]       at groupKeywords (../../../node_modules/ajv/lib/compile/validate/index.ts:250:5)
[Jest]       at ../../../node_modules/ajv/lib/compile/validate/index.ts:235:5
[Jest]       at CodeGen.code (../../../node_modules/ajv/lib/compile/codegen/index.ts:525:33)
```

**What results did you expect?**

For JTD schemas, the schema should be considered as async if `async: true` is present in the `metadata` object.

**Are you going to resolve the issue?**

Yes, I'll create a PR to handle `metadata.async`.