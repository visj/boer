# [1529] Error: Cannot find module 'ajv/lib/refs/json-schema-draft-06.json'

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

Looks like the latest release (8.0.4) no longer contains the `lib` folder.

https://github.com/ajv-validator/ajv/commit/c4de1a4628757527a579ad179adf29c462acad1b#r49028541

```
Error: Cannot find module 'ajv/lib/refs/json-schema-draft-06.json'
Require stack:
- /home/runner/work/cspell/cspell/packages/cspell-types/node_modules/ajv-cli/dist/commands/ajv.js
- /home/runner/work/cspell/cspell/packages/cspell-types/node_modules/ajv-cli/dist/commands/compile.js
- /home/runner/work/cspell/cspell/packages/cspell-types/node_modules/ajv-cli/dist/commands/index.js
- /home/runner/work/cspell/cspell/packages/cspell-types/node_modules/ajv-cli/dist/index.js
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:815:15)
    at Function.Module._load (internal/modules/cjs/loader.js:667:27)
    at Module.require (internal/modules/cjs/loader.js:887:19)
    at require (internal/modules/cjs/helpers.js:74:18)
    at Object.<anonymous> (/home/runner/work/cspell/cspell/packages/cspell-types/node_modules/ajv-cli/dist/commands/ajv.js:10:26)
    at Module._compile (internal/modules/cjs/loader.js:999:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1027:10)
    at Module.load (internal/modules/cjs/loader.js:863:32)
    at Function.Module._load (internal/modules/cjs/loader.js:708:14)
    at Module.require (internal/modules/cjs/loader.js:887:19) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/home/runner/work/cspell/cspell/packages/cspell-types/node_modules/ajv-cli/dist/commands/ajv.js',
    '/home/runner/work/cspell/cspell/packages/cspell-types/node_modules/ajv-cli/dist/commands/compile.js',
    '/home/runner/work/cspell/cspell/packages/cspell-types/node_modules/ajv-cli/dist/commands/index.js',
    '/home/runner/work/cspell/cspell/packages/cspell-types/node_modules/ajv-cli/dist/index.js'
  ]
}
```


**What version of Ajv are you using? Does the issue happen if you use the latest version?**

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

```javascript

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json

```

**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript

```

**Validation result, data AFTER validation, error messages**

```

```

**What results did you expect?**

**Are you going to resolve the issue?**
