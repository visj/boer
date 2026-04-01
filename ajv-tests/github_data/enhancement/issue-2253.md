# [2253] TypeScript Construct type for JSONSchemaType

**What version of Ajv you are you using?**

8.12.0

**What problem do you want to solve?**

```
type MyData = JTDDataType<typeof schema>
```

for this

```
type MyData = JSONSchemaDataType<typeof schema>
```

so i don't need to write it multiple times.

**What do you think is the correct solution to problem?**

implement JSONSchemaDataType for JSONSchemaType

**Will you be able to implement it?**

I think no