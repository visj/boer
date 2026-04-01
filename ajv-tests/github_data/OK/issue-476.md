# [476] Better error message when additional-properties are disallowed

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

5.0.0

**Validation result, data AFTER validation, error messages**

Error message: `data should NOT have additional properties`

**What results did you expect?**

An error message listing what properties were there that "should not have been".

**********

At the moment, when an object is validating, and it has a property that wasn't listed (and `additionalProperties` is set to `false`), the error message is not very helpful.

It just says: "data should NOT have additional properties"

But it doesn't say what "additional properties" were present.

This makes it very hard to determine what property was accidentally added -- especially when using nested schemas.

Simply including a list of additional-properties in the error message would resolve the issue.