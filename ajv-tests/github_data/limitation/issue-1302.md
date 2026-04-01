# [1302] Limitation: JSONSchemaType<T> does not support unions

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv@7.0.0-beta.1

**Ajv options object**

N/A (type error)


**JSON Schema**

See code below


**Sample data**

N/A (type error)


**Your code**

```typescript
type VariableGroupValue = string | number | { query: string };

const variableGroupValueSchema: JSONSchemaType<VariableGroupValue> = {
  anyOf: [
    {
      type: 'string',
    },
    {
      type: 'number',
    },
    {
      type: 'object',
      properties: {
        query: {
          type: 'string',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
  ],
};
```


**Validation result, data AFTER validation, error messages**

```
const variableGroupValueSchema: JSONSchemaType<VariableGroupValue, false>
Type '{ anyOf: ({ type: "string"; } | { type: "number"; } | { type: "object"; properties: { query: { type: "string"; }; }; required: "query"[]; additionalProperties: false; })[]; }' is not assignable to type 'JSONSchemaType<VariableGroupValue, false>'.
  Type '{ anyOf: ({ type: "string"; } | { type: "number"; } | { type: "object"; properties: { query: { type: "string"; }; }; required: "query"[]; additionalProperties: false; })[]; }' is not assignable to type '{ type: "object"; required: "query"[]; additionalProperties: boolean; properties?: PropertiesSchema<{ query: string; }> | undefined; patternProperties?: { [pattern: string]: never; } | undefined; propertyNames?: JSONSchemaType<...> | undefined; dependencies?: { ...; } | undefined; minProperties?: number | undefined;...'.
    Type '{ anyOf: ({ type: "string"; } | { type: "number"; } | { type: "object"; properties: { query: { type: "string"; }; }; required: "query"[]; additionalProperties: false; })[]; }' is missing the following properties from type '{ type: "object"; required: "query"[]; additionalProperties: boolean; properties?: PropertiesSchema<{ query: string; }> | undefined; patternProperties?: { [pattern: string]: never; } | undefined; propertyNames?: JSONSchemaType<...> | undefined; dependencies?: { ...; } | undefined; minProperties?: number | undefined;...': type, required, additionalPropertiests(2322)
Peek Problem (Alt+F8)
No quick fixes available
```

![image](https://user-images.githubusercontent.com/609164/96331611-5fa3ff00-10aa-11eb-9a8a-3e1c480a9254.png)

It complains that the top level schema object doesn't have the keys: `type`, `required`, `additionalPropertiests`. I thought I could use `anyOf` on it's own. It doesn't really make sense to use `type` at the top level because it could be one of three different types but it looks like it expects it to be an object. I also tried `oneOf` with the same result.

Any suggestions or workarounds welcome, especially if my schema is wrong. Thanks

**What results did you expect?**

Expected no type error 

**Are you going to resolve the issue?**

No.
