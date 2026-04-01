# [1983] Return type for compiled validators

Note: I'm not sure if this belongs here, as this is more a question but possibly a missing type.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Latest, yes

**Your typescript code**

I wanted to write a validation helper function that would wrap validators passed in with additional business logic. However, I cannot figure out what the returned type is from a `ajv.compile(schema)` command. I might be just missing it in the docs, but the [typescript example](https://ajv.js.org/guide/typescript.html) doesnt provide any hints. The [compile api reference](https://ajv.js.org/api.html#ajv-compile-schema-object-data-any-boolean-promise-any) indicates the return type as a function `(data: any): boolean`, but there must be some internal type representation of a compiled validator since the validator also has a unique property (`errors`). 

If such a type interface doesn't exist, could one be added? 

foo.ts
```typescript
import * as ajv from 'ajv';
import * as validatelib from 'validatelib';
const ajvLib = new ajv.default;

interface Foo {}  // some interface

const schema: ajv.JSONSchemaType<Foo> = {}   // some schema
const validator = ajv.compile(schema)  // What is the return type for this function?
doc = {}  // some associated document to be validated

validatelib.validate(doc, validator)
```
validatelib.ts
```typescript
export const validate(doc: object, validator: any) {
  if (validator(doc)) {
    return true;
  } else {
    console.warn(validator.errors) 
    return false;
  }
}
```