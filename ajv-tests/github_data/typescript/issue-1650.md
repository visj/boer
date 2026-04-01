# [1650] Incorrect type definition in ```json-schema.d.ts```

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Checked on ```"ajv": "^8.6.0"```

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->
In library file ```json-schame.d.ts```
```typescript
declare type StrictNullChecksWrapper<Name extends string, Type> = undefined extends null ? `strictNullChecks must be true in tsconfig to use ${Name}` : Type;

```

**Typescript compiler error messages**
Used ```"tsc": "^2.0.3"```
```
yarn run v1.22.10
$ yarn run build:compile && yarn run build:copyfiles
$ tsc
node_modules/ajv/dist/types/json-schema.d.ts:1:92 - error TS1005: '?' expected.

1 declare type StrictNullChecksWrapper<Name extends string, Type> = undefined extends null ? `strictNullChecks must be true in tsconfig to use ${Name}` : Type;
                                                                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

node_modules/ajv/dist/types/json-schema.d.ts:1:151 - error TS1005: ';' expected.

1 declare type StrictNullChecksWrapper<Name extends string, Type> = undefined extends null ? `strictNullChecks must be true in tsconfig to use ${Name}` : Type;
                                                                                                                                                        ~


Found 2 errors.

error Command failed with exit code 2.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
error Command failed with exit code 2.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.

```
> Strange, but ```ts-node``` runs that code as expected.

**Describe the change that should be made to address the issue?**
Fix types  to use with ```tsc```.

**Are you going to resolve the issue?**
