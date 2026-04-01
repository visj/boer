# [1279] Make the ValidateFunction interface "$async": true/false aware

**What version of Ajv you are you using?** 6.12.4

**What problem do you want to solve?**
`compile({ "$async": true/false/undefined, ... }).validate()` could generate a type signature more specific than  `boolean | PromiseLike<any>`, if some type inference is allowed.

**What do you think is the correct solution to problem?**
- Create specific types for async true or false schemas
- Overload `compile` and `compileAsync` with two different signatures, one for each schema type

**Will you be able to implement it?**
Maybe? I'm going to try a bit, maybe draft a pull request.