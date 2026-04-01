# [2531] Apparent dynamic imports from ajv/dist/runtime in vendor.js build from Angular 18 using latest 8.17.1

I am using latest version of AJV in an Angular 18 project. I have a single file that imports the AJV libary, sets up its options and uses it to validate my app's JSON. I can provide more implementation details if needed.

Anyway, I'm not specifically referencing any ajv/dist/runtime modules but when I build my project, I'm seeing 4 different ones referenced as what appear to be dynamic includes in the vendor.js file.

This is preventing my exported web component from running in Salesforce.com as a LWC due to the apparent use of dynamic imports:

Here are the references from vendor.js:

`code: e._'require("ajv/dist/runtime/validation_error").default' }));`
`e.code = 'require("ajv/dist/runtime/equal").default',`
`s.code = 'require("ajv/dist/runtime/ucs2length").default'`
`e.code = 'require("ajv/dist/runtime/uri").default',`

Is there a flag I can pass in the options to prevent this or perhaps another workaround?