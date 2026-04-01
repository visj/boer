# [2375] Runtime discriminator to be able to support useDefaults within anyOf/oneOf

**What version of Ajv you are you using?**
8.12.0

**What problem do you want to solve?**
Ajv ignores or throws when a [default is used within oneOf/anyOf/not](https://github.com/ajv-validator/ajv/issues/42). 

The reasons for this are understandable, but it's a frequent source of confusion and severely limits the usefulness of the default keyword when using the useDefaults option.

The OpenAPI `discriminator` keyword is an option, but requires using the problematic oneOf that literally means _only one of these schema_ and can cause subtle problems.

**What do you think is the correct solution to problem?**
The app knows best about resolving ambiguity, so why not allow it to define a function that can tell ajv how to proceed?

I'd propose an optional runtime discriminator that ajv would call to get a definitive answer on which branch to use. This would allow defaults to behave normally, remain statically defined within the schema, and could even improve performance.

**Will you be able to implement it?**
Sure, but I don't know too much about the inner workings of ajv.