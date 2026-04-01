# [1769] where to find example to use user defined format?

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.3
**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
ajv.addFormat('identifier', /^a-z\$_[a-zA-Z$_0-9]*$/)
```

**Typescript compiler error messages**

```
but how to use the above defined format 'identifier'?
```

**Describe the change that should be made to address the issue?**
Add some example to document.
**Are you going to resolve the issue?**
I have studied one whole day but  can not find the answer.