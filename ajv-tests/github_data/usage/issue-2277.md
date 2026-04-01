# [2277] Output from ajv/dist/standalone not including custom-formats with validate function

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

```
"ajv": "8.12.0"
"ajv-formats": "2.1.1"
```


**Ajv options object**

```javascript
const ajv = new Ajv({code: {source: true}})
```

**JSON Schema**

```json
{
  "$id": "https://example.com/bar.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "bar": { "type": "string" },
    "testval": { "type": "string", "format": "identifier" },
    "testval2": { "type": "string", "format": "custom-format" },
  },
  "required": ["bar"]
}
```

**Your code**

```javascript
const fs = require("node:fs")
const path = require("node:path")

const Ajv = require("ajv")
const addFormats = require("ajv-formats")
const standaloneCode = require("ajv/dist/standalone").default

const schema = {
  $id: "https://example.com/bar.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    bar: {type: "string"},
    testval: {type: "string", format: 'identifier' },
    testval2: {type: "string", format: 'custom-format' },
  },
  "required": ["bar"]
}

const ajv = new Ajv({ code: {source: true} })
addFormats(ajv)

ajv.addFormat("identifier", /^a-z\$_[a-zA-Z$_0-9]*$/);

ajv.addFormat("custom-format", {
  type: "number",
  validate: (x) => x >= 0 && x <= 255 && x % 1 == 0,
})

const validate = ajv.compile(schema)
let moduleCode = standaloneCode(ajv, validate)
```

**moduleCode AFTER running the prev script**

```javascript
"use strict";
module.exports = validate10;
module.exports.default = validate10;
const schema11 = {
  $id: "https://example.com/bar.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    bar: { type: "string" },
    testval: { type: "string", format: "identifier" },
    testval2: { type: "string", format: "custom-format" },
  },
  required: ["bar"],
};
const formats0 = /^a-z\$_[a-zA-Z$_0-9]*$/;
const formats2 = require("ajv-formats/dist/formats").fullFormats[
  "custom-format"
];
function validate10(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  /*# sourceURL="https://example.com/bar.json" */ let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.bar === undefined && (missing0 = "bar")) {
        validate10.errors = [
          {
            instancePath,
            schemaPath: "#/required",
            keyword: "required",
            params: { missingProperty: missing0 },
            message: "must have required property '" + missing0 + "'",
          },
        ];
        return false;
      } else {
        if (data.bar !== undefined) {
          const _errs1 = errors;
          if (typeof data.bar !== "string") {
            validate10.errors = [
              {
                instancePath: instancePath + "/bar",
                schemaPath: "#/properties/bar/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string",
              },
            ];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.testval !== undefined) {
            let data1 = data.testval;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (errors === _errs3) {
                if (typeof data1 === "string") {
                  if (!formats0.test(data1)) {
                    validate10.errors = [
                      {
                        instancePath: instancePath + "/testval",
                        schemaPath: "#/properties/testval/format",
                        keyword: "format",
                        params: { format: "identifier" },
                        message: 'must match format "' + "identifier" + '"',
                      },
                    ];
                    return false;
                  }
                } else {
                  validate10.errors = [
                    {
                      instancePath: instancePath + "/testval",
                      schemaPath: "#/properties/testval/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string",
                    },
                  ];
                  return false;
                }
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.testval2 !== undefined) {
              let data2 = data.testval2;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (typeof data2 == "number" && isFinite(data2)) {
                  if (!formats2.validate(data2)) {
                    validate10.errors = [
                      {
                        instancePath: instancePath + "/testval2",
                        schemaPath: "#/properties/testval2/format",
                        keyword: "format",
                        params: { format: "custom-format" },
                        message: 'must match format "' + "custom-format" + '"',
                      },
                    ];
                    return false;
                  }
                }
                if (errors === _errs5) {
                  if (!(typeof data2 === "string")) {
                    validate10.errors = [
                      {
                        instancePath: instancePath + "/testval2",
                        schemaPath: "#/properties/testval2/type",
                        keyword: "type",
                        params: { type: "string" },
                        message: "must be string",
                      },
                    ];
                    return false;
                  }
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate10.errors = [
        {
          instancePath,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        },
      ];
      return false;
    }
  }
  validate10.errors = vErrors;
  return errors === 0;
}

```

**What results did you expect?**

The `const formats2` should be inlined and not loaded from the `ajv-formats/dist/formats` file.  
It works with the simpler RegExp (`const formats0 = /^a-z\$_[a-zA-Z$_0-9]*$/;`) but not if I use a custom validate function.
