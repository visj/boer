# [1447] Readonly arrays not handled properly

**What version of Ajv are you using? Does the issue happen if you use the latest version?** 7.1.0/master, yes

**Ajv options object**

```javascript
{}
```

**JSON Schema**

```json
{
  "additionalProperties": false,
  "properties": {
    "items": { "type": "array" },
  },
  "required": ["items"],
  "type": "object"
}
```

**Sample data**

```text
n/a
```

**Your code**

```typescript
interface TransactionInput {
  items: readonly { count: number, productId: string }[]
}

const transactionInputValidator = ajv.compile<TransactionInput>({
  additionalProperties: false,
  properties: {
    items: { type: 'array' }, // <--- Error: TS wants this to be "object"
  },
  required: ['items'],
  type: 'object'
})
```

**Validation result, data AFTER validation, error messages**

```text
n/a
```

**What results did you expect?**

TypeScript to allow it to be an array

**Are you going to resolve the issue?**

Yes