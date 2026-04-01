# [2181] JTD compileSerializer and compileParser failure with optionalProperties

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`8.11.2`: the latest version

**Ajv options object**
`{}`

**Your code**

```typescript
import Ajv, { JTDSchemaType } from "ajv/dist/jtd";
const ajv = new Ajv();

interface TestObject {
  first?: string;
  second?: string;
}

const testSchema: JTDSchemaType<TestObject> = {
  optionalProperties: {
    first: { type: "string" },
    second: { type: "string" },
  },
};

const serialize = ajv.compileSerializer(testSchema);
const parse = ajv.compileParser(testSchema);

const obj = { second: "test" };

const serializedObj = serialize(obj);
const parsedObj = parse(serializedObj);

console.log(serializedObj);
console.log(parsedObj);
console.log(parse.message, parse.position);
```

**Output**

```
{,"second":"test"}
undefined
unexpected token , 1
```

**What results did you expect?**
The serializer should create json code without the erroneous `,`.

```json
{"second":"test"}
```

**Are you going to resolve the issue?**
I will look into it, but I haven't found the source of the issue yet.