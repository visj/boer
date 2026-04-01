# [2176] Only receiving single error when using "Standalone validation code" in AJV ?

I have used compiled time schema as per https://ajv.js.org/standalone.html.

const compiledSchema = require('src/assets/json/validate_schema.js');
const valid = compiledSchema(catalogObj);
console.log("compiledSchema.errors:", compiledSchema.errors) 

I am receiving only first error only. How to get all errors when using compiled schema ? 