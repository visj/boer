# [2120] Validate Geojson

Hey, I am trying to use Ajv for validating some GeoJSON, however I can't make it work. I am not sure if it is possible or Ajv just can't translate the Typescript.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

 I am using Ajv version "^8.11.0"

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
// This is already from GeoJson library
export interface Feature<G extends Geometry | null = Geometry, P = GeoJsonProperties> extends GeoJsonObject {
    type: 'Feature';
    /**
     * The feature's geometry
     */
    geometry: G;
    /**
     * A value that uniquely identifies this feature in a
     * https://tools.ietf.org/html/rfc7946#section-3.2.
     */
    id?: string | number | undefined;
    /**
     * Properties associated with this feature.
     */
    properties: P;
}

export declare type WaypointProps = {
    radiusMeters?: number;
};

export declare type Waypoint<T extends Anything = Anything> = Feature<Point, WaypointProps & T>;

```

**Typescript compiler error messages**

```
Type '{ type: "object"; required: ("type" | "geometry" | "properties")[]; properties: { type: { const: "Feature"; type: "string"; }; geometry: { type: "object"; required: ("type" | "coordinates")[]; if: { properties: { ...; }; }; then: { ...; }; }; id: { ...; }; bbox: { ...; }; properties: { ...; }; }; }' is not assignable to type 'UncheckedJSONSchemaType<Waypoint<Anything>, false>'.
  The types of 'properties.properties' are incompatible between these types.
    Type '{ type: "object"; properties: { radiusMeters: { type: "number"; nullable: true; }; }; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<WaypointProps & Anything, false> & { const?: (WaypointProps & Anything) | undefined; enum?: readonly (WaypointProps & Anything)[] | undefined; default?: (WaypointProps & Anything) | undefined; })'.
      Types of property 'properties' are incompatible.
        Type '{ radiusMeters: { type: "number"; nullable: true; }; }' is not assignable to type 'UncheckedPropertiesSchema<WaypointProps & Anything>'.
          Property 'radiusMeters' is incompatible with index signature.
            Type '{ type: "number"; nullable: true; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<unknown, false> & { nullable: true; const?: null | undefined; enum?: readonly unknown[] | undefined; default?: unknown; })'.
              Type '{ type: "number"; nullable: true; }' is not assignable to type '{ type: readonly never[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<...> | undefined; } & { ...; }'.
                Type '{ type: "number"; nullable: true; }' is not assignable to type '{ type: readonly never[]; }'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'readonly never[]'.
```

**This is the schema I am trying to write:**

```typescript
const WaypointValidation: JSONSchemaType<Waypoint> = {
    type: 'object',
    required: ["geometry", "properties", "type"],
    properties: {
        type: { const: "Feature", type: "string" },
        geometry: {
            type: "object",
            required: ["coordinates", "type"],
            if: { properties: { type: { const: "Circle" } } },
            then: { required: ["radius"], properties: { radius: { type: "number" } } }
        },
        id: { type: ["string", "number"], nullable: true },
        bbox: {
            type: "array",
            nullable: true,
            minItems: 4,
            maxItems: 6,
            additionalItems: true,
            items: { type: "number" }
        },
        properties: {
            type: "object",
            properties: {
                radiusMeters: { type: "number", nullable: true }
            }
        }
    }
};
```

**Describe the change that should be made to address the issue?**

Does Ajv supports GeoJson? I can see that GeoJson types are very complex and flexible.
