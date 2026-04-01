# [1518] Provide "default" Ajv as a named export

**What version of Ajv you are you using?**
7.2.4

**What problem do you want to solve?**

tldr: named + default exports are not simultaneously possible with CJS. Pick one (probably named).

The default export of Ajv is the Ajv class https://github.com/ajv-validator/ajv/blob/master/lib/ajv.ts#L37

which implies equivalent ESM code like `import Ajv from 'ajv'`.

That works in babel/typecript environments that transform the code into something like `const Ajv = require('ajv').default`

But with NodeJS's native ESM, default export/import works a bit differently: https://nodejs.org/api/esm.html#esm_import_statements

The "default" export is actually module.exports, and accessing the intended "default" export requires:
```
import DefaultAjv from 'ajv';
const Ajv = DefaultAjv.default;
```
At best that is ugly, at worst it is actively broken when writing the code with Typescript+ESM.

This can be checked by running `import('ajv').then(console.log)` and notice the output is something like `{ default: { default: Ajv } }`

**What do you think is the correct solution to problem?**
The simplest solution is probably to provide Ajv as a named export.
e.g. add `export { Ajv }` to the main file.

That allows pure ESM solutions like `import { Ajv } from 'ajv'`, and this would be non-breaking.

_Alternatively_ it can use a correct default export, and export the Ajv class as `module.exports = Ajv`. This would mean any other named exports have to be tacked onto the Ajv class rather than exported in parallel.

**Will you be able to implement it?**
Happy to open a PR and update docs to match, just wanted to expose reasoning as well.