# [2180] TS is not able to infer that an optional field might be undefined

**What version of Ajv are you using?**

v8.11.2 ( latest )

**Your typescript code**

```typescript
    import Ajv, { JSONSchemaType } from "ajv";

    interface MyType {
    	myProp?: OtherType;
    }
    
    interface OtherType {
    	foo: string;
    	bar: number;
    }
    
    const otherSchema: JSONSchemaType<OtherType> = {
    	type: 'object',
    	properties: {
    		foo: { type: 'string', minLength: 1 },
    		bar: { type: 'number' },
    	},
    	required: ['foo', 'bar'],
    	additionalProperties: false
    };
    
    const mySchema: JSONSchemaType<MyType> = {
    	type: 'object',
    	properties: {
    		myProp: otherSchema,
    	},
    	required: [],
    	additionalProperties: false,
    };
```

**Typescript compiler error messages**

```
app.ts:22:7 - error TS2322: Type '{ type: "object"; properties: { myProp: { type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | ... 1 more ... | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }; }; required: never[]; a...' is not assignable to type 'UncheckedJSONSchemaType<MyType, false>'.
  The types of 'properties.myProp' are incompatible between these types.
    Type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<OtherType | undefined, false> & { nullable: true; const?: null | undefined; enum?: readonly (OtherType | null | undefined)[] | undefined; default?: OtherType | ... 1 more ... | undefined; })'.
      Type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }' is not assignable to type '{ $ref: string; }'.
        Types of property '$ref' are incompatible.
          Type 'string | undefined' is not assignable to type 'string'.
            Type 'undefined' is not assignable to type 'string'.
```

**Describe the change that should be made to address the issue?**

I'm not sure but I think this error occurs because TS doesn't know that `myProp` in `mySchema` might be *undefined*. The *required*  array does not contain `myProp`.

I could try to assign `{ nullable: true }` to `myProp` but there is no field for `schema` so this is not possible

`myProp: { schema: otherSchema, nullable: true }`

**Are you going to resolve the issue?**

Unfortunately I don't know how.