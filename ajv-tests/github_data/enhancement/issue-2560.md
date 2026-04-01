# [2560] Support OAS-compatible file schema

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

^8.17.1

**What problem do you want to solve?**

I work on a back-end framework with a fetching library that performs Zod validation on server-side and Ajv validation on the client-side. The JSON schema is generated using the built-in zod@4 `toJSONSchema` function that converts `z.file()` schema into OAS-compatible format:

```ts
{ type: "string", format: "binary", contentEncoding: "binary" }
```

See https://zod.dev/json-schema?id=file-schemas

The problem is that on the client-side the `File` and `Blob` instances that are sent with `FormData`, as expected, are interpreted as objects. I tried to add a custom format to handle that case:

```ts
ajv.addFormat('binary', {
    type: 'string',
    validate: (data) => data instanceof Blob,
  });
```

But AJV still treats the field as a string, ignoring the `validate` option and throwing the same validation error: `data/file must be string`

I attempted to fix that by replacing the `format: "binary"` schemas with `type: "object"` and using `addFormat` to define the format of the object, but AJV doesn't support `addFormat` for object types.

The only workaround worked is modifying the input data itself and replacing `File` and `Blob` by a hard-coded string.
 
**What do you think is the correct solution to problem?**

AJV should support hooking into the format interpretation, avoiding preliminary checks of an actual type. How to do that is up to the authors, but it might be another method such as `addFormatInterpretation` or an option like `ignoreActualType` for `addFormat` method.

**Will you be able to implement it?**

No. This change requires to adjust the design of AJV library, but I'm also not familiar with the AJV code.
