# [411] Correct behaviour or not: Getting a schema compilation error when a $data reference points outside the root of the subschema

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

## The scenario is uploaded to runkit:
https://runkit.com/sondrele/589c81cd11ea6e0014d53f0f

**Problem:**
First, I had expected the schema to compile (no matter where the json pointer was pointing).

Then, given that the schema had been compiled successfully, I had expected the validation to succeed (at least in the provided example) because of the `$data` being resolved to `undefined` instead of `["FOO", "BAR"]` (due to the relative json pointer pointing to a property that does not exist).

The documentation on [$data reference](http://epoberezkin.github.io/ajv/#data-reference) states (in the last paragraph) the following: `$data reference is resolved safely - it won’t throw even if some property is undefined.`

However, the schema compilation fails because the `$data` reference points outside of the root level of the subschema. The documentation only says that a *relative JSON pointer cannot do this*, but not that it will fail to compile the schema. 

I am not sure whether I've interpreted the documentation wrong, and that it is correct behaviour that a the schema compilation should fail when it encounters a relative JSON pointer that points outside of the root, or that the `$data` reference should have been resolved to `undefined`.

**Validation result, data AFTER validation, error messages:**

Schema does not compile due to this error message being thrown: 
```

Error: Cannot access data 1 levels up, current level is 0

```

**What results did you expect?**

That the validation succeeds.

**Lastly**
Thank you for the time and effort put into this library! :)
