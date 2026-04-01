# [2209] Unable to generate ESM-compatible standalone code

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://ajv.js.org/contributing/
-->

**The version of Ajv you are using**
8.12

**The environment you have the problem with**
node v16.16.0, ESM project (`{type: module}`)

**Your code (please make it as small as possible to reproduce the issue)**

Code to compile AJV schema:

```
// compile.js

import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone/index.js";
import { writeFile } from "fs/promises";

const ajvOptions = {
    strict: true,
    allErrors: true,
    messages: true,
    code: {
        source: true,
        esm: true, // ESM support
    },
};

const ajv = new Ajv(ajvOptions);

const exampleSchema = {
    type: "object",
    properties: {
        body: {
            type: "object",
            properties: {
                firstName: {
                    type: "string",
                    minLength: 1,
                },
                lastName: {
                    type: "string",
                },
            },
            required: ["firstName", "lastName"],
            additionalProperties: false,
        },
    },
};

compileJsonSchema(exampleSchema);

// Note: excluded code that runs this function
async function compileJsonSchema(schema) {
    try {
        // Compile schema via AJV
        const compiled = ajv.compile(schema);

        // Build output module file content via AJV's standalone
        let moduleCode = standaloneCode(ajv, compiled);

        // Write file to parent directory of source file
        await writeFile("./schema.js", moduleCode, "utf-8");
    } catch (err) {
        console.error(err);
    }
}
```

**Results in node.js v8+**
Able to successfully compile standalone code; unable to import in ESM project

**Results and error messages in your platform**

I am using the [standalone validation code](https://ajv.js.org/standalone.html#using-the-defaults-es6-and-cjs-exports) functionality to generate compiled schema files at build time. I am compiling the code with the AJV library in a JS script and specifying `esm: true` to compile the standalone code for ESM. The compilation works and I am writing the compiled schema to a JS file, but I am unable to import the standalone code from this schema file in my ESM project because it imports the `ucs2length` utility via a `require` statement (`const func2 = require("ajv/dist/runtime/ucs2length").default`). 

Here is an example schema compiled via standalone for ESM support (generated with the above script:

```
"use strict";export const validate = validate10;export default validate10;const schema11 = {"type":"object","properties":{"body":{"type":"object","properties":{"firstName":{"type":"string","minLength":1},"lastName":{"type":"string"}},"required":["firstName","lastName"],"additionalProperties":false}}};const func2 = require("ajv/dist/runtime/ucs2length").default;function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(data && typeof data == "object" && !Array.isArray(data)){if(data.body !== undefined){let data0 = data.body;if(data0 && typeof data0 == "object" && !Array.isArray(data0)){if(data0.firstName === undefined){const err0 = {instancePath:instancePath+"/body",schemaPath:"#/properties/body/required",keyword:"required",params:{missingProperty: "firstName"},message:"must have required property '"+"firstName"+"'"};if(vErrors === null){vErrors = [err0];}else {vErrors.push(err0);}errors++;}if(data0.lastName === undefined){const err1 = {instancePath:instancePath+"/body",schemaPath:"#/properties/body/required",keyword:"required",params:{missingProperty: "lastName"},message:"must have required property '"+"lastName"+"'"};if(vErrors === null){vErrors = [err1];}else {vErrors.push(err1);}errors++;}for(const key0 in data0){if(!((key0 === "firstName") || (key0 === "lastName"))){const err2 = {instancePath:instancePath+"/body",schemaPath:"#/properties/body/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};if(vErrors === null){vErrors = [err2];}else {vErrors.push(err2);}errors++;}}if(data0.firstName !== undefined){let data1 = data0.firstName;if(typeof data1 === "string"){if(func2(data1) < 1){const err3 = {instancePath:instancePath+"/body/firstName",schemaPath:"#/properties/body/properties/firstName/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};if(vErrors === null){vErrors = [err3];}else {vErrors.push(err3);}errors++;}}else {const err4 = {instancePath:instancePath+"/body/firstName",schemaPath:"#/properties/body/properties/firstName/type",keyword:"type",params:{type: "string"},message:"must be string"};if(vErrors === null){vErrors = [err4];}else {vErrors.push(err4);}errors++;}}if(data0.lastName !== undefined){if(typeof data0.lastName !== "string"){const err5 = {instancePath:instancePath+"/body/lastName",schemaPath:"#/properties/body/properties/lastName/type",keyword:"type",params:{type: "string"},message:"must be string"};if(vErrors === null){vErrors = [err5];}else {vErrors.push(err5);}errors++;}}}else {const err6 = {instancePath:instancePath+"/body",schemaPath:"#/properties/body/type",keyword:"type",params:{type: "object"},message:"must be object"};if(vErrors === null){vErrors = [err6];}else {vErrors.push(err6);}errors++;}}}else {const err7 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};if(vErrors === null){vErrors = [err7];}else {vErrors.push(err7);}errors++;}validate10.errors = vErrors;return errors === 0;}
```

I'm able to import and use the schema file by manually replacing the `require` with an `import` statement. Am I overlooking something to generate standalone validation code that is fully ESM-compatible?

