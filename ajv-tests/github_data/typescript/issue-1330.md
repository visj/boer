# [1330] Can't compile typescript code 


**What version of Ajv are you using? Does the issue happen if you use the latest version?**

7

**Your typescript code**
```typescript

import Ajv from 'ajv';
    const ajv = new Ajv();
      const validate = ajv.compile(schema);
      const valid = validate(row);
      if (valid) {
        return true;
      } else {
        console.log(validate.errors);
        return false;
      }

```

**Typescript compiler error messages**
Running  tsc to compile my code I get lots of errors, snippet of them here

```
node_modules/ajv/dist/core.d.ts:34:16 - error TS2304: Cannot find name 'Vocabulary'.

34     keywords?: Vocabulary;
                  ~~~~~~~~~~

node_modules/ajv/dist/core.d.ts:35:15 - error TS2304: Cannot find name 'AnySchema'.

35     schemas?: AnySchema[] | {
                 ~~~~~~~~~

node_modules/ajv/dist/core.d.ts:36:24 - error TS2304: Cannot find name 'AnySchema'.

36         [key: string]: AnySchema;
                          ~~~~~~~~~

node_modules/ajv/dist/core.d.ts:39:43 - error TS2304: Cannot find name 'AnySchemaObject'.

39     loadSchema?: (uri: string) => Promise<AnySchemaObject>;
                                             ~~~~~~~~~~~~~~~

node_modules/ajv/dist/core.d.ts:46:12 - error TS2304: Cannot find name 'SchemaObject'.

46     meta?: SchemaObject | boolean;
              ~~~~~~~~~~~~

```

**Describe the change that should be made to address the issue?**

**Are you going to resolve the issue?**
