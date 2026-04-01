# [1636] Compiling issue when using typescript version 3.9.7

Bug: 

```
declare type StrictNullChecksWrapper<Name extends string, Type> = undefined extends null ? `strictNullChecks must be true in tsconfig to use ${Name}` : Type;
```

[Those](https://github.com/ajv-validator/ajv/blob/5378ab968e3b442e131e939ae3eb277c47b6f9e5/lib/types/json-schema.ts#L1-L4) lines of code failed to compile with typescript.

Error:

```
node_modules/ajv/dist/types/json-schema.d.ts:1:92 - error TS1005: '?' expected.
```

The actual [lines](https://github.com/ajv-validator/ajv/blob/5378ab968e3b442e131e939ae3eb277c47b6f9e5/lib/types/json-schema.ts#L1-L4) 

**_See attach images._**

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

When try to upgrade to version  >= 9.0.0 the error appears.
Everything work well on version >= 7.5.0

typescript version: 3.9.7
ajv version 8.5.0

Commit -> https://github.com/ajv-validator/ajv/commit/5cccbdf09772e9cec84969f272faca34b043c06f


**What results did you expect?**

That typescript will be able to compile my code.

**Are you going to resolve the issue?**

Compile issues.


<img width="1458" alt="Screen Shot 2021-06-03 at 17 02 49" src="https://user-images.githubusercontent.com/66903788/120657835-883c0600-c48d-11eb-8499-4e093f81d284.png">

<img width="1539" alt="Screen Shot 2021-06-03 at 17 04 06" src="https://user-images.githubusercontent.com/66903788/120658001-b7527780-c48d-11eb-8f5b-3c4ff4ca80b5.png">



