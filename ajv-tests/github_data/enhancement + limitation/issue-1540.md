# [1540] AllRequired triggers "strict mode: required property "<prop>" is not defined" in strict mode

AJV v8.0.5
Ajv-keywords v5.0.0

**Options**
```
const ajv = new Ajv({
  strict: true, // <<<<<
  strictTuples: false,
  allErrors: true,
  verbose: true,
  coerceTypes: true,
  $data: true,
  useDefaults: true,
  allowUnionTypes: true,
});

// ... other plugins
ajvKeywords(ajv);
```

**Schema** 
```
{
  type: 'object',
  additionalProperties: false,
  allRequired: true,
  properties: {
    units: {
      type: 'object',
      allRequired: true,
      additionalProperties: false,
      properties: {
        holeSizeFrom: {
          type: 'string',
        },
        // ... other required props
      }
    },
  },
};
```

**Error on compilation** 
```
Error: strict mode: required property "holeSizeFrom" is not defined at "..longPath/properties/units/allRequired" (strictRequired)
```

When `allRequired: true` replaced with `required: ['holeSizeFrom', //... more props]` everything compiles fine.