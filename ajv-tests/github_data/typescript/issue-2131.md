# [2131] Nullable enum field not working in Typescript

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.0. Yes

**Your typescript code**

```typescript
export interface Job {
  urgency?: 'Normal' | 'Urgent' | 'Critical' | null;
}

export const jobSchema: JSONSchemaType<Job> = {
  type: 'object',
  properties: {
    urgency: {
      type: ['string', 'null'],
      enum: [null, 'Normal', 'Urgent', 'Critical'],
      nullable: true,
    },
  },
  required: [
  ],
};
```

**Typescript compiler error messages**

```
const jobSchema: UncheckedJSONSchemaType<Job, false>

Type '{ type: "object"; properties: { urgency: { type: ("string" | "null")[]; enum: ("Normal" | "Urgent" | "Critical" | null)[]; nullable: true; }; }; required: never[]; }' is not assignable to type 'UncheckedJSONSchemaType<Job, false>'.
  The types of 'properties.urgency' are incompatible between these types.
    Type '{ type: ("string" | "null")[]; enum: ("Normal" | "Urgent" | "Critical" | null)[]; nullable: true; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<"Normal" | "Urgent" | "Critical" | null | undefined, false> & { nullable: true; const?: null | undefined; enum?: readonly ("Normal" | ... 3 more ... | undefined)[] | undefined; default?: "Normal" | ... 3 more ... | undefined; })'.
      Type '{ type: ("string" | "null")[]; enum: ("Normal" | "Urgent" | "Critical" | null)[]; nullable: true; }' is not assignable to type '{ type: "null"; nullable: true; } & { allOf?: readonly UncheckedPartialSchema<"Normal" | "Urgent" | "Critical" | null | undefined>[] | undefined; anyOf?: readonly UncheckedPartialSchema<"Normal" | "Urgent" | "Critical" | null | undefined>[] | undefined; ... 4 more ...; not?: UncheckedPartialSchema<...> | undefined; ...'.
        Type '{ type: ("string" | "null")[]; enum: ("Normal" | "Urgent" | "Critical" | null)[]; nullable: true; }' is not assignable to type '{ type: "null"; nullable: true; }'.
          Types of property 'type' are incompatible.
            Type '("string" | "null")[]' is not assignable to type '"null"'.ts(2322)
```

**Describe the change that should be made to address the issue?**
Typescript should permit the example solution in #824. Or if I have misunderstood, how do I make an enum field nullable in Typescript?

**Are you going to resolve the issue?**
No
