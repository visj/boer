# [786] [Change proposal] improve error texts for `const` and `enum` keywords

**What version of Ajv you are you using?**
 - `6.5.0`

**What problem do you want to solve?**
The error message returned by `ajv.errorsText()` is not descriptive enough for the keywords:
  - `const`: `should be equal to constant`
  - `enum`: `should be equal to one of the allowed values`

**What do you think is the correct solution to problem?**
Improving the [error messages template](https://github.com/epoberezkin/ajv/blob/master/lib/dot/errors.def) to include the allowed value/values (JSON serialized).

Probably it should only be printed if those values are simple, i.e. are either:
  - a simple type
  - an array of simple types (joined with commas and `or`)

**Will you be able to implement it?**
No (I do not know dot.js)