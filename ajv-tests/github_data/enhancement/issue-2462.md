# [2462] Register custom validator without modifying the input schema

I've done a little searching but couldn't spot this raised or covered anywhere.

**What version of Ajv you are you using?**

``` 
8.16.0
```

**What problem do you want to solve?**

I'd like to add a custom validator to an existing schema without modifying the definition which I don't control. This would augment any validation already present on that schema.

**What do you think is the correct solution to problem?**

Something similar to `avj.addKeyword(...)` but instead add a validator targeting a specific schema path that's been registered with the `avj` instance.

```typescript
avj.compile(jsonSchemaDefinitions);
avj.addValidator({
  // firstName having an inline schema
  schemaPath: '#/definitions/Account/properties/firstName',
  validate: (schema, data) => {
    // custom validation here
    return true;
  },
  errors: false,
})

const validate = avj.getSchema('#/definitions/Account');
validate({ firstName: "james" });
```

**Will you be able to implement it?**

No bandwidth currently