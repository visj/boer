# [1319] Inaccessible ErrorObject params in TypeScript

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Latest version.

**Your typescript code**

<!--
Please make it as small as posssible to reproduce the issue
-->

```typescript
const validationError: ajv.ValidationError = new ajv.ValidationError([{
    dataPath: ".someKey",
    keyword: "enum",
    params: { allowedValues: ["1", "2", "3"] },
    schemaPath: "",
}]);
validationError.errors[0].params.allowedValues; // TypeError, see below
```


**Typescript compiler error messages**

```
$ tsc --target ES5 --noImplicitAny --noEmit spec/typescript/index.ts
spec/typescript/index.ts:60:34 - error TS2339: Property 'allowedValues' does not exist on type 'ErrorParameters'.
  Property 'allowedValues' does not exist on type 'RefParams'.

60 validationError.errors[0].params.allowedValues;
```

**Describe the change that should be made to address the issue?**
I opened a Draft PR here: https://github.com/ajv-validator/ajv/pull/1318.

**Are you going to resolve the issue?**
I already did, needs review and a bit of help with validating the relationships between keywords and params.