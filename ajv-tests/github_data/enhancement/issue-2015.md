# [2015] Distribute ajv with pure esm using Conditional Exports

**What version of Ajv you are you using?**
8.11.0

**What problem do you want to solve?**
Can not using Ajv as pure ESM package. It looks it is currently distributed as CommonJS module.

**What do you think is the correct solution to problem?**
According to the [nodejs documentation](https://nodejs.org/dist/latest-v16.x/docs/api/packages.html#conditional-exports):
>Conditional exports provide a way to map to different paths depending on certain conditions. They are supported for both CommonJS and ES module imports.

Maybe we can adopt this solution.

**Will you be able to implement it?**
Yes.
