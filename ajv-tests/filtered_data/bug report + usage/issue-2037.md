# [2037] Test keeps failing for an AJV-based middleware

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

8.11.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```
{ allowDate: true }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "customer.schema.json",
  "title":"Customer",
  "description": "A new customer signing up",
  "type":"object",
  "$async": true,
  "properties": {
    "organisation": {
      "description":"The organisation name signing up",
      "type": "string"
    },
    "firstName": {
      "description":"First name of the initial user",
      "type":"string" 
    },
    "lastName": {
      "description":"Last name of the initial user",
      "type":"string" 
    },
    "email": {
      "description":"Email address of the initial user",
      "type":"string",
      "format":"email"
    },
    "password":{
      "description":"Password of the initial user",
      "type":"string",
      "format":"password"
    }
  },
  "required": ["organisation","firstName","lastName","email"]
}

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{}
```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->
I am running the following Jest test 
```javascript
  it("should fail with an error when submitting invalid data", () => {
    const middleware = createValidationMiddleware("customer.schema.json");
    expect(() => middleware({})).toThrow(HttpsError);
  });
```

The AJV-based middleware is meant to be used with Firebase Functions, hence the HttpsError:
```
export const createValidationMiddleware: (schema: Schemas) => Middleware =
  (schema) => (data, context, next) => {
    const validate = ajv.getSchema(schema);

    if (!validate)
      throw new HttpsError(
        "failed-precondition",
        `schema ${schema} does not exist`
      );

    if (!validate(data))
      throw new HttpsError(
        "invalid-argument",
        `The data is invalid: ${validate.errors}`
      );

    return next(data, context);
  };
```

**Validation result, data AFTER validation, error messages**

The test keeps showing the following error multiple times:

``` 
undefined:3
const Error0 = scope.Error[0];const schema31 = scope.schema[15];const formats0 = scope.formats[0];return async function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){let vErrors = null;let errors = 0;const evaluated0 = validate20.evaluated;if(evaluated0.dynamicProps){evaluated0.props = undefined;}if(evaluated0.dynamicItems){evaluated0.items = undefined;}if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if(((((data.organisation === undefined) && (missing0 = "organisation")) || ((data.firstName === undefined) && (missing0 = "firstName"))) || ((data.lastName === undefined) && (missing0 = "lastName"))) || ((data.email === undefined) && (missing0 = "email"))){throw new Error0([{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}]);}else {if(data.organisation !== undefined){const _errs1 = errors;if(typeof data.organisation !== "string"){throw new Error0([{instancePath:instancePath+"/organisation",schemaPath:"#/properties/organisation/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}var valid0 = _errs1 === errors;}else {var valid0 = true;}if(valid0){if(data.firstName !== undefined){const _errs3 = errors;if(typeof data.firstName !== "string"){throw new Error0([{instancePath:instancePath+"/firstName",schemaPath:"#/properties/firstName/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}var valid0 = _errs3 === errors;}else {var valid0 = true;}if(valid0){if(data.lastName !== undefined){const _errs5 = errors;if(typeof data.lastName !== "string"){throw new Error0([{instancePath:instancePath+"/lastName",schemaPath:"#/properties/lastName/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}var valid0 = _errs5 === errors;}else {var valid0 = true;}if(valid0){if(data.email !== undefined){let data3 = data.email;const _errs7 = errors;if(errors === _errs7){if(errors === _errs7){if(typeof data3 === "string"){if(!(formats0.test(data3))){throw new Error0([{instancePath:instancePath+"/email",schemaPath:"#/properties/email/format",keyword:"format",params:{format: "email"},message:"must match format \""+"email"+"\""}]);}}else {throw new Error0([{instancePath:instancePath+"/email",schemaPath:"#/properties/email/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}}}var valid0 = _errs7 === errors;}else {var valid0 = true;}if(valid0){if(data.password !== undefined){const _errs9 = errors;if(errors === _errs9){if(errors === _errs9){if(!(typeof data.password === "string")){throw new Error0([{instancePath:instancePath+"/password",schemaPath:"#/properties/password/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}}}var valid0 = _errs9 === errors;}else {var valid0 = true;}}}}}}}else {throw new Error0([{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}]);}}if(errors === 0){return data;}else {throw new Error0(vErrors);}}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ^

ValidationError: validation failed
    at validate20 (eval at compileSchema (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/ajv/lib/compile/index.ts:171:26), <anonymous>:3:769)
    at /home/thomaskuhlmann/Projects/app/packages/functions/src/middlewares/validation.ts:23:10
    at /home/thomaskuhlmann/Projects/app/packages/functions/src/middlewares/validation.test.ts:20:20
    at Object.<anonymous> (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/expect/build/toThrowMatchers.js:83:11)
    at Object.throwingMatcher [as toThrow] (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/expect/build/index.js:342:21)
    at Object.<anonymous> (/home/thomaskuhlmann/Projects/app/packages/functions/src/middlewares/validation.test.ts:20:36)
    at Promise.then.completed (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/jest-circus/build/utils.js:333:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/jest-circus/build/utils.js:259:10)
    at _callCircusTest (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/jest-circus/build/run.js:277:40) {
  errors: [
    {
      instancePath: '',
      schemaPath: '#/required',
      keyword: 'required',
      params: { missingProperty: 'organisation' },
      message: "must have required property 'organisation'"
    }
  ],
  validation: true,
  ajv: true
}
undefined:3
const Error0 = scope.Error[0];const schema31 = scope.schema[15];const formats0 = scope.formats[0];return async function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){let vErrors = null;let errors = 0;const evaluated0 = validate20.evaluated;if(evaluated0.dynamicProps){evaluated0.props = undefined;}if(evaluated0.dynamicItems){evaluated0.items = undefined;}if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if(((((data.organisation === undefined) && (missing0 = "organisation")) || ((data.firstName === undefined) && (missing0 = "firstName"))) || ((data.lastName === undefined) && (missing0 = "lastName"))) || ((data.email === undefined) && (missing0 = "email"))){throw new Error0([{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}]);}else {if(data.organisation !== undefined){const _errs1 = errors;if(typeof data.organisation !== "string"){throw new Error0([{instancePath:instancePath+"/organisation",schemaPath:"#/properties/organisation/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}var valid0 = _errs1 === errors;}else {var valid0 = true;}if(valid0){if(data.firstName !== undefined){const _errs3 = errors;if(typeof data.firstName !== "string"){throw new Error0([{instancePath:instancePath+"/firstName",schemaPath:"#/properties/firstName/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}var valid0 = _errs3 === errors;}else {var valid0 = true;}if(valid0){if(data.lastName !== undefined){const _errs5 = errors;if(typeof data.lastName !== "string"){throw new Error0([{instancePath:instancePath+"/lastName",schemaPath:"#/properties/lastName/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}var valid0 = _errs5 === errors;}else {var valid0 = true;}if(valid0){if(data.email !== undefined){let data3 = data.email;const _errs7 = errors;if(errors === _errs7){if(errors === _errs7){if(typeof data3 === "string"){if(!(formats0.test(data3))){throw new Error0([{instancePath:instancePath+"/email",schemaPath:"#/properties/email/format",keyword:"format",params:{format: "email"},message:"must match format \""+"email"+"\""}]);}}else {throw new Error0([{instancePath:instancePath+"/email",schemaPath:"#/properties/email/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}}}var valid0 = _errs7 === errors;}else {var valid0 = true;}if(valid0){if(data.password !== undefined){const _errs9 = errors;if(errors === _errs9){if(errors === _errs9){if(!(typeof data.password === "string")){throw new Error0([{instancePath:instancePath+"/password",schemaPath:"#/properties/password/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}}}var valid0 = _errs9 === errors;}else {var valid0 = true;}}}}}}}else {throw new Error0([{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}]);}}if(errors === 0){return data;}else {throw new Error0(vErrors);}}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ^

ValidationError: validation failed
    at validate20 (eval at compileSchema (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/ajv/lib/compile/index.ts:171:26), <anonymous>:3:769)
    at /home/thomaskuhlmann/Projects/app/packages/functions/src/middlewares/validation.ts:23:10
    at /home/thomaskuhlmann/Projects/app/packages/functions/src/middlewares/validation.test.ts:20:20
    at Object.<anonymous> (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/expect/build/toThrowMatchers.js:83:11)
    at Object.throwingMatcher [as toThrow] (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/expect/build/index.js:342:21)
    at Object.<anonymous> (/home/thomaskuhlmann/Projects/app/packages/functions/src/middlewares/validation.test.ts:20:36)
    at Promise.then.completed (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/jest-circus/build/utils.js:333:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/jest-circus/build/utils.js:259:10)
    at _callCircusTest (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/jest-circus/build/run.js:277:40) {
  errors: [
    {
      instancePath: '',
      schemaPath: '#/required',
      keyword: 'required',
      params: { missingProperty: 'organisation' },
      message: "must have required property 'organisation'"
    }
  ],
  validation: true,
  ajv: true
}
undefined:3
const Error0 = scope.Error[0];const schema31 = scope.schema[15];const formats0 = scope.formats[0];return async function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){let vErrors = null;let errors = 0;const evaluated0 = validate20.evaluated;if(evaluated0.dynamicProps){evaluated0.props = undefined;}if(evaluated0.dynamicItems){evaluated0.items = undefined;}if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if(((((data.organisation === undefined) && (missing0 = "organisation")) || ((data.firstName === undefined) && (missing0 = "firstName"))) || ((data.lastName === undefined) && (missing0 = "lastName"))) || ((data.email === undefined) && (missing0 = "email"))){throw new Error0([{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}]);}else {if(data.organisation !== undefined){const _errs1 = errors;if(typeof data.organisation !== "string"){throw new Error0([{instancePath:instancePath+"/organisation",schemaPath:"#/properties/organisation/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}var valid0 = _errs1 === errors;}else {var valid0 = true;}if(valid0){if(data.firstName !== undefined){const _errs3 = errors;if(typeof data.firstName !== "string"){throw new Error0([{instancePath:instancePath+"/firstName",schemaPath:"#/properties/firstName/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}var valid0 = _errs3 === errors;}else {var valid0 = true;}if(valid0){if(data.lastName !== undefined){const _errs5 = errors;if(typeof data.lastName !== "string"){throw new Error0([{instancePath:instancePath+"/lastName",schemaPath:"#/properties/lastName/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}var valid0 = _errs5 === errors;}else {var valid0 = true;}if(valid0){if(data.email !== undefined){let data3 = data.email;const _errs7 = errors;if(errors === _errs7){if(errors === _errs7){if(typeof data3 === "string"){if(!(formats0.test(data3))){throw new Error0([{instancePath:instancePath+"/email",schemaPath:"#/properties/email/format",keyword:"format",params:{format: "email"},message:"must match format \""+"email"+"\""}]);}}else {throw new Error0([{instancePath:instancePath+"/email",schemaPath:"#/properties/email/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}}}var valid0 = _errs7 === errors;}else {var valid0 = true;}if(valid0){if(data.password !== undefined){const _errs9 = errors;if(errors === _errs9){if(errors === _errs9){if(!(typeof data.password === "string")){throw new Error0([{instancePath:instancePath+"/password",schemaPath:"#/properties/password/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}}}var valid0 = _errs9 === errors;}else {var valid0 = true;}}}}}}}else {throw new Error0([{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}]);}}if(errors === 0){return data;}else {throw new Error0(vErrors);}}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ^

ValidationError: validation failed
    at validate20 (eval at compileSchema (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/ajv/lib/compile/index.ts:171:26), <anonymous>:3:769)
    at /home/thomaskuhlmann/Projects/app/packages/functions/src/middlewares/validation.ts:23:10
    at /home/thomaskuhlmann/Projects/app/packages/functions/src/middlewares/validation.test.ts:20:20
    at Object.<anonymous> (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/expect/build/toThrowMatchers.js:83:11)
    at Object.throwingMatcher [as toThrow] (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/expect/build/index.js:342:21)
    at Object.<anonymous> (/home/thomaskuhlmann/Projects/app/packages/functions/src/middlewares/validation.test.ts:20:36)
    at Promise.then.completed (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/jest-circus/build/utils.js:333:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/jest-circus/build/utils.js:259:10)
    at _callCircusTest (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/jest-circus/build/run.js:277:40) {
  errors: [
    {
      instancePath: '',
      schemaPath: '#/required',
      keyword: 'required',
      params: { missingProperty: 'organisation' },
      message: "must have required property 'organisation'"
    }
  ],
  validation: true,
  ajv: true
}
undefined:3
const Error0 = scope.Error[0];const schema31 = scope.schema[15];const formats0 = scope.formats[0];return async function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){let vErrors = null;let errors = 0;const evaluated0 = validate20.evaluated;if(evaluated0.dynamicProps){evaluated0.props = undefined;}if(evaluated0.dynamicItems){evaluated0.items = undefined;}if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if(((((data.organisation === undefined) && (missing0 = "organisation")) || ((data.firstName === undefined) && (missing0 = "firstName"))) || ((data.lastName === undefined) && (missing0 = "lastName"))) || ((data.email === undefined) && (missing0 = "email"))){throw new Error0([{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}]);}else {if(data.organisation !== undefined){const _errs1 = errors;if(typeof data.organisation !== "string"){throw new Error0([{instancePath:instancePath+"/organisation",schemaPath:"#/properties/organisation/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}var valid0 = _errs1 === errors;}else {var valid0 = true;}if(valid0){if(data.firstName !== undefined){const _errs3 = errors;if(typeof data.firstName !== "string"){throw new Error0([{instancePath:instancePath+"/firstName",schemaPath:"#/properties/firstName/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}var valid0 = _errs3 === errors;}else {var valid0 = true;}if(valid0){if(data.lastName !== undefined){const _errs5 = errors;if(typeof data.lastName !== "string"){throw new Error0([{instancePath:instancePath+"/lastName",schemaPath:"#/properties/lastName/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}var valid0 = _errs5 === errors;}else {var valid0 = true;}if(valid0){if(data.email !== undefined){let data3 = data.email;const _errs7 = errors;if(errors === _errs7){if(errors === _errs7){if(typeof data3 === "string"){if(!(formats0.test(data3))){throw new Error0([{instancePath:instancePath+"/email",schemaPath:"#/properties/email/format",keyword:"format",params:{format: "email"},message:"must match format \""+"email"+"\""}]);}}else {throw new Error0([{instancePath:instancePath+"/email",schemaPath:"#/properties/email/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}}}var valid0 = _errs7 === errors;}else {var valid0 = true;}if(valid0){if(data.password !== undefined){const _errs9 = errors;if(errors === _errs9){if(errors === _errs9){if(!(typeof data.password === "string")){throw new Error0([{instancePath:instancePath+"/password",schemaPath:"#/properties/password/type",keyword:"type",params:{type: "string"},message:"must be string"}]);}}}var valid0 = _errs9 === errors;}else {var valid0 = true;}}}}}}}else {throw new Error0([{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}]);}}if(errors === 0){return data;}else {throw new Error0(vErrors);}}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ^

ValidationError: validation failed
    at validate20 (eval at compileSchema (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/ajv/lib/compile/index.ts:171:26), <anonymous>:3:769)
    at /home/thomaskuhlmann/Projects/app/packages/functions/src/middlewares/validation.ts:23:10
    at /home/thomaskuhlmann/Projects/app/packages/functions/src/middlewares/validation.test.ts:20:20
    at Object.<anonymous> (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/expect/build/toThrowMatchers.js:83:11)
    at Object.throwingMatcher [as toThrow] (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/expect/build/index.js:342:21)
    at Object.<anonymous> (/home/thomaskuhlmann/Projects/app/packages/functions/src/middlewares/validation.test.ts:20:36)
    at Promise.then.completed (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/jest-circus/build/utils.js:333:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/jest-circus/build/utils.js:259:10)
    at _callCircusTest (/home/thomaskuhlmann/Projects/app/packages/functions/node_modules/jest-circus/build/run.js:277:40) {
  errors: [
    {
      instancePath: '',
      schemaPath: '#/required',
      keyword: 'required',
      params: { missingProperty: 'organisation' },
      message: "must have required property 'organisation'"
    }
  ],
  validation: true,
  ajv: true
}
```

and finally fails with:

```
FAIL  src/middlewares/validation.test.ts
  ● Test suite failed to run

    Jest worker encountered 4 child process exceptions, exceeding retry limit

      at ChildProcessWorker.initialize (node_modules/jest-worker/build/workers/ChildProcessWorker.js:170:21)
```

**What results did you expect?**
The test to pass


**Are you going to resolve the issue?**
I tried, but I have been stuck on this for days. I am not sure if this is an AJV or Jest issue, or maybe I am just doing something wrong. If someone has previously created a functional test for an AJV-based middleware, I'd be grateful for some pointers!