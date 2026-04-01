# [2521] A schema for a TypeScript interface with a Date property falsely expects oneOf in the schema

## Context

I am defining a schema for an interface that has a property of type [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date). I use the type safety provided by AJV and Typescript by specifying that the type of my schema is `JSONSchemaType<MyInterface>`.

## Expected behaviour

I can define the date property in the schema like this

```json
{
    "dateProperty": {
        "type": "string",
        "format": "date-time",
    }
}
```

This is how it is supposed to work according to json-schema.org, e.g. see: https://json-schema.org/learn/json-schema-examples#blog-post

## Actual behaviour and Error Message

When defining my schema like this i get this (typescript) error:
```
Type '{ type: "object"; additionalProperties: false; required: "dateProperty"[]; properties: { dateProperty: { type: string; format: string; }; }; }' is not assignable to type 'JSONSchemaType<TypeWithDate>'.
  Type '{ type: "object"; additionalProperties: false; required: "dateProperty"[]; properties: { dateProperty: { type: string; format: string; }; }; }' is not assignable to type '({ anyOf: readonly UncheckedJSONSchemaType<TypeWithDate, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; }) | ({ ...; } & { ...; }) | ({ ...; } & ... 2 more ... & { ...; })'.
    Type '{ type: "object"; additionalProperties: false; required: "dateProperty"[]; properties: { dateProperty: { type: string; format: string; }; }; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.
      Type '{ type: "object"; additionalProperties: false; required: "dateProperty"[]; properties: { dateProperty: { type: string; format: string; }; }; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.
        The types of 'properties.dateProperty' are incompatible between these types.
          Type '{ type: string; format: string; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<Date, false> & { nullable?: false | undefined; const?: Date | undefined; enum?: readonly Date[] | undefined; default?: Date | undefined; })'.
            Type '{ type: string; format: string; }' is not assignable to type '({ anyOf: readonly UncheckedJSONSchemaType<Date, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<...>> | undefined; definitions?: Record<...> | undefined; } & { ...; }) | ({ ...; } & ... 1 more ... & { ...; })'.
              Type '{ type: string; format: string; }' is not assignable to type '{ oneOf: readonly UncheckedJSONSchemaType<Date, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<...>> | undefined; definitions?: Record<...> | undefined; } & { ...; }'.
                Property 'oneOf' is missing in type '{ type: string; format: string; }' but required in type '{ oneOf: readonly UncheckedJSONSchemaType<Date, false>[]; }'.ts(2322)
```

The important line being this one:
```
Property 'oneOf' is missing in type '{ type: string; format: string; }' but required in type '{ oneOf: readonly UncheckedJSONSchemaType<Date, false>[]; }'
```

## Minimal Reproducible Example

Setup any project with typescript and AJV then paste this code:

```ts
import type { JSONSchemaType } from "ajv";

interface TypeWithDate {
    dateProperty: Date;
}

const SCHEMA: JSONSchemaType<TypeWithDate> = {
    type: "object",
    additionalProperties: false,
    required: ["dateProperty"],
    properties: {
        dateProperty: { type: "string", format: "date-time" },
    },
}
```

## Workaround

```ts
const AJV_TYPESAFE_SCHEMA_DATETIME_BUGFIX = {
  oneOf: [],
};

// Then when defining the schema
const SCHEMA: JSONSchemaType<TypeWithDate> = {
    // ...
    properties: {
        dateProperty: { type: "string", format: "date-time", ...AJV_TYPESAFE_SCHEMA_DATETIME_BUGFIX  },
    },
}
```

## Versions

### Typescript
```
Version 5.6.3
```

### AJV
```
ajv@8.17.1 | MIT | deps: 4 | versions: 355
Another JSON Schema Validator
https://ajv.js.org

keywords: JSON, schema, validator, validation, jsonschema, json-schema, json-schema-validator, json-schema-validation

dist
.tarball: https://registry.npmjs.org/ajv/-/ajv-8.17.1.tgz
.shasum: 37d9a5c776af6bc92d7f4f9510eba4c0a60d11a6
.integrity: sha512-B/gBuNg5SiMTrPkC+A2+cW0RszwxYmn6VYxB/inlBStS5nx6xHIt/ehKRhIMhqusl7a8LjQoZnjCs5vhwxOQ1g==
.unpackedSize: 1.0 MB

dependencies:
fast-deep-equal: ^3.1.3      fast-uri: ^3.0.1             json-schema-traverse: ^1.0.0 require-from-string: ^2.0.2  

maintainers:
- blakeembrey <hello@blakeembrey.com>
- esp <e.poberezkin@me.com>

dist-tags:
4.x: 4.11.8     beta: 8.11.1    latest: 8.17.1  

published 5 months ago by esp <e.poberezkin@me.com>
```

## Cause and Fix

Im quite new to AJV but i think the bug is caused by the code in `ajv/dist/types/json-schema.d.ts (line 21)`

_Edit: fixed cause and fix heading_