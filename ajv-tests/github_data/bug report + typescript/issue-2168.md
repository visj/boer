# [2168] LinkedList example in JTD docs gets typed as never after validation

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.2 (latest as of this writing)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```ts
import Ajv, { JTDSchemaType } from "ajv/dist/jtd";
const ajv = new Ajv();
```

**JTD Schema**

From https://ajv.js.org/json-type-definition.html#ref-schemas

```ts

type LinkedList = { val: number; next?: LinkedList };

const schema: JTDSchemaType<LinkedList, { node: LinkedList }> = {
  definitions: {
    node: {
      properties: {
        val: { type: "float64" }
      },
      optionalProperties: {
        next: { ref: "node" }
      }
    }
  },
  ref: "node"
};
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```ts
const data = { val: 1 } as LinkedList;
```

**Your code**

```ts
const validate = ajv.compile(schema);

if (validate(data)) {
  const next: LinkedList | undefined = data.next;
  console.log(next);
}
```

https://replit.com/@ento/IntrepidIndolentOutput#linkedlist.ts

^`strictNullChecks` is enabled in `tsconfig.json`

```json
		"strictNullChecks": true, 
```


**Validation result, data AFTER validation, error messages**

```
// on data.next
Property 'next' does not exist on type 'never'.
```

**What results did you expect?**

I expected the type of `data` to be `LinkedList` after being narrowed by `validate(data)`

**Are you going to resolve the issue?**

I was exploring how JTDSchemaType works and noticed that the example in the documentation doesn't seem to work. I'm not in immediate need for this to work.