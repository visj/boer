# [2116] JSON Schema exemple not working with jest

**ajv version: "^8.11.0"**

### It doesn't even compile :(

//schema.spec.ts
```typescript
test('', async () => {
    interface MyData {
      foo: number
      bar?: string
    }

    const schema: JSONSchemaType<MyData> = {
      type: 'object',
      properties: {
        foo: { type: 'integer' },
        bar: { type: 'string', nullable: true }
      },
      required: ['foo'],
      additionalProperties: false
    }

    // validate is a type guard for MyData - type is inferred from schema type
    ajv.compile(schema)
 })
```

Console:

schema is invalid: data/type must NOT have additional properties, data must have property 'ref', data/type must be equal to one of the allowed values, data must have property 'enum', data must have property 'elements', data/properties/foo/type must NOT have additional properties, data/properties/foo must have property 'ref', data/properties/foo/type must be equal to one of the allowed values, data/properties/foo must have property 'enum', data/properties/foo must have property 'elements', data/properties/foo must have property 'properties', data/properties/foo must have property 'optionalProperties', data/properties/foo must have property 'discriminator', data/properties/foo must have property 'values', data/properties/foo must match a schema in union, data must have property 'optionalProperties', data must have property 'discriminator', data must have property 'values', data must match a schema in union
