# [2327] [Q] How to describe schema with enum with typescript?

```ts
import { JSONSchemaType } from "ajv";

type Id = number;
type StatusColor = string;

type NewStatus = {
  status: "низкий" | "нормальный" | "повышенный" | "высокий";
  color: StatusColor;
};

const newStatus: JSONSchemaType<NewStatus> = {
  type: "object",

  properties: {
    status: {
      enum: ["низкий", "нормальный", "повышенный", "высокий"],
    },

    color: {
      type: "string",
      pattern: "#[a-f0-9]{6}",
    },
  },

  required: ["status", "color"],
  additionalProperties: false,
};
```

get the error:
```
[{
	"resource": "index.ts",
	"owner": "typescript",
	"code": "2322",
	"severity": 8,
	"message": "Type '{ type: \"object\"; properties: { status: { enum: (\"низкий\" | \"нормальный\" | \"повышенный\" | \"высокий\")[]; }; color: { type: \"string\"; pattern: string; }; }; required: (\"status\" | \"color\")[]; additionalProperties: false; }' is not assignable to type 'JSONSchemaType<NewStatus>'.\n  Type '{ type: \"object\"; properties: { status: { enum: (\"низкий\" | \"нормальный\" | \"повышенный\" | \"высокий\")[]; }; color: { type: \"string\"; pattern: string; }; }; required: (\"status\" | \"color\")[]; additionalProperties: false; }' is not assignable to type '({ anyOf: readonly UncheckedJSONSchemaType<NewStatus, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; }) | ({ ...; } & { ...; }) | ({ ...; } & ... 2 more ... & { ...; })'.\n    Type '{ type: \"object\"; properties: { status: { enum: (\"низкий\" | \"нормальный\" | \"повышенный\" | \"высокий\")[]; }; color: { type: \"string\"; pattern: string; }; }; required: (\"status\" | \"color\")[]; additionalProperties: false; }' is not assignable to type '{ type: \"object\"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.\n      Type '{ type: \"object\"; properties: { status: { enum: (\"низкий\" | \"нормальный\" | \"повышенный\" | \"высокий\")[]; }; color: { type: \"string\"; pattern: string; }; }; required: (\"status\" | \"color\")[]; additionalProperties: false; }' is not assignable to type '{ type: \"object\"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.\n        The types of 'properties.status' are incompatible between these types.\n          Type '{ enum: (\"низкий\" | \"нормальный\" | \"повышенный\" | \"высокий\")[]; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<\"низкий\" | \"нормальный\" | \"повышенный\" | \"высокий\", false> & { nullable?: false | undefined; const?: \"низкий\" | \"нормальный\" | \"повышенный\" | \"высокий\" | undefined; enum?: readonly (\"низкий\" | ... 2 more ... | \"высокий\")[] | undefined; default?: \"низкий\" | ... 3 more ... ...'.\n            Type '{ enum: (\"низкий\" | \"нормальный\" | \"повышенный\" | \"высокий\")[]; }' is not assignable to type '{ type: \"string\"; } & StringKeywords & { allOf?: readonly UncheckedPartialSchema<\"низкий\" | \"нормальный\" | \"повышенный\" | \"высокий\">[] | undefined; ... 5 more ...; not?: UncheckedPartialSchema<...> | undefined; } & { ...; } & { ...; }'.\n              Property 'type' is missing in type '{ enum: (\"низкий\" | \"нормальный\" | \"повышенный\" | \"высокий\")[]; }' but required in type '{ type: \"string\"; }'.",
	"source": "ts",
	"startLineNumber": 5,
	"startColumn": 7,
	"endLineNumber": 5,
	"endColumn": 16,
	"relatedInformation": [
		{
			"startLineNumber": 31,
			"startColumn": 5,
			"endLineNumber": 31,
			"endColumn": 9,
			"message": "'type' is declared here.",
			"resource": "node_modules/ajv/dist/types/json-schema.d.ts"
		}
	]
}]
```
![image](https://github.com/ajv-validator/ajv/assets/8055157/6eb92c8f-92f3-4c7a-a016-1e3c6dce0fff)

![image](https://github.com/ajv-validator/ajv/assets/8055157/748653a7-05f4-4451-a643-c3ae9207f995)

