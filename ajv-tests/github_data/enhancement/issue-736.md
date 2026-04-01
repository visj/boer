# [736] Feature request: type-aware validation functions

**What version of Ajv you are you using?**
6.2.1

**What problem do you want to solve?**
Make better use of TypeScript types with AJV. 

We're using [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript) to generate typescript types from our JSON schemas. To use these, we're currently creating [type guard](https://basarat.gitbooks.io/typescript/docs/types/typeGuard.html) functions that use the schema to validate a value as an unknown shape. If the schema validates, we know that the typescript type is accurate. Right now this is a manual process, because AJV doesn't provide a mechanism to tie a typescript type to a ValidateFunction when compiling a schema.

**What do you think is the correct solution to problem?**

Provide a way to `compile<SomeType>(mySomeTypeSchema)` which returns a `ValidateFunction<T>`, which might look something like `(data: any,...) => data is T`. Using this validate function in an if statement would then let TypeScript automatically cast `data` to `T` within the then branch without an explicit cast.

This might look something like

1. Change `ValidateFunction` to `ValidateFunction<T=any>` and the return type to `data is T`
2. Change `compile` and other functions that return `ValidateFunction` to e.g. `compile<T=any>(schema: object | boolean): ValidateFunction<T>`;

The complication is the return type of `data is T | Thenable<any>`. Since TypeScript doesn't know which you have statically, this doesn't get you all the way there. It does work if you remove the `Thenable<any>` return type option. Solving this will require either a more nuanced modelling of the types – perhaps dividing `ValidateFunction` from `AsyncValidateFunction` or providing a few overloads for `ValidateFunction` may solve it, though I admit I haven't looked that closely enough to know for sure.


**Will you be able to implement it?**

I'd be happy to help translate example use cases in to type signatures. Time to get deep enough familiarity with AJV is the main limiting factor to putting making the changes entirely myself.