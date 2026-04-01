# [2062] Ability for Formatters to modify data

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
Latest
**What problem do you want to solve?**

Along the same lines as how [other features can modify data](https://ajv.js.org/guide/modifying-data.html#modifying-data-during-validation), It would be very convenient if there as some way for "formatters" to transform data while validating it.

One use case is the `uuid` format.  UUID equality is case-insenstive so it would be very helpful if it could be transformed to a consistent casing during validation.   

**What do you think is the correct solution to problem?**

I think adding a `transform` function to the validator would be the best approach.

```ts
ajv.addFormat(
   "my-format", 
   /^a-z\$_[a-z$_0-9]*$/,
   (v) => v.toLocalLowerCase()  // transform to lowercase
)
```

I think it would maybe make sense to run this BEFORE the format validation itself executes, that way you have a chance to do a little bit of cleanup if needed.

**Will you be able to implement it?**

Possibly... Would have to get more familiar with the codebase.  I'm sure there are probably edge cases that make this difficult (like primitives being passed by value).  If this is a feature that would be accepted, I could make an attempt.
