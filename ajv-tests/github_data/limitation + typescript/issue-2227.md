# [2227] JSONSchema with allOf throws unexpected typescript compiler error

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
latest

**Ajv options object**
```{}```

<!-- See https://ajv.js.org/options.html -->

```javascript
import {JSONSchemaType} from 'ajv'

type Schema<T> = JSONSchemaType<T>;

type Foo = {                                          
  name: 'FOO';                                                                                                                                                                                   
};

type Bar = Foo & {
  field: string;
}

const FooSchema: Schema<Foo> = {
  $id: '/foo',
  type: 'object',
  properties: {
    name: {
      type: 'string'
    }
  },
  required: []
}

const BarSchema: Schema<Bar> = {
  allOf: [
    { $ref: '/foo' },
    {
      type: 'object',
      properties: {
        field: {
          type: 'string'
        }
      },
      required: []
    }
  ],
  definitions: {
    foo: FooSchema
  }
}

console.log(BarSchema)
```

[Here](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbwFIGUDyA5FBjAFgUxAEMAVATzHwF84AzKCEOAciICsA3ZgKG5gvxwcBYgB4SAPjgBeOKkzDCpAeIkBuXv0pwAYhAgzEcYydNnzFy+e7GAdkRD4AXCx1o0zNVe8-ff-wGBQcEhoWbcVBp8AnAAQkRQhnoGAGSINnTA+AA2ACYuAM4wUMC2AOYaVLzYELZFuvqKxC5NRKLJUrIIGQAkwPksAPS0+swANBlaziwQAEZs+Ngw4xlgDJSwWQUu3ab2jjsZplMuzEUl5TymVcZUE8ZQ+ACOAK7AjwMA2gC6EdW19XiUFaLTwSlEQM66WMRGy2TQtBcnyORh6j0RQxGEGYcDuKN2ZhOM3mi2W9zMawgGxgW0OlloWTydKsRLOxVKZSuFhuZjx5ker3e+C+v2uGW+5Ny+AZtmANIBzOMWJcyVaGSqVW4NTqEGy+AAdNkIGUABRA1oASiAA) is the TS Playground

**Validation result, data AFTER validation, error messages**

```
Type '{ allOf: ({ $ref: string; } | { type: "object"; properties: { field: { type: "string"; }; }; required: never[]; })[]; definitions: { foo: { type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 8 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; }...' is not assignable to type 'Schema<Bar>'.
  Type '{ allOf: ({ $ref: string; } | { type: "object"; properties: { field: { type: "string"; }; }; required: never[]; })[]; definitions: { foo: { type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 8 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; }...' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.
    Property 'type' is missing in type '{ allOf: ({ $ref: string; } | { type: "object"; properties: { field: { type: "string"; }; }; required: never[]; })[]; definitions: { foo: { type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 8 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; }...' but required in type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.
```

**What results did you expect?**
No compilation error

**Are you going to resolve the issue?**
Depends on what the issue is
