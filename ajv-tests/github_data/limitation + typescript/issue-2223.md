# [2223] JSONSchemaType does not correctly handle nullable fields when referenced using $ref

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
latest, yes

**Ajv options object**
{}

```javascript
import {JSONSchemaType} from "ajv"

interface Foo {
  foo?: string;
}

const FooSchema: JSONSchemaType<Foo> = {
  type: 'object',
  properties: {
    foo: {
      type: 'string',
      nullable: true
    }
  },
  required: []
}

interface Bar {
  bar: Foo
}

const BarSchema: JSONSchemaType<Bar> = {
  type: 'object',
  properties: {
    bar: {
      type: 'object',
      $ref: '#/definitions/Foo'
    }
  },
  required: [],
  definitions: {
    Foo: FooSchema
  }
}

console.log(FooSchema, BarSchema)
```


**Sample data**
NA

**Your code**
See above, also a [TS Playground](https://www.typescriptlang.org/play?ts=4.7.2#code/JYWwDg9gTgLgBAbwFIGUDyA5FBjAFgUxAEMAVATzHwF84AzKCEOAIiICsA3ZgKG+ADsY+KLSLZ8cAGIQIibnDoyA-AC44AZxhQBAcwDc3Kr2wR+mqTJwFia1JiuFSFfAB5pEAHxwAvHIUxnNQByCAAjNnxsGCCAGnk4MAZKWGB8dTUEeIVaGQyshTgAymDNbX4dWPyFfgBXABs6olC6-DUtGvx8owUqOIUofABHGuABgBM1AG0AXUNeASERMQkAISIoPzhQ9bV3Oe4TM3g1qAcbODssPEdyShcTr19M-0C4EPDI6L6EpOEYVPSmwU2ygeQKBSKrTeYQiUUq4IUABIBrRggBiAD0Y3wtAEwH+pnUGPcQS68V68QGw1G+AmcBm32xuP4+OAhLBBXcu0s12I5P2h3UEBaADo6hAdAAKdxnIgxOAnWUASm4QA)
**Validation result, data AFTER validation, error messages**

```
Type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }' is not assignable to type 'UncheckedJSONSchemaType<Known, true>'.
  Type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }' is not assignable to type '{ type: "object" | undefined; additionalProperties?: boolean | UncheckedJSONSchemaType<Known, false> | undefined; unevaluatedProperties?: boolean | ... 1 more ... | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.
    Type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }' is not assignable to type '{ type: "object" | undefined; additionalProperties?: boolean | UncheckedJSONSchemaType<Known, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<...> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.
      Types of property 'properties' are incompatible.
        Type 'UncheckedPropertiesSchema<Foo> | undefined' is not assignable to type 'Partial<UncheckedPropertiesSchema<{ [key: string]: Known; }>> | undefined'.
          Type 'UncheckedPropertiesSchema<Foo>' is not assignable to type 'Partial<UncheckedPropertiesSchema<{ [key: string]: Known; }>>'.
            Property 'foo' is incompatible with index signature.
              Type '{ $ref: string; } | (UncheckedJSONSchemaType<string | undefined, false> & { nullable: true; const?: null | undefined; enum?: readonly (string | null | undefined)[] | undefined; default?: string | ... 1 more ... | undefined; })' is not assignable to type '{ $ref: string; } | ({ anyOf: readonly UncheckedJSONSchemaType<Known, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; } & { ...; }) | ... 9 more ... | undefined'.
                Type '{ anyOf: readonly UncheckedJSONSchemaType<string | undefined, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; } & { ...; }' is not assignable to type '{ $ref: string; } | ({ anyOf: readonly UncheckedJSONSchemaType<Known, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; } & { ...; }) | ... 9 more ... | undefined'.
                  Type '{ anyOf: readonly UncheckedJSONSchemaType<string | undefined, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; } & { ...; }' is not assignable to type '{ $ref: string; }'.
                    Types of property '$ref' are incompatible.
                      Type 'string | undefined' is not assignable to type 'string'.
                        Type 'undefined' is not assignable to type 'string'.
```

For some reason, typescript/ajv cannot handle nullable fields in nested schemas. The above example is a minimum repro where Foo has a nullable field, and is then referenced inside Bar. 

If I remove the nullable field, i.e.
```
interface Foo {
  foo: string
}
```
and adjust the schema accordingly, everything compiles. 

**What results did you expect?**
No compilation issues

**Are you going to resolve the issue?**
