# [2381] Default export broken for typescript moduleResolution node16

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.12.0

**Your code**
```json5
// tsconfig.json
{
    // ...
    "compilerOptions": {
        "module": "node16",
        "moduleResolution": "node16",
        // ...
    }
}
```

```typescript
import Ajv from 'ajv';

const ajv = new Ajv();
```

**What results did you expect?**
No TS error is thrown.

**Actual result:**
```
error TS2351: This expression is not constructable.
  Type 'typeof import("[project]/node_modules/.pnpm/ajv@8.12.0/node_modules/ajv/dist/ajv")' has no construct signatures.

6 const ajv = new Ajv();
                  ~~~
```

I saw https://github.com/ajv-validator/ajv/issues/2204, but it doesn't look like it was resolved in that issue.  This is an issue with how ajv exports its types: https://arethetypeswrong.github.io/?p=ajv%408.12.0

I can provide a reproduction in a sample project but it should be fairly easy to reproduce.
