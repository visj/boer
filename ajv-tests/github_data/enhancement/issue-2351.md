# [2351] How can I iterate over a JSON Schema using typescript?

I would like to implement a typescript function called `iterateAllOfJsonSchema`.

```ts
const iterateAllOfJsonSchema = (schema: GenericSchema) => {
  Object.entries(schema).reduce((acc, cur) => {
    if (cur.type === 'string') {  // <-- Can I get typescript intellisense here?
      // do stuff if string...
    } else if (cur.type === 'object') {
      // do stuff if object...
    }
   // ...etc
  })
}
```

Can I import a type similar to `GenericSchema` from Ajv? If not, where can I import it from? If it can't be imported, where can I begin to read the definitions so I can implement it myself? How do I make sure that the version of JSON Schema in the type `GenericSchema` is the same as the type exported from Ajv?

-----

I tried importing `JSONSchema7` from [json-schema](https://www.npmjs.com/package/json-schema). But how can I know that 7 is the correct version matching Ajv? And is this library official?

```
import {JSONSchema7} from 'json-schema'
```

-----

The ultimate goal is to create a React library, where I use the JSON Schema's of each component to show the `props` in a web view. Thus, I need to 'loop' over the JSON Schema.