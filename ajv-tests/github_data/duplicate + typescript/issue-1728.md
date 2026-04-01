# [1728] recursive elements in arrays

I started my recursion with the tree sample and it works for properties referring to objects but it fails for arrays.
But the types validation does not work. 
The schema itself compiles and works as expected if it is not typed.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.2
**Your typescript code**
4.3.5

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
import { JSONSchemaType } from "ajv";

export interface IList {
    children?: IList[];

}

// const schema = {
const schema: JSONSchemaType<IList> = {
    $ref: "#/$defs/list",
    $defs: {
        list: {
            type: "object",
            properties: {
                children: {
                    type: "array",
                    items: { $ref: "#/$defs/list" },
                    nullable: true
                }
            },
            additionalProperties: false
        }
    }
};
```

**Typescript compiler error messages**

```
Type '"object"' is not assignable to type '"array" | undefined'.ts(23
```

**Describe the change that should be made to address the issue?**
I want to have a typed version of the schema.

**Are you going to resolve the issue?**
No


