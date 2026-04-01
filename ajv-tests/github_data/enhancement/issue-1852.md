# [1852] unneeded `require("ajv/dist/runtime/equal")` in generated code for enums with primitive types

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

The code generation module appears to emit unnecessary calls to require("ajv/dist/runtime/equal") in cases where enums containing only primitive types are declared.

A minimal repro is available here: https://runkit.com/cscheid/ajv-enum-unneeded-require

**What version of Ajv you are you using?**
8.8.2

**What problem do you want to solve?**
I want to make it so that the `equal` declaration is only emitted in the cases where the enum schema requires it.

The reason we need this is that for our use case, we need a completely self-contained validating function. We're willing to restrict ourselves to a subset of the possible schemas, and in this case it seems like this declaration is unneeded. We can currently work around that at some expense by manipulating the generated code after the fact, but this would be a much cleaner solution.

**What do you think is the correct solution to problem?**
The solution here would be to perform the type checks that happen in `equalCode` ahead of time once, and only declare the `equal` function in case some of those checks fail.

**Will you be able to implement it?**
I believe I would, but I would really appreciate a thorough code review.
