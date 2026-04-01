# [1930] Still hitting `strictNullChekcs must be true in tsconfig`

I am still hitting the error from https://github.com/ajv-validator/ajv/issues/1650 and can't pass over it.

Environment:
```
~ npm list | grep ajv
├── ajv@8.4.0
~ npm list | grep tsc
├── tsc@2.0.4

~ cat tsconfig.json | grep strictNullCheck
    "strictNullChecks": true,
```

The ouput of `npm run build`:

```
 ~/g/a/2/c/awsiam-configrepo-aws-ppb   *…  cdk  npm run build

> awsiam-aws-app@0.1.0 build
> tsc

node_modules/ajv/dist/types/json-schema.d.ts:1:92 - error TS1005: '?' expected.

1 declare type StrictNullChecksWrapper<Name extends string, Type> = undefined extends null ? `strictNullChecks must be true in tsconfig to use ${Name}` : Type;
                                                                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

node_modules/ajv/dist/types/json-schema.d.ts:1:151 - error TS1005: ';' expected.

1 declare type StrictNullChecksWrapper<Name extends string, Type> = undefined extends null ? `strictNullChecks must be true in tsconfig to use ${Name}` : Type;
                                                                                                                                                        ~


Found 2 errors.
```



I am going to close comments on this issue - it is not really defined what this issue was, and the issue may be that you simply have an incorrect schema or that JSONSchemaType has limitations and cannot be used in your case.

Please submit a new issue with a full code sample from a clear repository once you've checked the following:

1. strict mode is enabled in tsconfig.json (or at least strictNullChecks)
2. TS version is >= 4.2.3
3. you are importing the latest Ajv version (sometimes calling `npm install ajv` may install the previous version because some other dependency uses it - use `npm install ajv@8` and try clean install: `rm -rf node_modules && npm I`
4. check that your schema is indeed valid - that required properties are listed in "required", that optional properties have `nullable: true`, that "type" is set in all schemas - in many cases what was reported as JSONSchemaType issue was a user error where their schema was incorrect - it correctly shown compilation error.
5. Check other open issues related to JSONSchemaType - there are some known limitations.

A simple temporary workaround to use Ajv without using JSONSchemaType - it is optional.

_Originally posted by @epoberezkin in https://github.com/ajv-validator/ajv/issues/1650#issuecomment-871369910_