# [911] Better type definition for ValidateFunction return 

**What version of Ajv you are you using?**

6.6.1

**What problem do you want to solve?**

**TL;DR** : The [documentation](https://ajv.js.org/#api) clearly state that ` ajv.compile()` generate a `ValidateFunction` that returns a boolean. `ValidateFunction` return type is [`boolean | PromiseLike<any>`](https://github.com/epoberezkin/ajv/blob/78b77b67290f6cafb2066e2a0e8681d81ca74b0c/lib/ajv.d.ts#L123)

By taking a look at the source it is not very clear in which case it will return `PromiseLike<any>`

**What do you think is the correct solution to problem?**

Not sure.
- If ValidateFunction always return a boolean, fix the type
- if ValidateFunction always return a boolean in the context of compile but not in other contexts, then this type should be splitted in several types. To use in the appropriate context.

**Will you be able to implement it?**

Once the aproptiate thing to do decided, yes.