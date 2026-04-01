# [1649] Option: return errors as a tree

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

ajv@8.6.0

**What problem do you want to solve?**

Improve readability of `validation.errors`.
Currently error reporting is provided as a flat list in `validate.errors`.
I find this list very hard to read and use to diagnose problems on large schema / instance.

**What do you think is the correct solution to problem?**

Provide a tree of errors instead of a flat list.
In single error mode, all the elements of the `validation.errors` all trace back to a single failure which made ajv failed to validate.
Here is my understanding on how schema combinators should affect the tree:
  - `not`: leaf because its child validates
  - `allOf`: absent because it forwarded its first child failure
  - `anyOf`: node whose children mirror the schema's children
  - `oneOf`: either a leaf if all its child validate or a node if some of them failed

**Will you be able to implement it?**

I did and it and it already helped us fix some issues: [ajv-error-tree](https://www.npmjs.com/package/ajv-error-tree).
However I had the do the hacky job of reconstructing a tree from a flat list.
I believe that the clean solution would be to directly generate errors as a tree and flatten it if the user requires it.
Is this worth integrating in `ajv`?
