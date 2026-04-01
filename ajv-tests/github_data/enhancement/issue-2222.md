# [2222] Allow coersion from `null` to `undefined`

**What version of Ajv you are you using?**
`8.11.0`

**What problem do you want to solve?**
I have a type with an optional field, and as we know from other issues (e.g. https://github.com/ajv-validator/ajv/issues/1375 and https://github.com/ajv-validator/ajv/issues/1664) the current version of `ajv` requires the associated schema to mark that field as nullable.  This means if the json source includes a `null` value, the resulting post-guarded object will have a `null` value coming from ajv's type guard.

As the ajv team already knows this can result in type errors (since `null` is not an expected value according to TypeScript).  I don't want to propose anything related to the `nullable` field issue -- that's already been discussed plenty and I know decisions have been made.  I want to instead suggest that we allow a coercion setting that will convert `null` to `undefined` -- thus removing nulls from the resulting object.

**What do you think is the correct solution to problem?**

Typescript's [coding guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines#null-and-undefined) is explicit in its suggestion to never use null.  I think this means it would be reasonable for ajv to allow a developer adhering to those guidelines to instruct ajv to to do the same, and to always convert `null` to `undefined` when parsing a json object.

**Will you be able to implement it?**

If this is of interest to the ajv team I think I'd be able to add it as an option; I imagine it would be in the form of a configuration flag (thus non-breaking).  Maybe something like `convertNullToUndefined`.