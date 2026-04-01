# [2567] JSONSchemaType not matching Typescript Type on oneOf with objects

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.17.1 - currently latest available version

**Ajv options object**

```typescript
// not needed, just Typescript Types
```

**JSON Schema**

```json
{
    "type": "object",
    "discriminator": {
        "propertyName": "animal"
    },
    "required": ["animal"],
    "oneOf": [
        {
            "title": "Cat",
            "properties": {
                "animal": {
                    "const": "Cat"
                },
                "food": {
                    "enum": ["meat", "grass", "fish"],
                    "type": "string"
                }
            },
            "required": ["food"]
        },
        {
            "title": "Fish",
            "properties": {
                "animal": {
                    "const": "Fish"
                },
                "food": {
                    "enum": ["insect", "worms"],
                    "type": "string"
                },
                "water": {
                    "enum": ["lake", "sea"],
                    "type": "string"
                }
            },
            "required": ["food", "water"]
        }
    ]
}
```

**Sample data**

```typescript
// not needed, just Typescript Types
```

**Your code**

```typescript
type AnimalExampleType =
    | {
          animal: "Cat";
          ears: number; // missing in schema intentionally
          food: "fish" | "grass" | "meat";
      }
    | {
          animal: "Fish";
          food: "insect" | "worms";
          water: "lake" | "sea";
      };

// should report error in tsc, because 'ears' are missing in 'Cat'
const AnimalExampleSchema_OneOf: JSONSchemaType<AnimalExampleType> = {
    type: "object",
    discriminator: {
        propertyName: "animal",
    },
    required: ["animal"],
    oneOf: [
        {
            title: "Cat",
            properties: {
                animal: {
                    const: "Cat",
                },
                food: {
                    enum: ["meat", "grass", "fish"],
                    type: "string",
                },
            },
            required: ["food"],
        },
        {
            title: "Fish",
            properties: {
                animal: {
                    const: "Fish",
                },
                food: {
                    enum: ["insect", "worms"],
                    type: "string",
                },
                water: {
                    enum: ["lake", "sea"],
                    type: "string",
                },
            },
            required: ["food", "water"],
        },
    ],
};
```

**Validation result, data AFTER validation, error messages**

```typescript
// no tsc errors appear, even the 'ears' for 'Cat' are missing
```

**What results did you expect?**
tsc to report Type mismatch