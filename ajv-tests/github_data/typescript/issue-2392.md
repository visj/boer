# [2392] JSONSchemaType $ref doesn't work in array type.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v8.12.0
**Your typescript code**

```
import Ajv, { JSONSchemaType } from "ajv";

interface TypeA {
  valueA: TypeB[];
}

interface TypeB {
  valueB: string;
}

const SchemaA1: JSONSchemaType<TypeA> = {
  type: "object",
  required: ["valueA"],
  properties: {
    valueA: {
      type: "array",
      items: {
        $ref: "#/definitions/TypeB",
      },
    },
  },
  definitions: {
    TypeB: {
      type: "object",
      required: ["valueB"],
      properties: {
        valueB: {
          type: "string",
        },
      },
    },
  },
};
```

When I use `$ref` in array type, errors will occur.
After that, I looked at issues below and tried to change it, but it didn't work.

[JSONSchemaType does not work when $ref is used #1638](https://github.com/ajv-validator/ajv/issues/1638)
[The type definition of $ref not correctly resolve #1845](https://github.com/ajv-validator/ajv/issues/1845)

```
const SchemaA2: JSONSchemaType<TypeA> & {
  definitions: {
    TypeB: JSONSchemaType<TypeB>;
  };
} = {
  type: "object",
  required: ["valueA"],
  properties: {
    valueA: {
      type: "array",
      items: {
        $ref: "#/definitions/TypeB",
      },
    },
  },
  definitions: {
    TypeB: {
      type: "object",
      required: ["valueB"],
      properties: {
        valueB: {
          type: "string",
        },
      },
    },
  },
};
```

**Describe the change that should be made to address the issue?**
How can I compile and reference correctly in array type?

**Are you going to resolve the issue?**
No.