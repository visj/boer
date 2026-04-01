# [1588] Typescript: impossible to use JSONSchemaType with mixed index signatures and defined properties

ajv version: 8.2.0

```typescript
interface T {
  a: number;
  [key: string]: unknown;
}

const b: JSONSchemaType<T> = {
  type: 'object',
  properties: { a: { type: 'number' } },
  required: ['a'],
  additionalProperties: true, // doesn't affect anything
};
```


<p>
<details>
<summary>ts error</summary>

<pre><code>
Type '{ type: "object"; properties: { a: { type: "number"; }; }; required: string[]; }' is not assignable to type 'JSONSchemaType<T, false>'.
  Type '{ type: "object"; properties: { a: { type: "number"; }; }; required: string[]; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | JSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | JSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.
    Type '{ type: "object"; properties: { a: { type: "number"; }; }; required: string[]; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | JSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | JSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.
      Types of property 'properties' are incompatible.
        Type '{ a: { type: "number"; }; }' is not assignable to type 'PropertiesSchema<T>'.
          Property 'a' is incompatible with index signature.
            Type '{ type: "number"; }' is not assignable to type '{ $ref: string; } | (JSONSchemaType<unknown, false> & { nullable: true; const?: undefined; enum?: readonly unknown[] | undefined; default?: unknown; })'.
              Type '{ type: "number"; }' is not assignable to type '{ oneOf: readonly JSONSchemaType<unknown, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: { [x: string]: JSONSchemaType<Known, true> | undefined; } | undefined; definitions?: { ...; } | undefined; } & { ...; }'.
                Property 'oneOf' is missing in type '{ type: "number"; }' but required in type '{ oneOf: readonly JSONSchemaType<unknown, false>[]; }'.
</code></pre>

</details>
</p>

I've tried just about everything to make it work, only solution right now is to pass a different, less defined, type to JSONSchemaType.

Things I've tried

*  typecasting the schemas
* defining the additional properties as { type: 'string' }
* all manners of redefining the index signature