# [2269] Support different ajv options for each schema

**What version of Ajv you are you using?**
8.12.0

**What problem do you want to solve?**
Currently is not possible to assign different compilation options to each specific schema. For example turning type coercing or allErrors.

I'm building a Vite/rollup plugin to compile json schemas using Ajv and I want to allow users to define different options on each schema on the same Ajv instance(so references can work)

**What do you think is the correct solution to problem?**
I could think of two solutions for this but all has their own drawbacks and IMO this will not work well in my usecase
- I could set ajv.options on each compile call and assign the old options back. This will works with refs but all the refs will have the same options(even if the referenced schema has different options)
- Creating a new ajv instance with different options but this will not work completely with refs and I will have to sync the different instances

**Will you be able to implement it?**
Of course I will help if it's necessary