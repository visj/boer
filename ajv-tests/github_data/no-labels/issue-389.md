# [389] Remove (or reduce) `addKeyword()`'s requirement that `keyword` is a valid JS identifier

**What version of Ajv you are you using?**
4.3.10

**What problem do you want to solve?**
[Swagger](http://swagger.io/) API definitions use JSON Schema to define input and output values.  However, the swagger [spec for vendor extensions](http://swagger.io/specification/#vendorExtensions) (i.e. custom keywords) says they MUST start with `x-`.  

This is incompatible with `addKeyword()`'s requirement that keywords must be a valid JS identifier.  So as it stands, ajv can't be used to validate any custom keywords / vendor extentions in conjunction with Swagger.

**What do you think is the correct solution to problem?**

From looking at `keyword.js` I can't see why this test is in place as the name doesn't seem to be used as a JS identifier directly (i.e. all property accessors use bracket notation rather than dot notation, so any string is ok).

I also tested just commenting out the test, and was able to successfully add and validate against a keyword called `x-test-keyword`.

I presume I am missing something as it was deliberately added in commit 694e81684fcbc0e29ef787764779f42c2c4f5196.  I'm assuming it's something to do with macro function keywords (which I haven't used)?

Based on the above, my proposal is to entirely remove the constraint, or potentially only check it if a `macro` function is being specified.  Does either sound reasonable?

**Will you be able to implement it?**
Happy to, if the proposed solution seems reasonable?
