# [1727] How to make oneOf field nullable with typescript

I have  field called `platform` which can either be a `string` or a `string[]` this field can also be nullable/undefined (not passed).

**typescript interface**
```
export interface IEntityLeaderboardQuery {
    rank: string;
    entity_types: string[] | string;
    country?: string | undefined;
    region?: string | undefined;
    start_date: string;
    end_date: string;
    top?: string | undefined;
    platform?: string[] | string | undefined;
}
```

**json schema**

```
export const EntityLeaderboardQuerySchema: JSONSchemaType<IEntityLeaderboardQuery> = {
    type: "object",
    properties: {
        rank: { type: "string" },
        entity_types: {
            oneOf: [
                {
                    type: "string",
                },
                {
                    type: "array",
                    items: { type: "string" },
                },
            ],
        },
        country: { type: "string", nullable: true },
        region: { type: "string", nullable: true },
        start_date: { type: "string" },
        end_date: { type: "string" },
        top: { type: "string", nullable: true },
        platform: {
            oneOf: [
                {
                    type: "string",
                    nullable: true,
                },
                {
                    type: "array",
                    items: { type: "string" },
                    nullable: true,
                },
            ],
        },
    },
    required: ["rank", "entity_types", "start_date", "end_date"],
    additionalProperties: false,
};
```

As you can see ive attempted to add nullable field to both objects within the oneOf array. However there is still an issue with the types 

> [ERROR] 11:07:49 ⨯ Unable to compile TypeScript:
> src/api/leaderboard/entity/entity-leaderboard.interface.ts:43:14 - error TS2322: Type '{ type: "object"; properties: { rank: { type: "string"; }; entity_types: { oneOf: ({ type: "string"; } | { type: "array"; items: { type: "string"; }; })[]; }; country: { type: "string"; nullable: true; }; region: { ...; }; start_date: { ...; }; end_date: { ...; }; top: { ...; }; platform: { ...; }; }; required: ("ra...' is not assignable to type 'UncheckedJSONSchemaType<IEntityLeaderboardQuery, false>'.
>   Type '{ type: "object"; properties: { rank: { type: "string"; }; entity_types: { oneOf: ({ type: "string"; } | { type: "array"; items: { type: "string"; }; })[]; }; country: { type: "string"; nullable: true; }; region: { ...; }; start_date: { ...; }; end_date: { ...; }; top: { ...; }; platform: { ...; }; }; required: ("ra...' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.
>     Type '{ type: "object"; properties: { rank: { type: "string"; }; entity_types: { oneOf: ({ type: "string"; } | { type: "array"; items: { type: "string"; }; })[]; }; country: { type: "string"; nullable: true; }; region: { ...; }; start_date: { ...; }; end_date: { ...; }; top: { ...; }; platform: { ...; }; }; required: ("ra...' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.
>       The types of 'properties.platform' are incompatible between these types.
>         Type '{ oneOf: ({ type: "string"; nullable: boolean; } | { type: "array"; items: { type: "string"; nullable: boolean; }; nullable: boolean; })[]; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<string | string[] | undefined, false> & { nullable: true; const?: undefined; enum?: readonly (string | string[] | null | undefined)[] | undefined; default?: string | ... 2 more ... | undefined; })'.
>           Type '{ oneOf: ({ type: "string"; nullable: boolean; } | { type: "array"; items: { type: "string"; nullable: boolean; }; nullable: boolean; })[]; }' is not assignable to type '{ type: "array"; items: UncheckedJSONSchemaType<string, false>; contains?: UncheckedPartialSchema<string> | undefined; minItems?: number | undefined; ... 4 more ...; additionalItems?: undefined; } & { ...; } & { ...; } & { ...; }'.
>             Type '{ oneOf: ({ type: "string"; nullable: boolean; } | { type: "array"; items: { type: "string"; nullable: boolean; }; nullable: boolean; })[]; }' is missing the following properties from type '{ type: "array"; items: UncheckedJSONSchemaType<string, false>; contains?: UncheckedPartialSchema<string> | undefined; minItems?: number | undefined; ... 4 more ...; additionalItems?: undefined; }': type, items
> 
> 43 export const EntityLeaderboardQuerySchema: JSONSchemaType<IEntityLeaderboardQuery> = {

```
ajv: 8.6.2
typescipt: 4.3.5
```

https://replit.com/join/ngjynszvjr-kaykhan