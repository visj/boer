# [983] Nullable true not being read on object

Hello, I'm using AJV to validate a response object to a OpenApi3.0 schema. Within the project we built a method thats a pass through to AJV called "schemaValdiator". The issue we ran into is that the ```nullable``` attribute doesn't appear to be read when nested in larges schemas. This results in an like described below. Even though ```nullable``` is set to true the validate method returns an error regarding the type. Changing ```"type": "object",``` to ```"type": ["object", "null"],``` will fix the issue but this feels hacky as AJV should read the ```"nullable": true``` attribute.

**Version:** 6.10.0

**TOP LEVEL JSON Schema**

```
{
  "type": "object",
  "required": ["propertiesOwned", "_links"],
  "properties": {
    "propertiesOwned": {
      "type": "array",
      "items": {
        "required": ["address"],
        "type": "object",
        "properties": {
          "address": {
            "description": "Object containing properties regarding the clients address.",
            "nullable": true,
            "type": "object",
            "required": ["street", "street2", "city", "state", "zipCode"],
            "properties": {
              "street": {
                "description": "Primary street of subject property address",
                "type": "string",
                "example": "1234 street"
              },
              "street2": {
                "description": "Secondary street of subject property address",
                "type": "string",
                "nullable": true,
                "example": "Apt. 1234"
              },
              "city": {
                "description": "City of subject property address",
                "type": "string",
                "example": "SomeCity"
              },
              "state": {
                "description": "State of subject property address",
                "type": "string",
                "example": "MI"
              },
              "zipCode": {
                "description": "ZipCode of subject property address",
                "type": "string",
                "example": "48124"
              },
              "county": {
                "description": "County of subject property address",
                "type": "string",
                "nullable": true,
                "example": "Wayne"
              },
              "countyFIPS": {
                "description": "CountyFIPS of subject property address",
                "type": "string",
                "nullable": true,
                "example": "26163"
              },
              "addressId": {
                "description": "ID assigned to address",
                "type": "string",
                "nullable": true,
                "example": "221133"
              }
            }
          }
        }
      }
    },
    "_links": {
      "description": "List of links for next RM steps (RM only)",
      "type": "array",
      "example": [
        {
          "rel": "self",
          "href": "http://localhost:8080/loanApplications/1234/refinanceGoal"
        }
      ]
    }
  }
}
```


**Sample data**

```
{
  "propertiesOwned": [
    {
      "address": {
        "street": "123 My Street",
        "city": "Ann Arbor",
        "state": "MI",
        "zipCode": "47001",
        "street2": null,
        "county": "Wayne",
        "countyFIPS": "999"
      }
    }
  ],
  "_links": [
    {
      "rel": "self",
      "href": "http://localhost:8080/loanApplications/bb6e21e0-e4d8-460a-91b2-157fb1a11952/propertiesOwned"
    }
  ]
}
```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const validator = (schema: string, schemaName: string): SchemaValidator => {
    return {
        validate(object: {}) {
            return $RefParser.dereference(schema, dereferencerConfig)
                .then((dereferencedSchema: {}) => {

                    const validate: ajv.ValidateFunction = ajv().compile(dereferencedSchema);

                    validate(object);

                    if (validate.errors) {
                        const message = validate.errors.map((error) => inspect(error, false, 100)).join();
                        throw new Error(schemaName + message);
                    }
                });
        },
    };
};
```


**Validation result, data AFTER validation, error messages**

```
Error: getPropertiesOwnedResponse{ keyword: 'type',
  dataPath: '.propertiesOwned[0].address',
  schemaPath: '#/properties/propertiesOwned/items/properties/address/type',
  params: { type: 'object' },
  message: 'should be object' }
    at $RefParser.dereference.then (shared-libs/build/schemaValidator/schemaValidator.js:39:27)
    at <anonymous>
```

**What results did you expect?**
Schema to be validated successfully.

