# [1555] Validating multipart/formData type file

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.11.0, yes

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->
I'm trying to use AJV to validate a multipart/formData that has a file in one of its properties. This is the formData Body (Below)
```typescript

{
  title: 'check formData parameters',
  schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    file: { type: 'file' },
    size: { type: 'string', minLength: 1 },
    isExpired: { type: 'boolean' },
    description: { type: 'string', minLength: 1 }
  },
  required: [ 'size', 'isExpired', 'description' ],
  additionalProperties: true
}
```

**Typescript compiler error messages**

```
fileis invalid: data.properties['file'].type should be equal to one of the allowed values, data.properties['file'].type should be array, data.properties['file'].type should match some schema in anyOf
```

**Describe the change that should be made to address the issue?**
Address validating files with ajv

**Are you going to resolve the issue?**
No