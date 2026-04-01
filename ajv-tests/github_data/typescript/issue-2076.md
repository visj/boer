# [2076] Schema properties assigned `any` type if imported in another file

When a schema gets imported to another file it's properties all get assigned `any` type.

This is based on the info displayed by the VS Code's Intellisense.

Here's an example I've tested inside a cloned Ajv repo v8.11.0:

The following snippet contains the schema definition for a *Car* object:
```typescript
/* CarSchema.ts */

import { JSONSchemaType } from "../lib/ajv";

export type Car =
{
    carBrand: string,
    carModel: string,
};

export const CarSchema: JSONSchemaType<Car> = {
     type: "object",
     properties: {
         carBrand: { type: "string", minLength:1, maxLength:20 },
         carModel: { type: "string", minLength:1, maxLength:56 },
     },
     required: [ "carBrand", "carModel" ],
};

// (property) properties?: UncheckedPropertiesSchema<Car> | undefined
type PropertiesType = typeof CarSchem.properties;
```

As you can see the list line of the previous snippet, the type of the `properties` equals `UncheckedPropertiesSchema<Car> | undefined`, as expected.

This changes if you try importing and using this schema in another file:

```typescript
/* BmwCarSchema.ts */

import { CarSchem } from "./CarSchema";

// (property) properties?: any
type PropertiesType = typeof CarSchem.properties;
```
As you can see `properties` has been assigned `any` type.

I've managed to create a workaround which does help with this issue but does not fix it.

The following file shows the workaround (only the last line has been added - the rest is unchanged):
```typescript
/* CarSchema.ts */

import { JSONSchemaType } from "../lib/ajv";

export type Car =
{
    carBrand: string,
    carModel: string,
};

export const CarSchema: JSONSchemaType<Car> = {
     type: "object",
     properties: {
         carBrand: { type: "string", minLength:1, maxLength:20 },
         carModel: { type: "string", minLength:1, maxLength:56 },
     },
     required: [ "carBrand", "carModel" ],
};

// (property) properties?: UncheckedPropertiesSchema<Car> | undefined
type PropertiesType = typeof CarSchem.properties;

// setting type of the exported value
export const CarSchemaFixed: typeof CarSchema = CarSchema;
```
Now in our `BmwCarSchema` file use the newly exported value:

```typescript
/* BmwCarSchema.ts */

import { CarSchem, CarSchemaFixed } from "./CarSchema";

// (property) properties?: any
type PropertiesType = typeof CarSchem.properties;

// (property) properties?: UncheckedPropertiesSchema<Car> | undefined
type PropertiesTypeFixed = typeof CarSchemaFixed.properties;
```
As you can see now the `properties` property is correctly typed (the last line).

I'm not sure this is the AJV issue or a TypeScript thing ...