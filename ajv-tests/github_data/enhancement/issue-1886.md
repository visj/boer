# [1886] Clarification: Ignoring symbol properties on schemas

**What version of Ajv you are you using?**

0.8.9

**What problem do you want to solve?**

Allow schemas to be augmented with non-serializable / non-enumerable symbol properties that avoid the need to `addKeyword(...)` when in `strict`. 

**What do you think is the correct solution to problem?**

AJV does currently ignore symbol properties, but it would be good to get clarification that AJV will continue to ignore symbol properties into the future.

**Will you be able to implement it?**

N/A

### Overview

Hi. I'm looking at options to be able to augment schemas with associative metadata while still technically being `strict` from AJV's standpoint. The approach I'm currently using is applying `symbol` properties to schemas, where the symbol properties are only enumerable via `Object.getOwnPropertySymbols(schema)`. Such schemas are of the form.

```typescript
const T = {
  type: 'object',
  properties: {
    A: { anyOf: [...], [Symbol(Kind)]: 'Union' },
    B: { type: 'object', allOf: [...], [Symbol(Kind)]: 'Intersect' },
    C: {
      type: 'string',
      [Symbol(Modifier)]: 'Readonly',
      [Symbol(Kind)]: 'String'
    }
  },
  required: [ 'A', 'B', 'C' ],
  [Symbol(Kind)]: 'Object'
}
```
The above seems to be fine from AJV's standpoint (in strict), but it would be good to get confirmation that implementing things this way isn't liable to cause problems into the future. The reasoning behind symbol usage here is that it ensures the metadata is both non-serializable, and essentially non-enumerable if using `Object.keys()` to inspect the schema.

I guess technically speaking, augmenting schemas in this way could be seen as working around `strict`, so wasn't sure if such an approach was advisable. I would be open to feedback on this approach, and if AJV may could potentially include symbol properties as part of strict checks into the future. 

Many Thanks
