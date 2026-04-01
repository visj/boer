# [1804] Ajv requires the “required” field.

<!--

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.2
** Typescript version**
4.3.5

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```typescript
const planSchema: JSONSchemaType<Plan> = {
  "title": "Plan",
  "description": "Plan template \u2013 without client-specific data.",
  "type": "object",
  "properties": {
    "cost": {
      "$ref": "#/definitions/Cost"
    },
  },
  "definitions": {
    "Cost": {
      "title": "Cost",
      "description": "A description of costs for a single unit of resource.",
      "type": "object",
      "properties": {
        "annual": {
          "title": "Annual",
          "description": "Monthly rate if annual payment is used.",
          "default": 0.0,
          "multipleOf": 0.01,
          "type": "number"
        },
        "monthly": {
          "title": "Monthly",
          "description": "Monthly rate if monthly payment is used.",
          "default": 0.0,
          "multipleOf": 0.01,
          "type": "number"
        }
      },
    },
  }

```


**Your code**


```typescript
export interface Cost {
  annual?: number,
  monthly?: number
}

export interface Plan {
  cost: Cost,
}
```

**Typescript error**
```
TS2322: Type '{ title: string; description: string; type: "object"; properties: { annual: { title: string; description: string; default: number; multipleOf: number; type: "number"; }; monthly: { title: string; description: string; default: number; multipleOf: number; type: "number"; }; }; }' is not assignable to type 'UncheckedJSONSchemaType<Known, true>'.
  Type '{ title: string; description: string; type: "object"; properties: { annual: { title: string; description: string; default: number; multipleOf: number; type: "number"; }; monthly: { title: string; description: string; default: number; multipleOf: number; type: "number"; }; }; }' is not assignable to type '{ type: "object" | undefined; additionalProperties?: boolean | UncheckedJSONSchemaType<Known, false> | undefined; unevaluatedProperties?: boolean | ... 1 more ... | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.
    Property 'required' is missing in type '{ title: string; description: string; type: "object"; properties: { annual: { title: string; description: string; default: number; multipleOf: number; type: "number"; }; monthly: { title: string; description: string; default: number; multipleOf: number; type: "number"; }; }; }' but required in type '{ required: readonly (string | number)[]; }'.

json-schema.d.ts(77, 5): 'required' is declared here.
```

**What results did you expect?**

I expect this schema to validate as correct, because `required` field is not required part of a JSON Schema.