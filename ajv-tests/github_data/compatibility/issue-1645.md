# [1645] It is impossible to use AJV in ESModule-based bundled frontend applications.

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://ajv.js.org/contributing/
-->

**The version of Ajv you are using**

8.6.0

**The environment you have the problem with**

Rollup + Browsers + ESModules

**Your code (please make it as small as possible to reproduce the issue)**

```javascript
import Ajv from 'ajv';
```

**If your issue is in the browser, please list the other packages loaded in the page in the order they are loaded. Please check if the issue gets resolved (or results change) if you move Ajv bundle closer to the top**

N/A

**Results in node.js v8+**

N/A

**Results and error messages in your platform**

N/A

---

Modern bundled web-apps are moving to ES Modules (`.mjs`) for everything. As it stands, AJV cannot be bundled using e.g. Rollup and `import` statements. Fullstop.

I have tried:

- `import Ajv from 'ajv'` using just the default `ajv` package.
- `import * as Ajv from 'ajv'`
- Some other ugly hacks to try to get imports working.
- Using `@rollup/plugin-commonjs` to import the CommonJS module, which results in the Node version it seems (getting errors about missing `stream`, `http`, `Url`, etc.)
- Forking and Re-compiling to emit ESModules from `tsc` (and then renaming them to `.mjs` - see the ridiculous 4-year-old issue over at microsoft/typescript#18442) - not sure if this is a Typescript compiler issue or AJV's, but `import`s would need to use the full path, including `.mjs`.

Literally nothing I try works. I don't really come across this issue with many modules so I have to assume it's AJV trying to be "hybrid" when in reality it needs to ditch CommonJS and do a major version bump (or something of that sort).