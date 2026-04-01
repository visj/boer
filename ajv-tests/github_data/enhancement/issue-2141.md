# [2141] Codegen: allow passing import symbols for deserialized schemas

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.11.0
**What problem do you want to solve?**
Remove redundancy of in-lining the de-serialized schemas, if only because my codegen setup already in-lines them as a separate module. So I'd rather prefer AJV codegen using references to them, instead of putting everything into the final module. Will also reduce the diffs for codegen operations, as I ended up in a situation where a change in a single utility schema ended up changing 80+ files.
**What do you think is the correct solution to problem?**
Add an optional `refModuleMap` key to the `CodeOptions` which would involve these types:
```typescript
/**
 * A map of `"$ref"`s and their related module import data.
 * The key is a `"$ref"` value.
 */
interface IRefModuleMap extends Map<string, IModuleImport> {}

interface IModuleImport {
  /**
   * The imported symbol name.
   */
  name: string
  /**
   * The alias of the symbol.
   */
  alias?: string
  /**
   * The path to the module.
   */
  path: string
}
```

I don't know the specifics of the AJV codegen, but looking at the output and its indexed symbol names it does look like it keeps track of the scope's namespace to avoid collisions. Due to imports being the first thing in the module, the procedure would only require checking for the existence of the module map at the start. Then it would generate import statements for the related refs to the module and insert the names/aliases to the scope. At this point the rest of the logic won't change.
Due to it being an optional addition I think it will be a minor version increase at most.
**Will you be able to implement it?**
If it works the way I described above, sure.