# [1971] JTD fails validation of discriminated union

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "discriminator": "dicriminatorProperty",
    "mapping": {
        "manual": {
            "properties": {
                "first": { "type": "uint16" },
                "second": { "type": "uint16" },
                "third": { "type": "uint16" },
                "fourth": { "type": "uint16" },
                "fifth": { "type": "uint16" },
                "sixth": { "type": "uint16" },
                "additionalOne": { "type": "uint16" },
                "additionalTwo": { "type": "uint16" }
            }
        },
        "auto": {
            "properties": {
                "first": { "type": "uint16" },
                "second": { "type": "uint16" },
                "third": { "type": "uint16" },
                "fourth": { "type": "uint16" },
                "fifth": { "type": "uint16" },
                "sixth": { "type": "uint16" },
                "additionalThree": { "type": "uint16" }
            }
        }
    }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
 {
      "dicriminatorProperty": "manual",
      "first": 17,
      "second": 17,
      "third": 17,
      "fourth": 17,
      "fifth": 17,
      "sixth": 17,
      "additionalOne": 17,
      "additionalTwo": 17
}
```

**Your code**
```javascript
const commonProperties = {
    first: { type: "uint16" },
    second: { type: "uint16" },
    third: { type: "uint16" },
    fourth: { type: "uint16" },
    fifth: { type: "uint16" },
    sixth: { type: "uint16" }
};

const schema = {
    discriminator: "dicriminatorProperty",
    mapping: {
        manual: {
            properties: {
                ...commonProperties,
                additionalOne: { type: "uint16" },
                additionalTwo: { type: "uint16" }
            }
        },
        auto: {
            properties: {
                ...commonProperties,
                additionalThree: { type: "uint16" }
            }
        }
    }
};

const Ajv = require("ajv/dist/jtd");
const ajv = new Ajv();
const validate = ajv.compile(schema);

const data1 = {
    dicriminatorProperty: "manual",
    first: 17,
    second: 17,
    third: 17,
    fourth: 17,
    fifth: 17,
    sixth: 17,
    additionalOne: 17,
    additionalTwo: 17
};

const data2 = {
    dicriminatorProperty: "auto",
    first: 17,
    second: 17,
    third: 17,
    fourth: 17,
    fifth: 17,
    sixth: 17,
    additionalThree: 17
};

// ---------------------------------------------------
// This validation passes
// ---------------------------------------------------
console.log("Valid data1? ", validate(data1));

// ---------------------------------------------------
// This validation fails
// ---------------------------------------------------
console.log("Valid data2? ", validate(data2));
```

**Validation result, data AFTER validation, error messages**

```
{
    instancePath: "/dicriminatorProperty",
    schemaPath: "/mapping/manual",
    keyword: "properties",
    params: {
         error: "additional",
         additionalProperty: "dicriminatorProperty"
    },
    message: "must NOT have additional properties"
}
```

**What results did you expect?**
The number of properties in the object seems to be affecting the validation result. This should not happen and discriminator should not be recognised as an additional property.

**Are you going to resolve the issue?**
Resolution of this issue is non actionable by me