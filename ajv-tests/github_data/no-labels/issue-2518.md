# [2518] UncheckedJSONSchemaType ['type'] field does not support 'array', 'object', and 'null' in an array

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports. For other issues please use:
- security vulnerability: https://tidelift.com/security)
- a new feature/improvement: https://ajv.js.org/contributing/#changes
- browser/compatibility issues: https://ajv.js.org/contributing/#compatibility
- JSON-Schema standard: https://ajv.js.org/contributing/#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.17.1, Yes

Here is a link to the documentation:
https://json-schema.org/understanding-json-schema/reference/type

The syntax I have given is valid and supported by ajv and works. Error only in JSONSchemaType:

```typescript
import type { JSONSchemaType } from 'ajv';

type NullInTypeFieldArray = { someField: number | null };
const nullInTypeFieldArraySchema: JSONSchemaType<NullInTypeFieldArray> = {
  type: 'object',
  required: ['someField'],
  properties: {
    someField: { type: ['number', 'null'] },
  },
};

type ObjectInTypeFieldArray = { someField: { anotherField: number } | null };
const objectInTypeFieldArraySchema: JSONSchemaType<ObjectInTypeFieldArray> = {
  type: 'object',
  required: ['someField'],
  properties: {
    someField: {
      type: ['object', 'null'],
      properties: {
        anotherField: { type: 'number' },
      },
    },
  },
};

type ArrayInTypeFieldAArray = { someField: string[] | null };
const schemaWithArrayInType: JSONSchemaType<ArrayInTypeFieldAArray> = {
  type: 'object',
  required: ['someField'],
  properties: {
    someField: {
      type: ['array', 'null'],
      items: { type: 'string' },
    },
  },
};
```

**Validation result, data AFTER validation, error messages**
Very long typescript type check error:
```
1. Type '{ type: "object"; required: "someField"[]; properties: { someField: { type: string[]; properties: { anotherField: { type: "number"; }; }; }; }; }' is not assignable to type 'JSONSchemaType<ObjectInTypeFieldArray>'.
     Type '{ type: "object"; required: "someField"[]; properties: { someField: { type: string[]; properties: { anotherField: { type: "number"; }; }; }; }; }' is not assignable to type '({ anyOf: readonly UncheckedJSONSchemaType<ObjectInTypeFieldArray, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; }) | ({ oneOf: readonly UncheckedJSONSchemaType<ObjectInTypeFieldArray, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; }) | ({ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; properties?: UncheckedPropertiesSchema<ObjectInTypeFieldArray> | undefined; patternProperties?: Record<string, UncheckedJSONSchemaType<unknown, false>> | undefined; propertyNames?: (Omit<UncheckedJSONSchemaType<string, false>, "type"> & { type?: "string" | undefined; }) | undefined; dependencies?: { someField?: readonly "someField"[] | UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; } | undefined; dependentRequired?: { someField?: readonly "someField"[] | undefined; } | undefined; dependentSchemas?: { someField?: UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; } | undefined; minProperties?: number | undefined; maxProperties?: number | undefined; } & { required: readonly "someField"[]; } & { allOf?: readonly UncheckedPartialSchema<ObjectInTypeFieldArray>[] | undefined; anyOf?: readonly UncheckedPartialSchema<ObjectInTypeFieldArray>[] | undefined; oneOf?: readonly UncheckedPartialSchema<ObjectInTypeFieldArray>[] | undefined; if?: UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; then?: UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; else?: UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; not?: UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; })'.
       Type '{ type: "object"; required: "someField"[]; properties: { someField: { type: string[]; properties: { anotherField: { type: "number"; }; }; }; }; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; properties?: UncheckedPropertiesSchema<ObjectInTypeFieldArray> | undefined; patternProperties?: Record<string, UncheckedJSONSchemaType<unknown, false>> | undefined; propertyNames?: (Omit<UncheckedJSONSchemaType<string, false>, "type"> & { type?: "string" | undefined; }) | undefined; dependencies?: { someField?: readonly "someField"[] | UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; } | undefined; dependentRequired?: { someField?: readonly "someField"[] | undefined; } | undefined; dependentSchemas?: { someField?: UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; } | undefined; minProperties?: number | undefined; maxProperties?: number | undefined; } & { required: readonly "someField"[]; } & { allOf?: readonly UncheckedPartialSchema<ObjectInTypeFieldArray>[] | undefined; anyOf?: readonly UncheckedPartialSchema<ObjectInTypeFieldArray>[] | undefined; oneOf?: readonly UncheckedPartialSchema<ObjectInTypeFieldArray>[] | undefined; if?: UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; then?: UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; else?: UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; not?: UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; }'.
         Type '{ type: "object"; required: "someField"[]; properties: { someField: { type: string[]; properties: { anotherField: { type: "number"; }; }; }; }; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; properties?: UncheckedPropertiesSchema<ObjectInTypeFieldArray> | undefined; patternProperties?: Record<string, UncheckedJSONSchemaType<unknown, false>> | undefined; propertyNames?: (Omit<UncheckedJSONSchemaType<string, false>, "type"> & { type?: "string" | undefined; }) | undefined; dependencies?: { someField?: readonly "someField"[] | UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; } | undefined; dependentRequired?: { someField?: readonly "someField"[] | undefined; } | undefined; dependentSchemas?: { someField?: UncheckedPartialSchema<ObjectInTypeFieldArray> | undefined; } | undefined; minProperties?: number | undefined; maxProperties?: number | undefined; }'.
           The types of 'properties.someField' are incompatible between these types.
             Type '{ type: string[]; properties: { anotherField: { type: "number"; }; }; }' is not assignable to type '{ $ref: string; } | ({ anyOf: readonly UncheckedJSONSchemaType<{ anotherField: number; } | null, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; } & { nullable?: false | undefined; const?: { anotherField: number; } | null | undefined; enum?: readonly ({ anotherField: number; } | null)[] | undefined; default?: { anotherField: number; } | null | undefined; }) | ({ oneOf: readonly UncheckedJSONSchemaType<{ anotherField: number; } | null, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; } & { nullable?: false | undefined; const?: { anotherField: number; } | null | undefined; enum?: readonly ({ anotherField: number; } | null)[] | undefined; default?: { anotherField: number; } | null | undefined; }) | ({ type: readonly never[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; } & { nullable?: false | undefined; const?: { anotherField: number; } | null | undefined; enum?: readonly ({ anotherField: number; } | null)[] | undefined; default?: { anotherField: number; } | null | undefined; }) | ({ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; properties?: UncheckedPropertiesSchema<{ anotherField: number; }> | undefined; patternProperties?: Record<string, UncheckedJSONSchemaType<unknown, false>> | undefined; propertyNames?: (Omit<UncheckedJSONSchemaType<string, false>, "type"> & { type?: "string" | undefined; }) | undefined; dependencies?: { anotherField?: readonly "anotherField"[] | UncheckedPartialSchema<{ anotherField: number; }> | undefined; } | undefined; dependentRequired?: { anotherField?: readonly "anotherField"[] | undefined; } | undefined; dependentSchemas?: { anotherField?: UncheckedPartialSchema<{ anotherField: number; }> | undefined; } | undefined; minProperties?: number | undefined; maxProperties?: number | undefined; } & { required: readonly "anotherField"[]; } & { allOf?: readonly UncheckedPartialSchema<{ anotherField: number; } | null>[] | undefined; anyOf?: readonly UncheckedPartialSchema<{ anotherField: number; } | null>[] | undefined; oneOf?: readonly UncheckedPartialSchema<{ anotherField: number; } | null>[] | undefined; if?: UncheckedPartialSchema<{ anotherField: number; } | null> | undefined; then?: UncheckedPartialSchema<{ anotherField: number; } | null> | undefined; else?: UncheckedPartialSchema<{ anotherField: number; } | null> | undefined; not?: UncheckedPartialSchema<{ anotherField: number; } | null> | undefined; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; } & { nullable?: false | undefined; const?: { anotherField: number; } | null | undefined; enum?: readonly ({ anotherField: number; } | null)[] | undefined; default?: { anotherField: number; } | null | undefined; })'.
               Type '{ type: string[]; properties: { anotherField: { type: "number"; }; }; }' is not assignable to type '({ anyOf: readonly UncheckedJSONSchemaType<{ anotherField: number; } | null, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; } & { nullable?: false | undefined; const?: { anotherField: number; } | null | undefined; enum?: readonly ({ anotherField: number; } | null)[] | undefined; default?: { anotherField: number; } | null | undefined; }) | ({ oneOf: readonly UncheckedJSONSchemaType<{ anotherField: number; } | null, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; } & { nullable?: false | undefined; const?: { anotherField: number; } | null | undefined; enum?: readonly ({ anotherField: number; } | null)[] | undefined; default?: { anotherField: number; } | null | undefined; })'.
                 Type '{ type: string[]; properties: { anotherField: { type: "number"; }; }; }' is not assignable to type '{ oneOf: readonly UncheckedJSONSchemaType<{ anotherField: number; } | null, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; } & { nullable?: false | undefined; const?: { anotherField: number; } | null | undefined; enum?: readonly ({ anotherField: number; } | null)[] | undefined; default?: { anotherField: number; } | null | undefined; }'.
                   Property 'oneOf' is missing in type '{ type: string[]; properties: { anotherField: { type: "number"; }; }; }' but required in type '{ oneOf: readonly UncheckedJSONSchemaType<{ anotherField: number; } | null, false>[]; }'. [2322]
```

**What results did you expect?**
No typing errors

**Are you going to resolve the issue?**
Yes