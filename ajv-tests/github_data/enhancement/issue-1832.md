# [1832] Migration from v6 to v8: ValidationError isn't exposed anymore

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I was using 6, I wanted to migrate to 8.

**Ajv options object**

N/A

**JSON Schema**

N/A

**Your code**

In v6 I could write code like:

```typescript
import {ValidationError} from 'ajv';
function formatAjvError(error: ValidationError): CustomErrorDto {}
```

In v8 I must write:
```typescript
import Ajv from 'ajv';
function formatAjvError(error: InstanceType<typeof Ajv['ValidationError']>): CustomErrorDto {}
```

This is  unnecessary verbose.

**What results did you expect?**

`ValidationError` is directly exported from `ajv` module.

**Are you going to resolve the issue?**

Yes, I can make PR for that.