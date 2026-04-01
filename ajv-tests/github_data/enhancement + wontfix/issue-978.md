# [978] Support forcing compilation into promise-returning validation functions

#### Questionnaire

- > **What version of Ajv you are you using?**
  
  `6.10.0`

- > **What problem do you want to solve?**

  I'd like to compile schemas into promise-returning functions, ***always***, even when they don't have the `$async` key set at the root level.
  
- > **What do you think is the correct solution to problem?**

  Support an `async: true` option in `new Ajv({...options})` or `(new Ajv()).compile(schema, {...options})` options object to guarantee this.

- > **Will you be able to implement it?**

  Given the core dev team's blessing, I'd be happy to take a stab at it if it doesn't require a massive restructuring of the existing compilation process. A cursory glance doesn't suggest it would be too painful.

#### Motivation

I'm using `ajv` in conjunction with [`json-schema-to-typescript`](https://github.com/bcherny/json-schema-to-typescript) to generate types from my schemas (a la [this blog post](https://spin.atomicobject.com/2018/03/26/typescript-data-validation/)), and compile validation functions from them. This gives great dual compile-time and runtime validation capabilities from a single authoritative source.

I would like to force consumers of the validation functions to use promises to continue operating on known good external data, including parameterizing the successfully returned promise value with the auto-generated type, rather than using the boolean return value API.

Today, I have to hack the `$async: true` key into the schema before compiling it to get this behavior, which require a little ugly mangling in typescript-land. It'd be much more convenient for this to be a developer-driven decision when compiling functions, in addition to a schema-driven one.

#### Implementation

While an option (`async: true`) at the compilation call site (`(new Ajv()).compile(schema, {...options})`) seems more relevant, that function doesn't currently accept options. Additionally, people desiring this option (for my use-case at least) will probably want promise-returning functions unilaterally anyways. So I think adding it to the global options list (`new Ajv({...options})`) is the simplest happy path for both user and implementation.