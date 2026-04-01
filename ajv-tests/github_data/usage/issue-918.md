# [918] Error while validating null value in Object

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
"6.6.2"




**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "swagger": "2.0",
    "info": {
      "title": "###",
      "description": "###",
      "version": "2.0.0"
    },
    "host": "localhost:8082",
    "basePath": "/###/v2",
    "schemes": [
      "http",
      "https"
    ],
    "definitions": {
      "UsersReply": {
        "type": "object",
        "properties": {
          "Users": {
            "items": {
              "$ref": "#/definitions/User"
            }
          },
          "maxRecords": {
            "type": "integer",
            "description": "Unsigned integer represeting total number of users found."
          }
        }
      },
      "User": {
        "type": "object",
        "required": [
            "userId",
            "email",
            "fullName",
            "isActive",
            "accountId"
          ],
        "properties": {
          "userId": {
            "type": "string",
            "description": "UUID represeting unique userId.",
            "example": "CA761232-ED42-11CE-BACD-00AA0057B223"
          },
          "email": {
            "type": "string",
            "description": "Email of user."
          },
          "primaryEmail": {
            "type": "string",
            "description": "primaryEmai of user."
          },
          "fullName": {
            "type": "string"
          },
          "contactNumber": {
            "type": "string"
          },
          "speciality": {
            "type": "string"
          },
          "accountId": {
            "type": "string"
          },
          "enterpriseId": {
            "type": "string"
          },
          "createdDate": {
            "type": "string",
            "format": "date-time",
            "readOnly": true
          },
          "updatedDate": {
            "type": "string",
            "format": "date-time",
            "readOnly": true
          },
          "isDeleted": {
            "type": "boolean",
            "readOnly": true
          },
          "updatedByAdminUserId": {
            "type": "string",
            "readOnly": true
          },
          "lastLoginTime": {
            "type": "string",
            "readOnly": true,
            "format": "date-time"
          }
        }
      }
    },
    "paths": {
      "/users": {
        "get": {
          "tags": [
            "Users"
          ],
          "summary": "Get users.",
          "description": "Used to get users",
          "operationId": "getUsers",
          "responses": {
            "200": {
              "description": "successful operation",
              "schema": {
                "type": "object",
                "properties": {
                  "statusCode": {
                    "type": "string"
                  },
                  "statusMessage": {
                    "type": "string"
                  },
                  "reply": {
                    "$ref": "#/definitions/UsersReply"
                  }
                }
              }
            }
          }
        }
      }
    },
    "tags": [
      {
        "name": "Users",
        "description": "user APIs."
      }
    ],
    "parameters": {
      "UserId": {
        "name": "UserId",
        "in": "path",
        "description": "Account User id.",
        "required": true,
        "type": "string",
        "format": "UUID"
      }
    }
  }


```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
    "statusCode": "SCS",
    "statusMessage": "Success",
    "reply": {
        "Users": [
            {
                "userId": "8654001b-11ba-4001-a152-3ff9c11fa5cb",
                "email": "sample@sample.com",
                "primaryEmail": null,
                "fName": null,
                "lName": null,
                "fullName": "Temp User",
                "contactNumber": null,
                "speciality": null,
                "isActive": true,
                "accountId": "TEMP_ACCOUNT",
                "enterpriseId": null,
                "createdDate": "2019-01-08T05:35:54.143Z",
                "updatedDate": "2019-01-08T05:59:48.354Z",
                "isDeleted": false,
                "updatedByAdminUserId": null,
                "lastLoginTime": "2019-01-08T05:59:48.354Z"
            }
        ],
        "maxRecords": 553
    }
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

ajv.addSchema(schema, 'swagger.json');
let validate = ajv.compile({ $ref: 'swagger.json#/definitions/UsersReply/properties/Users' });
let valid = validate(responseData.reply.Users);
```


**Validation result, data AFTER validation, error messages**

```

[ { keyword: 'type',
    dataPath: '[0].primaryEmail',
    schemaPath: '#/definitions/User/properties/primaryEmail/type',
    params: { type: 'string' },
    message: 'should be string' } ]
```

**What results did you expect?**
It does not considers "null" value for primaryEmail key. API returns primaryKey key with null value, and primaryEmail field is not listed as a require field, so it giving "should be string" error. 
How to omit null value?

**Are you going to resolve the issue?**
