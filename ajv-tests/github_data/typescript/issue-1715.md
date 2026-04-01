# [1715] JSONSchemaType allows omission of required members

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
* Ajv v8.6.2
* TypeScript 4.3.5

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

When defining a `JSONSchemaType`, members that are required in the argument type are not required to be included in the `required` array of the schema. This means that a schema is considered valid that allows the omission of required properties.
The result type of `ajv.compile` is a type guard of the argument type to `JSONSchemaType` but I believe this to be misleading, since data passes the validation that is not actually of the correct type.

```typescript
import Ajv, { JSONSchemaType } from 'ajv';

const ajv = new Ajv({});

type Example = {
    kek: number;
};

const schema: JSONSchemaType<Example> = {
    type: 'object',
    properties: {
        kek: {
            type: 'number',
        },
    },
    required: [
        // Empty!
    ],
};

const data = {
    // No `kek` field. This is not a valid `Example` instance.
};

// `validate` is a type guard returning `is Example`.
const validate = ajv.compile(schema);

console.log(validate(data)); // true
console.log(validate.errors); // null
```

**Typescript compiler error messages**

There is no error and that's the problem.

**Describe the change that should be made to address the issue?**

Expressing the type of the `required` array (i.e. a tuple containing all required member names in any order) in TypeScript is apparently really hard and potentially impossible. Have we hit an unsurmountable limitation?

I see several approaches to attempt supporting this, all with their own quirks:
* Change the type of the `required` schema field to be a tuple consisting of the `UncheckedRequiredMembers` by using some union-to-tuple conversion as shown in [this stackoverflow answer](https://stackoverflow.com/a/55128956) (which is rather hacky).
While this would fix the issue for `JSONSchemaType`s, it leads to an excessively deep type instantion on the `ajv.compile` call.
Another drawback of this is that there is no control over the order within the tuple and only a single permutation would be considered valid. This could lead to incompatibilities with code generation and might unpredictably invalidate schema definitions in the future or with other TS versions.
* Assert the correctness through the parameter to `ajv.compile` (using `extends`) and fall back to either `never` or some string literal type like is done in the [`StrictNullChecksWrapper`](https://github.com/ajv-validator/ajv/blob/master/lib/types/json-schema.ts#L2).
This would require significant changes to the signature of `compile` and would likely not yield very friendly error messages. Furthermore, errors would not emerge in the initialization of a `JSONSchemaType` but rather in the later compilation thereof.
* Give up and use JSON Type Definitions which have their `JTDSchemaType` inferred correctly. Unfortunately, JTD is lacking validation features like regex-matching and min/max values.

Since there seems to be no obvious, elegant solution, has this issue been considered before and rejected because of this? I was unable to find a related issue.

**Are you going to resolve the issue?**
I would love to provide a pull request if a suitable solution is found (if it is even theoretically possible).