# [2030] JSONSchemaType allows schemas with optional attributes for Types where they are required

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Using 8.11.0 (latest)

**Ajv options object**

No options are set
```javascript
export const ajv = new Ajv();
```

**JSON Schema**

```javascript
interface MyExample {
  foo: number;
}
const myExampleSchema: JSONSchemaType<MyExample> = {
  type: 'object',
  properties: {
    foo: {
      type: 'number',
      nullable: true,
    },
  },
  required: [],
}
```

**Validation result, data AFTER validation, error messages**

No static analysis issues come out of TypeScript -- it's considered a valid schema for that type.

**What results did you expect?**

I expected a TypeScript error saying something along the lines of `"foo?" is incompatible with type "foo"`

**Are you going to resolve the issue?**

I don't think I know how to, but happy to make an effort if this is indeed a valid bug.