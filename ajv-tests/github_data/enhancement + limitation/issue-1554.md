# [1554] Discriminator logic will not dereference schemas before validating preconditions

**What version of Ajv you are you using?**

`8.0.5`

**What problem do you want to solve?**

Defer the evaluation of precondition checks on `discriminator`s after dereferencing `$ref`s. Currently, a schema will fail validation if the list of `oneOf` children contains a referenced schema instead of an embedded schema.

See: https://github.com/ajv-validator/ajv/blob/baf1475cede6d7606bb1009bbdd1a942f76cec6c/lib/vocabularies/discriminator/index.ts#L64-L72

**What do you think is the correct solution to problem?**

The preconditions for `discriminator` support should be deferred.

**Will you be able to implement it?**

I don't think so. 😬 