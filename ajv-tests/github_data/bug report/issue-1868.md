# [1868] JTDDataType don't work for schema with array type

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.8.2

**Your code**

```typescript
const schema = {
    type: "array",
    items: [{type: "number"}, {type: "string"}]
} as const;

type SchemaType = JTDDataType<typeof schema>
```

**Validation result, data AFTER validation, error messages**
```
>> SchemaType 
<< type SchemaType = unknown
```

**What results did you expect?**
```
>> SchemaType 
<< type SchemaType = (string | number)[]
```

**Are you going to resolve the issue?**
Probably, there are missed conditional type in `JTDDataDef` for 'array' like a `: S extends { type: "array", items:  infer E}`
https://github.com/ajv-validator/ajv/blob/master/lib/types/jtd-schema.ts#L199