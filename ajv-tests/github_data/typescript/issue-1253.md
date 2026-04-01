# [1253] using "_opt.defaultMeta" in TypeScript

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v6.12.3

**Your typescript code**

```typescript
import metaSchema from 'ajv/lib/refs/json-schema-draft-04.json';

// create Ajv instance(ajv) and more code...
ajv._opts.defaultMeta = metaSchema.id;
...
```

**Typescript compiler error messages**

```
Property '_opts' does not exist on type 'Ajv'.
```

**Describe the change that should be made to address the issue?**
Add type definition for "_opt".
Please tell me If there are other solutions.

**Are you going to resolve the issue?**
I'll do this if a fix is ​​needed.