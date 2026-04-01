# [1177] strictKeywords option complains about keywords defined in meta-schema

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.12.0

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{
  allErrors: true,
  jsonPointers: true,
  strictDefaults: true,
  strictKeywords: true,
  useDefaults: "empty"
}
```

**JSON Meta Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
const dataMetaSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://json-schema.mycompany.com/2019-12/data-meta-schema#',
    title: 'Data Meta-Schema',
    definitions: {
        schemaArray: {
            allOf: [
                { $ref: 'http://json-schema.org/draft-07/schema#/definitions/schemaArray' },
                {
                    items: { $ref: '#' }
                }
            ]
        },
        propertyName: {
            type: 'string',
            pattern: '^[A-Za-z_][A-Za-z0-9_]*[a-zA-Z0-9]$',
            minLength: 1,
            maxLength: 63
        },
        aUri: {
            type: 'string',
            format: 'uri'
        },
        ontology: {
            type: 'array',
            items: { $ref: '#/definitions/aUri' },
            minItems: 1,
            uniqueItems: true
        }
    },
    allOf: [{ $ref: 'http://json-schema.org/draft-07/schema#' }],
    properties: {
        properties: {
            type: 'object',
            additionalProperties: { $ref: '#' },
            propertyNames: {
                $ref: '#/definitions/propertyName'
            }
        },
        patternProperties: {
          type: 'object',
          additionalProperties: { $ref: 'http://json-schema.org/draft-07/schema#' },
          propertyNames: {
            format: 'regex'
          },
          default: {}
      },
      additionalProperties: { $ref: 'http://json-schema.org/draft-07/schema#' },
      dependencies: {
            additionalProperties: {
                anyOf: [
                    { $ref: '#' },
                    { type: 'array' }
                ]
            }
        },
        items: {
            anyOf: [
                { $ref: '#' },
                { $ref: '#/definitions/schemaArray' }
            ],
            default: true
        },
        if: { $ref: '#' },
        then: { $ref: '#' },
        else: { $ref: '#' },
        allOf: { $ref: '#/definitions/schemaArray' },
        anyOf: { $ref: '#/definitions/schemaArray' },
        oneOf: { $ref: '#/definitions/schemaArray' },
        not: { $ref: '#' },
        contains: { $ref: '#' },
        ontology: {
            $ref: '#/definitions/ontology'
        }
    }
};

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
const dataSchema = {
    $schema: 'https://json-schema.mycompany.com/2019-12/data-meta-schema#',
    $id: 'https://json-schema.mycompany.com/2019-12/sample-data-schema#',
    description: 'Data schema for describing a place',
    type: 'object',
    additionalProperties: true,
    required: ['name', 'address'],
    ontology: ['https://schema.org/Place'],
    properties: {
        name: {
            description: 'Name',
            type: 'string'
        },
        address: {
            description: 'Postal address',
            ontology: ['https://schema.org/PostalAddress'],
            type: 'object',
            required: ['streetAddress', 'locality', 'region', 'countryName'],
            properties: {
                streetAddress: {
                    description: 'Street address. E.g. 3315 Scott Blvd., Suite 250',
                    ontology: ['https://schema.org/streetAddress'],
                    type: 'string'
                },
                locality: {
                    description: 'The locality in which the street address is, and which is in the region. For example, Santa Clara',
                    ontology: ['https://schema.org/addressLocality'],
                    type: 'string'
                },
                region: {
                    description: 'The region in which the locality is, and which is in the country. For example, California',
                    ontology: ['https://schema.org/addressRegion'],
                    type: 'string'
                },
                postalCode: {
                    description: 'The postal code. For example, 95054',
                    ontology: ['https://schema.org/postalCode'],
                    type: 'string'
                },
                countryName: {
                    description: 'The country. For example, USA',
                    ontology: ['https://schema.org/addressCountry'],
                    type: 'string'
                }
            }
        }
    }
};


```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```javascript
const data = {
    name: "White House",
    address: {
        streetAddress: '1600 Pennsylvania Ave NW',
        locality: 'Washington',
        region: 'DC',
        postalCode: '20500',
        countryName: 'USA'
    }
};


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
const Ajv = require('ajv');
const ajv = new Ajv({
  allErrors: true,
  jsonPointers: true,
  strictDefaults: true,
  strictKeywords: true,
  useDefaults: "empty"
});

ajv.addMetaSchema(dataMetaSchema);

const dataValidator = ajv.compile(dataSchema);

console.log(dataValidator(data));


```


**Validation result, data AFTER validation, error messages**

```
/home/myelsukov/node_modules/ajv/lib/ajv.js:351
    throw e;
    ^

Error: unknown keyword: ontology
    at generate_validate (/home/melsukov/node_modules/ajv/lib/dotjs/validate.js:12:18)
    at localCompile (/home/melsukov/node_modules/ajv/lib/compile/index.js:88:22)
    at Ajv.compile (/home/melsukov/node_modules/ajv/lib/compile/index.js:55:13)
    at Ajv._compile (/home/melsukov/node_modules/ajv/lib/ajv.js:348:27)
    at Ajv.compile (/home/melsukov/node_modules/ajv/lib/ajv.js:114:37)
    at Object.<anonymous> (/home/melsukov/workspace-move/Profile/sample/schemas.js:149:27)
    at Module._compile (internal/modules/cjs/loader.js:1147:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1167:10)
    at Module.load (internal/modules/cjs/loader.js:996:32)
    at Function.Module._load (internal/modules/cjs/loader.js:896:14)


```

**What results did you expect?**

I would not expect this error to be thrown.

Note: `ajv` properly validates the schema against meta-schema. If one would define `ontology` property of the schema at any level as integer, `ajv` would properly complain.

**Are you going to resolve the issue?**
I assume you are asking if I am going to submit a patch. Unfortunately, my answer is no :(