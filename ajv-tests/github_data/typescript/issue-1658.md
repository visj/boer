# [1658] JTDSchema with generics

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`8.6.0`. Yes.

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
import { JTDSchemaType } from 'ajv/dist/jtd'

type PropType = 'a' | 'b' | 'c'

type Obj<T extends PropType> = {
    type: T
}

// fails
function getObjSchema<T extends PropType>(propType: T): JTDSchemaType<Obj<T>> {
    return {
        properties: {
            type: { enum: [propType] },
        },
    }
}

// passes
function getObjSchemaA(propType: 'a'): JTDSchemaType<Obj<'a'>> {
    return {
        properties: {
            type: { enum: [propType] },
        },
    }
}
```

**Typescript compiler error messages**

```
Type '{ properties: { type: { enum: T[]; }; }; }' is not assignable to type 'JTDSchemaType<Obj<T>, Record<string, never>>'.
  Type '{ properties: { type: { enum: T[]; }; }; }' is not assignable to type '[undefined extends T ? never : "type"] extends [never] ? { properties?: Record<string, never> | undefined; } : { properties: { [K in undefined extends T ? never : "type"]: JTDSchemaType<Obj<T>[K], Record<...>>; }; }'.ts(2322)
```

**Describe the change that should be made to address the issue?**
Not sure.

**Are you going to resolve the issue?**
No.
