# [2559] unevaluatedProperties can conflict with oneOf

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Issue is present in latest version (8.17.1) all the way back to when unevaluatedProperties was first supported in 7.0.0.

**Ajv options object**

Issue can be reproduced with no/default options object. Same issue occurs with `{ code: { source: true } }` (while I was tracing through the generated code).

**JSON Schema**

```json
{
    "type": "object",
    "$ref": "#/$defs/parent",
    "oneOf": [
        {
            "type": "object",
            "required": ["propFrom1stOneOf"],
            "properties": {
                "propFrom1stOneOf": true
            }
        },
        {
            "type": "object",
            "required": ["propFrom2ndOneOf"],
            "properties": {
                "propFrom2ndOneOf": true
            }
        }
    ],
    "unevaluatedProperties": false,
    "$defs": {
        "parent": {
            "type": "object",
            "properties": {
                "propFromParent": true
            }
        }
    }
}
```

**Sample data**

Works as expected:

```json
{ "propFromParent": true, "propFrom1stOneOf": true }
```

Fails with unevaluatedProperties error for propFromParent:

```json
{ "propFromParent": true, "propFrom2ndOneOf": true }
```

**Your code**

```javascript
const assert = require("node:assert");
const { writeFileSync } = require("node:fs");

const Ajv = require("ajv/dist/2020");
const standaloneCode = require("ajv/dist/standalone");

const ajv = new Ajv(options);
const validate = ajv.compile(schema);
// writeFileSync("./compiled.js", standaloneCode(ajv, validate));

assert(validate({ propFromParent: true, propFrom1stOneOf: true }));
assert(validate({ propFromParent: true, propFrom2ndOneOf: true })); // ! Fails with unevaluatedProperties error for propFromParent.
```

**Validation result, data AFTER validation, error messages**

```json
[
  {
    "instancePath": "",
    "schemaPath": "#/unevaluatedProperties",
    "keyword": "unevaluatedProperties",
    "params": {
      "unevaluatedProperty": "propFromParent"
    },
    "message": "must NOT have unevaluated properties"
  }
]
```

**What results did you expect?**

Properties defined in the parent/`$ref` should be considered "evaluated" regardless of if or how the `oneOf` is satisfied.

**Are you going to resolve the issue?**

I've tried to dig into where the problem might be coming from, but I'm honestly a bit stumped.

What I can say from looking at the compiled standalone code is that `propFromParent` is only added to the set of evaluated props if the first branch of the `oneOf` is satisfied.

Here is the standalone code, formatted, and with a couple of comments highlighting what I think is going wrong:

```js
"use strict";
module.exports = validate20;
module.exports.default = validate20;
const schema31 = {
    type: "object",
    $ref: "#/$defs/parent",
    oneOf: [
        { type: "object", required: ["propFrom1stOneOf"], properties: { propFrom1stOneOf: true } },
        { type: "object", required: ["propFrom2ndOneOf"], properties: { propFrom2ndOneOf: true } },
    ],
    unevaluatedProperties: false,
    $defs: { parent: { type: "object", properties: { propFromParent: true } } },
};
const schema32 = { type: "object", properties: { propFromParent: true } };
function validate20(
    data,
    {
        instancePath = "",
        parentData,
        parentDataProperty,
        rootData = data,
        dynamicAnchors = {},
    } = {},
) {
    let vErrors = null;
    let errors = 0;
    const evaluated0 = validate20.evaluated;
    if (evaluated0.dynamicProps) {
        evaluated0.props = undefined;
    }
    if (evaluated0.dynamicItems) {
        evaluated0.items = undefined;
    }
    const _errs0 = errors;
    if (errors === _errs0) {
        if (!(data && typeof data == "object" && !Array.isArray(data))) {
            validate20.errors = [
                {
                    instancePath,
                    schemaPath: "#/$defs/parent/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object",
                },
            ];
            return false;
        }
    }
// ! While evaluating the `$ref` (just the type assertion above, in this minimal example), propFromParent should be noted as an evaluated property.
    var valid0 = _errs0 === errors;
    if (valid0) {
        const _errs3 = errors;
        let valid1 = false;
        let passing0 = null;
        const _errs4 = errors;
        if (errors === _errs4) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
                let missing0;
                if (data.propFrom1stOneOf === undefined && (missing0 = "propFrom1stOneOf")) {
                    const err0 = {
                        instancePath,
                        schemaPath: "#/oneOf/0/required",
                        keyword: "required",
                        params: { missingProperty: missing0 },
                        message: "must have required property '" + missing0 + "'",
                    };
                    if (vErrors === null) {
                        vErrors = [err0];
                    } else {
                        vErrors.push(err0);
                    }
                    errors++;
                }
            } else {
                const err1 = {
                    instancePath,
                    schemaPath: "#/oneOf/0/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object",
                };
                if (vErrors === null) {
                    vErrors = [err1];
                } else {
                    vErrors.push(err1);
                }
                errors++;
            }
        }
        var _valid0 = _errs4 === errors;
        if (_valid0) {
            valid1 = true;
            passing0 = 0;
            var props0 = {};
            props0.propFrom1stOneOf = true;
// ! propFromParent is marked as evaluated here, if and only if the 1st oneOf branch is satisfied.
            props0.propFromParent = true;
        }
        const _errs6 = errors;
        if (errors === _errs6) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
                let missing1;
                if (data.propFrom2ndOneOf === undefined && (missing1 = "propFrom2ndOneOf")) {
                    const err2 = {
                        instancePath,
                        schemaPath: "#/oneOf/1/required",
                        keyword: "required",
                        params: { missingProperty: missing1 },
                        message: "must have required property '" + missing1 + "'",
                    };
                    if (vErrors === null) {
                        vErrors = [err2];
                    } else {
                        vErrors.push(err2);
                    }
                    errors++;
                }
            } else {
                const err3 = {
                    instancePath,
                    schemaPath: "#/oneOf/1/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object",
                };
                if (vErrors === null) {
                    vErrors = [err3];
                } else {
                    vErrors.push(err3);
                }
                errors++;
            }
        }
        var _valid0 = _errs6 === errors;
        if (_valid0 && valid1) {
            valid1 = false;
            passing0 = [passing0, 1];
        } else {
            if (_valid0) {
                valid1 = true;
                passing0 = 1;
                if (props0 !== true) {
                    props0 = props0 || {};
                    props0.propFrom2ndOneOf = true;
                }
            }
        }
        if (!valid1) {
            const err4 = {
                instancePath,
                schemaPath: "#/oneOf",
                keyword: "oneOf",
                params: { passingSchemas: passing0 },
                message: "must match exactly one schema in oneOf",
            };
            if (vErrors === null) {
                vErrors = [err4];
            } else {
                vErrors.push(err4);
            }
            errors++;
            validate20.errors = vErrors;
            return false;
        } else {
            errors = _errs3;
            if (vErrors !== null) {
                if (_errs3) {
                    vErrors.length = _errs3;
                } else {
                    vErrors = null;
                }
            }
        }
    }
    if (errors === 0) {
        if (data && typeof data == "object" && !Array.isArray(data)) {
            if (props0 !== true) {
                for (const key0 in data) {
                    if (!props0 || !props0[key0]) {
                        validate20.errors = [
                            {
                                instancePath,
                                schemaPath: "#/unevaluatedProperties",
                                keyword: "unevaluatedProperties",
                                params: { unevaluatedProperty: key0 },
                                message: "must NOT have unevaluated properties",
                            },
                        ];
                        return false;
                        break;
                    }
                }
            }
        } else {
            validate20.errors = [
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
    validate20.errors = vErrors;
    return errors === 0;
}
validate20.evaluated = { props: true, dynamicProps: false, dynamicItems: false };
```