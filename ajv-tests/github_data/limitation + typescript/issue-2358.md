# [2358] JTDSchemaType derivation for enums is too strict


**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.12.0

**Ajv options object**

none

**Your code**

```javascript
type AB = 'a' | 'b'
const s1 = { enum: ['a', 'b'] } as const
const enum1: JTDSchemaType<AB> = s1
// error: The type 'readonly ["a", "b"]' is 'readonly' and cannot be assigned to the mutable type 'AB[]'.
```

**What results did you expect?**

Assignment should be possible.

**Are you going to resolve the issue?**
I can prepare a PR