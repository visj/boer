# [2046] Add support of the anyOf keyword for discriminator

**What version of Ajv you are you using?**
**8.6.0**

**What problem do you want to solve?**
According to the OpenAPI specification, the `discriminator` object is legal only when using one of the composite keywords `oneOf`, `anyOf`, `allOf`.

But now the user with valid definition will see an error if `anyOf` or `allOf` was used.

**What do you think is the correct solution to the problem?**
It would be great to have support for at least `oneOf` and `anyOf` in the project.

**Will you be able to implement it?**
Yes, I'm planning to create a PR in the nearest time. 