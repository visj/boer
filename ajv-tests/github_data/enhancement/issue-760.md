# [760] [typescript] Format validators need to take a string

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest

**Your code**

```ts
ajv.addFormat({
    type: 'number',
    validate: (x: number) => x < 10
});
```

**What results did you expect?**

This should compile, but it doesn't, because [FormatValidator](https://github.com/epoberezkin/ajv/blob/master/lib/ajv.d.ts#L162-L168) needs to take a string as a parameter, and because FormatDefinition is not allowed to have a "type" field.

**Are you going to resolve the issue?**

Yes.  PR incoming.  :)