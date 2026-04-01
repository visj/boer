# [2547] makeValidate is blocked in WebExtension context

An issue occurs in bundling ESLint for WebExtension use.

It appears that ESLint is depending [Ajv](https://github.com/eslint/eslint/blob/910bd13c4cb49001f2a9f172229360771b857585/package.json#L120) to [validate ESLint configurations](https://github.com/eslint/eslint/blob/910bd13c4cb49001f2a9f172229360771b857585/lib/config/rule-validator.js#L158) by matching them to a JSON schema. Ajv [uses Function()](https://github.com/ajv-validator/ajv/blob/82735a15826a30cc51e97a1bbfb59b3d388e4b98/lib/compile/index.ts#L171) to compile JSON schemas into JavaScript functions.

The `new Function()` is blocked by the browser CSP which results in a `throw`.

An alternative method (for the WebExtension context) would be greatly beneficial.

See also: [Errors with eslint-linter-browserify](https://github.com/UziTech/eslint-linter-browserify/issues/519)

