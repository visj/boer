# [2529] config option for `$comment` is showing incorrect type differs from documentation

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
latest: 8.17.1

**Your typescript code**
```typescript
//defining the options config
const ajv = new Ajv({
  ...
  $comment:         false,
  ...
});
```

**Typescript compiler error messages**
```
Type 'false' is not assignable to type 'true | ((comment: string, schemaPath?: string | undefined, rootSchema?: AnySchemaObject | undefined) => unknown) | undefined'
```

**Describe the change that should be made to address the issue?**
Not sure what is the source of truth here or the expected behavior.
The documention for the [$comment](https://ajv.js.org/options.html#comment) states
```
Option values:

    false (default): ignore $comment keyword.
    true: log the keyword value to console.
    function: pass the keyword value, its schema path and root schema to the specified function
```
But the type does not contain 'false' as an  option. 

**Are you going to resolve the issue?**
Not sure. If the documentation is correct, then update the type. If documentation is incorrect, update documentation. 
