# [425] Type Definitions: Missing AJV Options

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
4.11.2 Yes

TypeScript complains about the options passed to AJV constructor.
[interface Options](https://github.com/epoberezkin/ajv/blob/master/lib/ajv.d.ts#L115) does not have `extendRefs?:boolean` and `sourceCode?:boolean` properties defined.