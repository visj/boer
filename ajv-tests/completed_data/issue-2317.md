# [2317] `JSONSchemaType<T>` with simple typescript array is marking the schema as invalid.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

```
"ajv" : "^8.12.0",
"ajv-formats" : "^2.1.1",
"@types/ajv" : "^1.0.0",
"typescript" : "^5.1.6"
```

**Ajv options object**

```javascript

{
  strict         : true,
  useDefaults    : true,
  coerceTypes    : true,
  allowUnionTypes: true
}

```

**JSON Schema**

```json
{
  "$id": "test",
  "type": "object",
  "required": ["users"],
  "properties": {
    "users": {
      "type": "array",
      "items": {
        "type": "number"
      }
    }
  }
}

```

**Your code**

```typescript
interface Test {
  users: number[];
}

const schema: JSONSchemaType<Test> = {
  $id       : 'test',
  type      : 'object',
  required  : ['users'],
  properties: {
    users: {
      type : 'array',
      items: {
        type: 'number'
      }
    }
  }
};

```

**Validation result, data AFTER validation, error messages**

type `JSONSchemaType<Test>` gets marked in red with an error, see image: https://imgur.com/a/HgyLbLI.

Only gets away adding `oneOf`, `anyOf` to the schema, like this:

```typescript
const schema: JSONSchemaType<Test> = {
  $id       : 'test',
  type      : 'object',
  required  : ['users'],
  properties: {
    users: {
      type : 'array',
      items: {
        type: 'number'
      }
    }
  },
  oneOf     : []
};
``` 

see image: https://imgur.com/a/p0veF7v

Also, if you add `as any` in the property definition without `anyOf` or `oneOf`, the error goes away too:

```typescript
const schema: JSONSchemaType<Test> = {
  $id       : 'test',
  type      : 'object',
  required  : ['users'],
  properties: {
    users: {
      type : 'array',
      items: {
        type: 'number'
      }
    } as any
  }
};
```

**What results did you expect?**

`JSONSchemaType<Test>` should not mark the schema with an invalid type, it should work without adding `oneOf` or `anyOf`.

**Are you going to resolve the issue?**

No, sorry.
