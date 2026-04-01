# [2169] jtd key value resolves to never

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.2

**Your typescript code**

```ts
import Ajv, {JTDSchemaType} from 'ajv/dist/jtd';
export interface N8nAssetsNodeData {
  displayName:string;
  icon:string;
  install:string;
  query: {
      [key:string]: string;
  }
}

export interface N8nAssetsData {
  [key: string]: N8nAssetsNodeData;
}
  
const schemaAssetsData:JTDSchemaType<N8nAssetsData> = {
  values: {
    properties: {
      displayName: {
        type: 'string',
      },
      icon: {
        type: 'string',
      },
      install: {
        type: 'string',
      },
      query: {
        values: {
          type: 'string'
        },
      },
    },
    additionalProperties: true
  }
};
```

**Typescript compiler error messages**

```
error TS2322: Type '{ values: { properties: { displayName: { type: string; }; icon: { type: string; }; install: { type: string; }; query: { values: { type: string; }; }; }; additionalProperties: boolean; }; }' is not assignable to type 'never'.

22 const schemaAssetsData:JTDSchemaType<N8nAssetsData> = {
```

**Describe the change that should be made to address the issue?**

A way to generate typescript key value maps in jtd without it being resolved to "never".

**Are you going to resolve the issue?**

If I had the clue, yes. But unfortunately I have no plan.