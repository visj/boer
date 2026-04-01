# [2312] Why does AJV contain its own types for JSON Schema instead of using an external package

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.12.0

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
import type { JSONSchemaType } from "ajv";
```

**Describe the change that should be made to address the issue?**

Hello everyone! First of all, thanks to all the maintainers for your contribution!

I would just like to know why ajv contains its own definitions for JSON Schema. JSON Schema is a Standard, so its types should be the same in different applications. Common types would help to glue different packages. It may look like this:

```typescript
import Ajv from "ajv";
import schemaBuilder from "some-schema-builder-package";

import type { JSONSchemaType } from "some-common-schema-package";

const ajv = new Ajv();

const mySchema: JSONSchemaType<MyEntity> = schemaBuilder<MyEntity>(/* ... */);
const validate = ajv.compile(mySchema);
```

But now I have to redefine package typings to make types from ajv and different packages "match" to each other.

On the [json-schema.org website](https://json-schema.org/implementations.html#from-code) I found [typescript-json-schema package](https://github.com/YousefED/typescript-json-schema/blob/v0.59.0/package.json#L44), which imports types from [@types/json-schema](https://www.npmjs.com/package/@types/json-schema) package.

Why doesn't ajv use `@types/json-schema` package?

**Are you going to resolve the issue?**

Apparently, this is an ideological issue, so I’m not able to solve it.
