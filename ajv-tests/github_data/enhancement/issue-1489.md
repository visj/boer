# [1489] JTDDataType signature for compile and verify

**What version of Ajv you are you using?**

master (7 or 8)

**What problem do you want to solve?**

Add signatures to `AjvJTD`'s `compile` and `verify` methods that would support something like:
```
const schema = { ... } as const
const verify = ajv.compile(schema)
if (verify(data)) {
    const typed: JTDDataType<typeof schema> = data // no type errrors
}
```

**What do you think is the correct solution to problem?**

Note entirely sure, opening this up for discussion, versus continuing to talk on PR #1458.

I've been looking at how to do this, and I'm starting by implementing `SomeJTDSchemaType` and modifying the signature of compile. Previously I remember talking about having the AjvJTD subclass have different type arguments from the core Ajv class. I vaguely remember you not wanting to. Is there a reason you don't want to do this? Is there a significant cost to the `super` call?

**Will you be able to implement it?**

Yes