# [2345] Cannot set logger: false in call to constructor

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv@8.12.0

**Your typescript code**

```typescript
import Ajv from 'ajv';
const options = {strict: false, validateSchema: false, logger: false};
const ajv = new Ajv(options);
```

**Typescript compiler error messages**

```
content/endpoint-manager.ts:3:21 - error TS2345: Argument of type '{ strict: boolean; validateSchema: boolean; logger: boolean; }' is not assignable to parameter of type 'Options'.
  Type '{ strict: boolean; validateSchema: boolean; logger: boolean; }' is not assignable to type 'CurrentOptions'.
    Types of property 'logger' are incompatible.
      Type 'boolean' is not assignable to type 'false | Logger'.

3 const ajv = new Ajv(options);
```

The following code compiles without error:
```typescript
import Ajv from 'ajv';
const ajv = new Ajv({strict:false, validateSchema: false, logger: false});
```

This one also:
```typescript
import Ajv from 'ajv';
declare const Components: any;
Components.utils.import('resource://gre/modules/Console.jsm');

const options = {strict: false, validateSchema: false, logger: console};
const ajv = new Ajv(options);
```



**Describe the change that should be made to address the issue?**
Accept `false` as setting for logger as described in the documentation: 
https://ajv.js.org/options.html#logger

**Are you going to resolve the issue?**
Sorry, I do not know how.