# [1380] ajv 2019: Cannot convert undefined or null to object

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`7.0.3` - Yes

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

```javascript
export const ajv = new Ajv({
  allErrors: true,
  useDefaults: "empty",
  $data: true,
  strict: false
});

ajv.addKeyword({
  keyword: "isNotEmpty",
  validate: (_schema: any, data: any) => !isEmpty(data),
  errors: false
});
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "type": "object",
    "properties": {
      "country_of_birth": {
        "type": "string",
        "enum": ["USA", "Other"]
      },
      "ssn": {
        "type": "string",
      },
      "confirm_ssn": {
        "type": "string",
      },
      "tax_id": {
        "type": "string"
      },
      "confirm_tax_id": {
        "type": "string"
      }
    },
    "allOf": [
      {
        "if": {
          "properties": {
            "country_of_birth": {
              "const": "Other"
            }
          }
        },
        "then": {
          "allOf": [
            {
              "if": {
                "properties": {
                  "confirm_tax_id": {
                    "isNotEmpty": true
                  }
                }
              },
              "then": {
                "properties": {
                  "tax_id": {
                    "isNotEmpty": true
                  }
                }
              }
            },
            {
              "if": {
                "properties": {
                  "tax_id": {
                    "isNotEmpty": true
                  }
                }
              },
              "then": {
                "properties": {
                  "confirm_tax_id": {
                    "isNotEmpty": true
                  }
                }
              }
            }
          ]
        }
      },
      {
        "if": {
          "properties": {
            "country_of_birth": {
              "const": "USA"
            }
          }
        },
        "then": {
          "allOf": [
            {
              "if": {
                "properties": {
                  "confirm_ssn": {
                    "isNotEmpty": true
                  }
                }
              },
              "then": {
                "properties": {
                  "ssn": {
                    "isNotEmpty": true
                  }
                }
              }
            },
            {
              "if": {
                "properties": {
                  "ssn": {
                    "isNotEmpty": true
                  }
                }
              },
              "then": {
                "properties": {
                  "confirm_ssn": {
                    "isNotEmpty": true
                  }
                }
              }
            }
          ]
        }
      }
    ]
  }
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
   "country_of_birth": "USA",
   "ssn": "1",
   "confirm_ssn": "1",
}
```

**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

Here's a sandbox to test the issue: https://codesandbox.io/s/form-generator-test-bug-07368?file=/src/App.tsx

**What results did you expect?**
I expect the form to work properly for both `country_of_birth` values. Instead what you see is if you change `country_of_birth` to `USA` and try to validate both `ssn` and `confirm_ssn` fields, an error is thrown. This behavior does not happen if you set `country_of_birth` to `Other` (which will trigger the validation on `tax_id`/`confirm_tax_id` rather than `ssn`).

In `src/form-generator/helpers.ts` If you change the import from `ajv/dist/2019` to `ajv` you will not see the error. Also, if you change the order of the `allOf` array items it will change which fields throw the error.

**Are you going to resolve the issue?**
No