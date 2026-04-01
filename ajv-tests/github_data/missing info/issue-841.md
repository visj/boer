# [841] select/selectCases/selectDefault with async custom function in selectCases

I tried to compile an async schema (with `$async: true`) containing an async custom validator (function, not compiled, with param `async: true)` in each `selectCases` keyword of a `select/selectCases/selectDefault`.
I got this error during compilation: `async keyword in sync schema`
Everything is ok with an `if/then/else` (testing with a `const` keyword).

`ajv@6.5.2`
node `v8.11.1` on Windows