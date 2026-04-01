# [965] Multiple if then else

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.10.0


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

"allOf": [
    {
      "allOf": [
        {
          "if": {
            "properties": {
              "alicense": {
                "const": true
              }
            }
          },
          "then": {
            "required": [
              "alicense_comment"
            ]
          }
        }
      ]
    },
    {
      "allOf": [
        {
          "if": {
            "properties": {
              "blicense": {
                "const": true
              }
            }
          },
          "then": {
            "required": [
              "blicense_comment"
            ]
          }
        }
      ]
    }
  ]

```

**Validation result, data AFTER validation, error messages**

Even if only **one** of the if conditions is satisfied **both** then clauses are applied. Thus both comment fields are required.

**What results did you expect?**

If should apply only to then (and else) in the same allOf scope.

**Are you going to resolve the issue?**

I will try a workaround with if in schema dependency.

Last but not least: Many thanks for such a great tool like ajv!