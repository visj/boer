# [1566] $ref does not appear to be inlining top level properties during validation

Thank you for a lovely library!  It has saved me and my team countless hours.  You all rock. 

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.1.0

**Ajv options object**
_none_

```javascript
const Ajv = require('ajv');
const schema = require('./src/schema.json');
const config = require('./testy.json');

async function main() {
  const ajv = new Ajv();
  const validateSchema = ajv.compile(schema);
  const isValid = await validateSchema(config);
  if (!isValid) {
    console.error(validateSchema.errors);
  } else {
    console.log('👌');
  }
}
main();
```

**JSON Schema**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Sync Repo Settings Config",
  "description": "Schema for defining the sync repo settings config",
  "additionalProperties": false,
  "type": "object",
  "$ref": "#/definitions/repoConfig",
  "definitions": {
    "repoConfig": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "name": {
          "description": "A simple label for describing the ruleset.",
          "type": "string"
        },
        "selector": {
          "description": "For use in the org/.github repository. A GitHub repo search query that identifies the repositories which should be managed by the given rule.",
          "type": "boolean"
        },
        "squashMergeAllowed": {
          "description": "Whether or not squash-merging is enabled on this repository.",
          "type": "boolean"
        },
        "rebaseMergeAllowed": {
          "description": "Whether or not rebase-merging is enabled on this repository.",
          "type": "boolean"
        },
        "mergeCommitAllowed": {
          "description": "Whether or not PRs are merged with a merge commit on this repository.",
          "type": "boolean"
        },
        "deleteBranchOnMerge": {
          "description": "Either true to allow automatically deleting head branches when pull requests are merged, or false to prevent automatic deletion.",
          "type": "boolean"
        },
        "branchProtectionRules": {
          "description": "Branch protection rules",
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "pattern": {
                "description": "Identifies the protection rule pattern.",
                "type": "string"
              },
              "dismissesStaleReviews": {
                "description": "Will new commits pushed to matching branches dismiss pull request review approvals.",
                "type": "boolean"
              },
              "isAdminEnforced": {
                "description": "Can admins overwrite branch protection.",
                "type": "boolean"
              },
              "requiredApprovingReviewCount": {
                "description": "Number of approving reviews required to update matching branches.",
                "type": "number"
              },
              "requiredStatusCheckContexts": {
                "description": "List of required status check contexts that must pass for commits to be accepted to matching branches.",
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "requiresCodeOwnerReviews": {
                "description": "Are reviews from code owners required to update matching branches.",
                "type": "boolean"
              },
              "requiresCommitSignatures": {
                "description": "Are commits required to be signed.",
                "type": "boolean"
              },
              "requiresStatusChecks": {
                "description": "Are status checks required to update matching branches.",
                "type": "boolean"
              },
              "requiresStrictStatusChecks": {
                "description": "Are branches required to be up to date before merging.",
                "type": "boolean"
              },
              "restrictsPushes": {
                "description": "Is pushing to matching branches restricted.",
                "type": "boolean"
              },
              "restrictsReviewDismissals": {
                "description": "Is dismissal of pull request reviews restricted.",
                "type": "boolean"
              }
            }
          }
        },
        "permissionRules": {
          "description": "List of explicit permissions to add (additive only)",
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "team": {
                "description": "Team slug to provide access.",
                "type": "string"
              },
              "permission": {
                "description": "Permission to provide the team.  Can be one of (pull|push|admin)",
                "type": "string",
                "enum": ["pull", "push", "admin"]
              }
            },
            "required": ["team", "permission"]
          }
        }
      }
    }
  }
}
```

**Sample data**

```json
{
  "rebaseMergeAllowed": false,
  "branchProtectionRules": [
     {
        "requiresCodeOwnerReviews": true,
        "requiredStatusCheckContexts": [
           "check1",
           "check2"
        ]
     }
  ],
  "permissionRules": [
     {
        "team": "team1",
        "permission": "push"
     }
  ]
}
```

**Your code**

```javascript
const Ajv = require('ajv');
const schema = require('./src/schema.json');
const config = require('./testy.json');

async function main() {
  const ajv = new Ajv();
  const validateSchema = ajv.compile(schema);
  const isValid = await validateSchema(config);
  if (!isValid) {
    console.error(validateSchema.errors);
  } else {
    console.log('👌');
  }
}
main();
```

**Validation result, data AFTER validation, error messages**

```
[
  {
    instancePath: '',
    schemaPath: '#/additionalProperties',
    keyword: 'additionalProperties',
    params: { additionalProperty: 'rebaseMergeAllowed' },
    message: 'must NOT have additional properties'
  }
]
```

**What results did you expect?**
Using `$ref` at the top level, I expected it to identify the properties in `repoConfig` as laid out.  I have `additionalProperties` set to `false`, and that seems to be causing the validation errors to come up.  


**Are you going to resolve the issue?**
I can always try, but I suspect it will be over my head 🤣   I admit to being fairly new JSON Schema, and I'm not 100% sure I'm doing everything right.  I also posted this question to Stack Overflow:
https://stackoverflow.com/questions/67248783/how-to-use-ref-with-json-schema-and-top-level-properties

The main reason I filed an issue here is that according to https://www.jsonschemavalidator.net/, everything I'm doing looks to be correct - but again, I am super new at this.


