# [1535] $ref resolution process change in v7 (bug in v6)

Apologies for the fairly long JSON schema. It is a stripped down version of a quite large schema which is being bundled using `json-schema-ref-parser`. The problem occurs with the $ref values. The ajv-cli version 3.3.0 compiles the schema and claims it is valid. Newer versions of AJV can't compile as it cannot resolve the reference.

The problem seems to be that the $ref for property `ContainedWithin` is pointing to `ShipperBookingLineParent` which in turn points to `ShipperBookingLine`.

- I know it's a bit convoluted, but is AJV supposed to be able to resolve that kind of reference (apparently in older version it was ok) or is it not supported anymore?

It is possible to update the `$ref` by removing parts of it (`ShipperBookingLineParent/allOf/5/properties/`) however the non-stripped down schema has many `$ref` which are created by `json-schema-ref-parser` so I am not able to post process them in a meaningful manner as some would require removal and others replacement of paths. Perhaps also worth mentioning that the tool Stoplight Studio has no problem resolving the reference.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
ajv-cli 5.0.0
ajv 8.0.5 (Have a Javascript running with this version, same result)

**Ajv options object**
Not used - running with defaults

**JSON Schema**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/models/01-MaerskInformationModel-Bundled/Booking/ShipperBooking/ShipperBooking-bundled.v1-stripped.json",
  "type": "object",
  "properties": {
    "ShipperBookingLines": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "DangerousCargoInformation": {
            "type": "object",
            "properties": {
              "HazardousClassification": {
                "type": "object",
                "properties": {
                  "RequiredDangerousCommodityPackageType": {
                    "type": "object",
                    "properties": {
                      "AwesomeProperty": {
                        "type": "string"
                      },
                      "ContainedWithin": {
                        "$ref": "#/properties/ShipperBookingLines/items/properties/ShipperBookingLineParent/properties/DangerousCargoInformation/properties/HazardousClassification/properties/RequiredDangerousCommodityPackageType"
                      }
                    }
                  }
                }
              }
            }
          },
          "ShipperBookingLineParent": {
            "$ref": "#/properties/ShipperBookingLines/items"
          }
        }
      }
    }
  }
}
```

**Sample data**

Not applicable, schema compilation fails

**Your code**

```
npx ajv-cli compile -s ShipperBooking-bundled.v1-stripped.json
```

**Validation result, data AFTER validation, error messages**
ajv-cli:
```
schema ShipperBooking-bundled.v1-stripped.json is invalid
error: can't resolve reference #/properties/ShipperBookingLines/items/properties/ShipperBookingLineParent/properties/DangerousCargoInformation/properties/HazardousClassification/properties/RequiredDangerousCommodityPackageType from id /models/01-MaerskInformationModel-Bundled/Booking/ShipperBooking/ShipperBooking-bundled.v1-stripped.json
```
ajv:
```
MissingRefError: can't resolve reference #/properties/ShipperBookingLines/items/properties/ShipperBookingLineParent/properties/DangerousCargoInformation/properties/HazardousClassification/properties/RequiredDangerousCommodityPackageType from id /models/01-MaerskInformationModel-Bundled/Booking/ShipperBooking/ShipperBooking-bundled.v1-stripped.json
    at Object.code (C:\dev\workspace2\JSON-schema-test\node_modules\ajv\dist\vocabularies\core\ref.js:21:19)
    at keywordCode (C:\dev\workspace2\JSON-schema-test\node_modules\ajv\dist\compile\validate\index.js:451:13)
    at C:\dev\workspace2\JSON-schema-test\node_modules\ajv\dist\compile\validate\index.js:185:25
    at CodeGen.code (C:\dev\workspace2\JSON-schema-test\node_modules\ajv\dist\compile\codegen\index.js:439:13)
    at CodeGen.block (C:\dev\workspace2\JSON-schema-test\node_modules\ajv\dist\compile\codegen\index.js:568:18)
    at schemaKeywords (C:\dev\workspace2\JSON-schema-test\node_modules\ajv\dist\compile\validate\index.js:185:13)
    at typeAndKeywords (C:\dev\workspace2\JSON-schema-test\node_modules\ajv\dist\compile\validate\index.js:129:5)
    at subSchemaObjCode (C:\dev\workspace2\JSON-schema-test\node_modules\ajv\dist\compile\validate\index.js:116:5)
    at subschemaCode (C:\dev\workspace2\JSON-schema-test\node_modules\ajv\dist\compile\validate\index.js:92:13)
    at KeywordCxt.subschema (C:\dev\workspace2\JSON-schema-test\node_modules\ajv\dist\compile\validate\index.js:425:9) {
  missingRef: '/models/01-MaerskInformationModel-Bundled/Booking/ShipperBooking/ShipperBooking-bundled.v1-stripped.json#/properties/ShipperBookingLines/items/properties/ShipperBookingLineParent/properties/DangerousCargoInformation/properties/HazardousClassification/properties/RequiredDangerousCommodityPackageType',
  missingSchema: '/models/01-MaerskInformationModel-Bundled/Booking/ShipperBooking/ShipperBooking-bundled.v1-stripped.json'
}
```
**What results did you expect?**
That the schema compiles as it does with ajv-cli 3.3.0

**Are you going to resolve the issue?**
I am not familiar with the AJV source code, so I can't.