# [2405] additionalProperties shouldn't affect TypeScript types from JTDDataType

**What version of Ajv you are you using?**
8.12.0

**What problem do you want to solve?**
I would like stronger type checking on types returned from JTDDataType. 

**What do you think is the correct solution to problem?**
JTDDataType should return a type as though `additionalProperties` is always false.

The needs of the two scenarios are different:

- In schema validation: Most of the time, it's ok if a schema contains extra information. Downstream consumers of a JS object can just ignore extra fields. They don't even have to know it's there.
- In type-checking code: If an object is relied on to have certain fields, they must be present in the declared interface. If code relies on more than is the interface, TypeScript will assist the programmer and indicate a potential problem.

The JTDDataType utility tries to bridge two worlds: generating types from schemas, which is great. But adding `& Record` to the end of such generated types seems to break useful, default-case type checking.

There is a workaround, but it feels icky for what seems like the default case:

```
const STRONG_MY_JTD_SCHEMA = { ...MY_JTD_SCHEMA, additionalProperties: false }
type MyType = JTDDataType<typeof STRONG_MY_JTD_SCHEMA>
```

**Will you be able to implement it?**

Not sure.

Presumably, the `& Record` needs removed from the type that's output. But I'm unsure of the related consequences of such a change.

Thank you for the great tool and your consideration of this feedback.
