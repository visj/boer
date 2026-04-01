# [2326] [Q] How to extend schema with another schema in variable with typescript?

try to extend status schema with the newStatus

```ts
import { JSONSchemaType } from "ajv";

type Id = number;
type StatusName = string;
type StatusColor = string;

type NewStatus = {
  status: StatusName;
  color: StatusColor;
};

type Status = {
  status_id: Id;
} & NewStatus;


const newStatus: JSONSchemaType<NewStatus> = {
  type: "object",

  properties: {
    status: {
      type: "string",
      minLength: 3,
      maxLength: 20,
    },

    color: {
      type: "string",
      pattern: "#[a-f0-9]{6}",
    },
  },

  required: ["status", "color"],
  additionalProperties: false,
};

const status: JSONSchemaType<Status> = {
  type: "object",

  properties: {
    status_id: {
      type: "integer",
    },

    ...newStatus.properties,
  },

  required: ["status_id", "status", "color"],
  additionalProperties: false,
};
```

but get the error for status:
```
[{
	"resource": "index.ts",
	"owner": "typescript",
	"code": "2322",
	"severity": 8,
	"message": "Type '{ type: \"object\"; properties: { status?: { $ref: string; } | (UncheckedJSONSchemaType<string, false> & { nullable?: false | undefined; const?: string | undefined; enum?: readonly string[] | undefined; default?: string | undefined; }) | undefined; color?: { $ref: string; } | ... 1 more ... | undefined; status_id: { ....' is not assignable to type 'JSONSchemaType<Status>'.\n  Type '{ type: \"object\"; properties: { status?: { $ref: string; } | (UncheckedJSONSchemaType<string, false> & { nullable?: false | undefined; const?: string | undefined; enum?: readonly string[] | undefined; default?: string | undefined; }) | undefined; color?: { $ref: string; } | ... 1 more ... | undefined; status_id: { ....' is not assignable to type '({ anyOf: readonly UncheckedJSONSchemaType<Status, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<...>> | undefined; definitions?: Record<...> | undefined; }) | ({ ...; } & { ...; }) | ({ ...; } & ... 2 more ... & { ...; })'.\n    Type '{ type: \"object\"; properties: { status?: { $ref: string; } | (UncheckedJSONSchemaType<string, false> & { nullable?: false | undefined; const?: string | undefined; enum?: readonly string[] | undefined; default?: string | undefined; }) | undefined; color?: { $ref: string; } | ... 1 more ... | undefined; status_id: { ....' is not assignable to type '{ type: \"object\"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.\n      Type '{ type: \"object\"; properties: { status?: { $ref: string; } | (UncheckedJSONSchemaType<string, false> & { nullable?: false | undefined; const?: string | undefined; enum?: readonly string[] | undefined; default?: string | undefined; }) | undefined; color?: { $ref: string; } | ... 1 more ... | undefined; status_id: { ....' is not assignable to type '{ type: \"object\"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.\n        The types of 'properties.status' are incompatible between these types.\n          Type '{ $ref: string; } | (UncheckedJSONSchemaType<string, false> & { nullable?: false | undefined; const?: string | undefined; enum?: readonly string[] | undefined; default?: string | undefined; }) | undefined' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<string, false> & { nullable?: false | undefined; const?: string | undefined; enum?: readonly string[] | undefined; default?: string | undefined; })'.\n            Type 'undefined' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<string, false> & { nullable?: false | undefined; const?: string | undefined; enum?: readonly string[] | undefined; default?: string | undefined; })'.",
	"source": "ts",
	...
}]
```

![image](https://github.com/ajv-validator/ajv/assets/8055157/c738b377-6720-4bc7-8ec4-edb023650c27)

![image](https://github.com/ajv-validator/ajv/assets/8055157/3b4e9b58-4ed0-4d3d-8852-fcdc199b8aae)


How is it correct from the typescript point of view to extend the status schema with the newStatus schema?