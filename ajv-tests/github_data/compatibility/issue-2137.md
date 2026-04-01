# [2137] Runtime error on validation/compile of a schema file

Original issue #1396 closed; hence writing this one.

Ajv Version: "^8.11.0"

Package.json Dependencies:
```
"dependencies": {
    "@angular/animations": "13.0.1",
    "@angular/cdk": "13.0.1",
    "@angular/common": "13.0.1",
    "@angular/compiler": "13.0.1",
    "@angular/core": "13.0.1",
    "@angular/forms": "13.3.6",
    "@angular/material": "13.3.6",
    "@angular/platform-browser": "13.0.1",
    "@angular/platform-browser-dynamic": "13.3.6",
    "@angular/router": "13.3.6",
    "@auth0/auth0-angular": "1.9.0",
    "@ngx-translate/core": "13.0.0",
    "@ngx-translate/http-loader": "7.0.0",   
    "@swimlane/ngx-datatable": "20.0.0",
    "ajv": "^8.11.0",
    "exceljs": "4.3.0",
    "file-saver": "2.0.5",
    "material-icons": "0.6.4",
    "moment": "2.29.4",
    "moment-timezone": "0.5.37",
    "ngx-bootstrap": "6.2.0",
    "rxjs": "6.6.7",
    "tslib": "2.4.0",
    "zone.js": "0.11.5"
  }
```

Sample Code:

```
import Ajv, { ErrorObject } from 'ajv';
const schema = await this.sicamService.fetchFromNetwork().toPromise();//Gets the raw json file content
const ajv = new Ajv({ allErrors: true, verbose: !environment.production, allowMatchingProperties: true });

var compiled = ajv.compile(schema);
const valid = ajv.validate(schema, catalogObj);
if(valid)
//do something

//compiling the raw sceham
var compiled = ajv.compile(schema);
if(compiled(catalogObj))
//do something
```


Json Schema data:

```
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "$ref": "#/definitions/catalog",
  "definitions": {
    "catalog": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "uploadDateTime": {
          "type": "string"
        },
        "fileFormatVersion": {
          "type": "integer"
        },
        "supportedDeviceTypes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/DeviceType"
          }
        },
        "licenses": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/License"
          }
        }
      },
      "required": ["fileFormatVersion", "licenses", "supportedDeviceTypes"],
      "title": "catalog"
    },
    "License": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "id": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "values": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Value"
          }
        }
      },
      "required": ["description", "id", "values"],
      "title": "License"
    },
    "Value": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "Version": {
          "type": "integer"
        },
        "description": {
          "type": "string"
        },
        "ID": {
          "type": "string"
        },
        "visible": {
          "type": "boolean"
        },
        "deviceTypes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/DeviceType"
          }
        },
        "Common": {
          "$ref": "#/definitions/Common"
        }
      },
      "patternProperties": {
        "^[A-Z][0-9]*$": {
          "type": "object",
          "properties": {
            "allowedInstances": {
              "type": "integer"
            }
          }
        }
      },
      "required": ["Common", "ID", "Version", "description", "deviceTypes", "visible"],
      "title": "Value"
    },
    "Common": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "functionPoints": {
          "type": "integer"
        },
        "allowedInstances": {
          "type": "integer"
        }
      },
      "required": ["allowedInstances", "functionPoints"],
      "title": "Common"
    },
    "DeviceType": {
      "type": "string",
      "enum": ["CP8", "CP", "S8"],
      "title": "DeviceType"
    }
  }
}

```

**The above schema and payload works in all our local/QA environments/builds. Only on the production environment/build; it fails to compile/validate.**

The error we get is:
`299.5893aca7a838581f.js:1 Error compiling schema, function code: const schema2 = scope.schema[2];const schema1 = scope.schema[1];return function validate1(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(!(((typeof data == "number") && (!(data % 1) && !isNaN(data))) && (isFinite(data)))){const err0 = {instancePath,schemaPath:"#/definitions/nonNegativeInteger/type",keyword:"type",params:{type: "integer"},message:"must be integer"};if(vErrors === null){vErrors = [err0];}else {vErrors.push(err0);}errors++;}if((typeof data == "number") && (isFinite(data))){if(data < 0 || isNaN(data)){const err1 = {instancePath,schemaPath:"#/definitions/nonNegativeInteger/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};if(vErrors === null){vErrors = [err1];}else {vErrors.push(err1);}errors++;}}validate1.errors = vErrors;return errors === 0;}`

Angular.json:

```
"configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "crossOrigin": "use-credentials",
              "optimization": {
                "scripts": true,
                "styles": {
                  "minify": true,
                  "inlineCritical": false
                },
                "fonts": false
              },
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true,
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "4mb",
                  "maximumError": "7mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "6kb",
                  "maximumError": "10kb"
                }
              ],
              "deleteOutputPath": true
            }
}
```

Kindly please help?