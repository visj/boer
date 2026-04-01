# [1984] Cannot use typescript validation with const fields in schema

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.0, yes
in case it's relevant, I'm using typescript 4.5.2

**Your code**

```typescript
import Ajv, {JSONSchemaType} from "ajv"
const ajv = new Ajv()

interface Foo {
  constantValue: 'FOO'
}

const schema: JSONSchemaType<Foo> = {
  type: 'object',
  properties: {
    constantValue: {
      const: 'FOO'
    }
  }
}
```

This will cause a typescript compilation error:
```
Type '{ type: "object"; properties: { name: { const: "FOO"; }; }; }' is not assignable to type 'UncheckedJSONSchemaType<Foo, false>'.
  The types of 'properties.name' are incompatible between these types.
    Type '{ const: "FOO"; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<"FOO", false> & { const?: "FOO" | undefined; enum?: readonly "FOO"[] | undefined; default?: "FOO" | undefined; })'.
      Type '{ const: "FOO"; }' is not assignable to type '{ type: "string"; } & StringKeywords & { allOf?: readonly UncheckedPartialSchema<"FOO">[] | undefined; anyOf?: readonly UncheckedPartialSchema<"FOO">[] | undefined; ... 4 more ...; not?: UncheckedPartialSchema<...> | undefined; } & { ...; } & { ...; }'.
        Property 'type' is missing in type '{ const: "FOO"; }' but required in type '{ type: "string"; }'.
```

**What results did you expect?**
Typescript would compile without issues.