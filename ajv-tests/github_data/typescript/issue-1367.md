# [1367] OneOfError#passingSchemas can be null but not marked as such in types

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest

**Your typescript code**

<!--
Please make it as small as posssible to reproduce the issue
-->

```typescript
const oneOfError = (): OneOfError => ({
  keyword: 'oneOf',
  dataPath: '',
  schemaPath: '#/oneOf',
  params: { passingSchemas: null },
  message: 'should match exactly one schema in oneOf'
});
```

**Typescript compiler error messages**

```
TS2322: Type 'null' is not assignable to type '[number, number]'.
```

However, this isn't true:

```
> var validator = new Ajv().compile({ oneOf: [{required: ['p']}]})
strict mode: missing type "object" for keyword "required" at "#/oneOf/0" (strictTypes)
undefined
> validator({}); validator.errors
[
  {
    keyword: 'required',
    dataPath: '',
    schemaPath: '#/oneOf/0/required',
    params: { missingProperty: 'p' },
    message: "should have required property 'p'"
  },
  {
    keyword: 'oneOf',
    dataPath: '',
    schemaPath: '#/oneOf',
    params: { passingSchemas: null },
    message: 'should match exactly one schema in oneOf'
  }
]
>
```

**Describe the change that should be made to address the issue?**

I think that this is a bug with the types, as I'd expect the library to be throwing if it wasn't already expecting this to be null (or its not using the property itself, in which case still a bug in the types).

So I think it just needs to be marked as `| null`

**Are you going to resolve the issue?**

If I have the time and the issue is still around - got a lot on right now, but very excited about the new typescript-powered version 😍 

I'd hope this is just a matter of adding `| null` but have not opened a PR doing that yet as I've not had the time to dive further into the library and it could require new "not null" checks to be added in the codebase to make TS happy.
