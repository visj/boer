# [2008] Reference an optional object schema JSONSchemaType

I have 2 interfaces, one which references another. Im trying to write some validatoin schema that allow for the optional field of `ICreateBrandRequest.industires`

but i get the following error:

>  error TS2322: Type '{ type: "object"; properties: { name: { type: "string"; }; website: { type: "string"; }; slug: { type: "string"; }; image_id: { type: "string"; }; industries: { type: "array"; $ref: { type: "object"; additionalProperties?: boolean | ... 1 more ... | undefined; ... 8 more ...; maxProperties?: number | undefined; } & ...' is not assignable to type 'UncheckedJSONSchemaType<ICreateBrandRequest, false>'.
>   The types of 'properties.industries' are incompatible between these types.
>     Type '{ type: "array"; $ref: { type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<...> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<ICreateBrandIndustryRequest[] | undefined, false> & { nullable: true; const?: null | undefined; enum?: readonly (ICreateBrandIndustryRequest[] | ... 1 more ... | undefined)[] | undefined; default?: ICreateBrandIndustryRequest[] | ... 1 more ... | undefined; })'.
>       Types of property '$ref' are incompatible.
>         Type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }' is not assignable to type 'string | undefined'.
>           Type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }' is not assignable to type 'string'.
> 
> 30 export const CreateBrandRequestSchema: JSONSchemaType<ICreateBrandRequest> = {


```
export interface ICreateBrandRequest {
    name: string;
    slug: string;
    website: string;
    image_id: string;
    industries?: ICreateBrandIndustryRequest[];
}

export interface ICreateBrandIndustryRequest {
    brand_id: string;
    industry_id: string;
}

export const CreateBrandIndustryRequestSchema: JSONSchemaType<ICreateBrandIndustryRequest> = {
    type: "object",
    properties: {
        brand_id: { type: "string" },
        industry_id: { type: "string" },
    },
    required: ["brand_id", "industry_id"],
    additionalProperties: true,
};

export const CreateBrandRequestSchema: JSONSchemaType<ICreateBrandRequest> = {
    type: "object",
    properties: {
        name: { type: "string" },
        website: { type: "string" },
        slug: { type: "string" },
        image_id: { type: "string" },
        industries: {
            type: "array",
            $ref: CreateBrandIndustryRequestSchema,
        },
    },
    required: ["name", "slug", "website"],
    additionalProperties: false,
}
```

What am i doing wrong here? ( im fairly new to using this library )