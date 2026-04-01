# [1773] Typescript code examples are broken

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I just installed Ajv and using the latest version

**Ajv options object**

I don't use this

I tried to run the example code(s) from the [official website](https://ajv.js.org/guide/typescript.html) but I get compile errors.

If I try to do this:

```ts
import Ajv, {JTDDataType} from "ajv/dist/jtd"
```

I get `Cannot find module 'ajv/dist/jtd' or its corresponding type declarations.`

If I try the another example that's supposed to work with Typescript:

```ts
import Ajv, {JSONSchemaType} from "ajv"
```

I get `Module '"ajv"' has no exported member 'JSONSchemaType'`.

What am I doing wrong?

I installed with

```
npm install ajv
```