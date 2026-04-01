# [1659] Using JSONSchemaType seems a huge build hog

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv@8.6.0

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';

interface UserRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  address?: string;
  city?: string;
  zip?: string;
}

const ajv = new Ajv({
  coerceTypes: true,
  useDefaults: true,
  removeAdditional: true,
});
addFormats(ajv);

const userValidationSchema: JSONSchemaType<UserRequestBody> = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string', format: 'email' },
    age: { type: 'number', minimum: 1, nullable: true },
    address: { type: 'string', nullable: true },
    city: { type: 'string', nullable: true },
    zip: { type: 'string', nullable: true },
  },
  required: ['firstName', 'lastName', 'email'],
};

const validateUser = ajv.compile(userValidationSchema);

export default validateUser;
```

**Typescript compiler error messages**
No compilation issues but build time increases drasticly, from around 1,5 secs to 11 secs

By using --generateTrace i discovered that is was related to `UncheckedJSONSchemaType` type.

Just changing to 

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

interface UserRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  address?: string;
  city?: string;
  zip?: string;
}

const ajv = new Ajv({
  coerceTypes: true,
  useDefaults: true,
  removeAdditional: true,
});
addFormats(ajv);

const userValidationSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string', format: 'email' },
    age: { type: 'number', minimum: 1, nullable: true },
    address: { type: 'string', nullable: true },
    city: { type: 'string', nullable: true },
    zip: { type: 'string', nullable: true },
  },
  required: ['firstName', 'lastName', 'email'],
};

const validateUser = ajv.compile<UserRequestBody>(userValidationSchema);

export default validateUser;
```

**Describe the change that should be made to address the issue?**

What can i do to assist or resolve this issue

**Are you going to resolve the issue?**
Not sure if i can help 🤷 