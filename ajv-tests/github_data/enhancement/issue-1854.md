# [1854] Unknown Keyword "$anchor" in 2019-09 and 2020-12

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Latest version, 8.8.2

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const { default: Ajv } = require('ajv/dist/2019');
const ajv = new Ajv();  // no options
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

``` javascript
const schema = {
    // $schema: "https://json-schema.org/draft/2019-09/schema",  // Same result, regardless of commented in/out
    $id: 'SchemaTest',
    $defs: {
        testProperty: {
            $anchor: "MySubSchema",
            type: "boolean",
        }
    },
    type: "array",
    items: {
        $ref: "#MySubSchema"
    }
};
```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
ajv.addSchema(schema);
ajv.getSchema("SchemaTest");
```

**Error**

```
H:\test\node_modules\ajv\dist\compile\index.js:121
        throw e;
        ^

Error: strict mode: unknown keyword: "$anchor"
    at checkStrictMode (H:\test\node_modules\←[4majv←[24m\dist\compile\util.js:174:15)
    at checkUnknownRules (H:\test\node_modules\←[4majv←[24m\dist\compile\util.js:32:13)
    at checkKeywords (H:\test\node_modules\←[4majv←[24m\dist\compile\validate\index.js:120:34)
    at subschemaCode (H:\test\node_modules\←[4majv←[24m\dist\compile\validate\index.js:89:9)
    at KeywordCxt.subschema (H:\test\node_modules\←[4majv←[24m\dist\compile\validate\index.js:428:9)
    at inlineRefSchema (H:\test\node_modules\←[4majv←[24m\dist\vocabularies\core\ref.js:38:32)
    at Object.code (H:\test\node_modules\←[4majv←[24m\dist\vocabularies\core\ref.js:24:16)
    at keywordCode (H:\test\node_modules\←[4majv←[24m\dist\compile\validate\index.js:454:13)
    at H:\test\node_modules\←[4majv←[24m\dist\compile\validate\index.js:185:25
    at CodeGen.code (H:\test\node_modules\←[4majv←[24m\dist\compile\codegen\index.js:439:13)
```

**What results did you expect?**
The schema should compile without having to pass `strict: false` to my options object. According to [release notes for 2019-09](https://json-schema.org/draft/2019-09/release-notes.html#core-vocabulary), `$anchor` is supported, and I believe same should go for 2020-20. 

Since this works fine when we do disable strict mode, clearly the logic of the keyword has already been implemented, but a keyword definition hasn't been created in [ajv/lib/vocabularies](https://github.com/ajv-validator/ajv/tree/v8.8.2/lib/vocabularies) so it's not registered in the list of default keywords.

**Are you going to resolve the issue?**

Maybe. The keyword definition shouldn't need any logic in it, no? And though it's technically not really a "dynamic" keyword, placing it in the dynamic vocabularies directory would be a quick way to have this change only be picked up by 2019 and 2020, and not by 07.