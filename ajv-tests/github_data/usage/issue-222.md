# [222] Strange crash: TypeError: $deps.join is not a function

I wanted to integrate Ajv into our Node.js project, which consists of a restify server, a MySQL database connection, etc.

However, the app kept crashing when calling `ajv.compile()`. With the following stack trace:

```
/test/node_modules/ajv/lib/dotjs/dependencies.js:54
        out += ' { keyword: \'' + ($errorKeyword || 'dependencies') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: "' + ($errSchemaPath) + '" , params: { property: \'' + (it.util.escapeQuotes($property)) + '\', missingProperty: \'' + ($missingProperty) + '\', depsCount: ' + ($deps.length) + ', deps: \'' + (it.util.escapeQuotes($deps.length == 1 ? $deps[0] : $deps.join(", "))) + '\' } ';
                                                                                                                                                                                                                                                                                                                                                                                                           ^

TypeError: $deps.join is not a function
    at Object.generate_dependencies [as code] (/test/node_modules/ajv/lib/dotjs/dependencies.js:54:396)
    at generate_validate (/test/node_modules/ajv/lib/dotjs/validate.js:374:37)
    at localCompile (/test/node_modules/ajv/lib/compile/index.js:53:22)
    at Ajv.compile (/test/node_modules/ajv/lib/compile/index.js:42:10)
    at _compile (/test/node_modules/ajv/lib/ajv.js:295:29)
    at getSchema (/test/node_modules/ajv/lib/ajv.js:185:51)
    at getSchema (/test/node_modules/ajv/lib/ajv.js:186:29)
    at validate (/test/node_modules/ajv/lib/ajv.js:85:11)
    at validateSchema (/test/node_modules/ajv/lib/ajv.js:155:17)
    at _addSchema (/test/node_modules/ajv/lib/ajv.js:258:7)
```

By accident I discovered the reason. Someone had but the following code at the very start of our application. I have no idea what it is supposed to do, but it has been there like forever. Apparently some debugging ID.

``` js
// Add unique object ID for debugging
(function() {
    if ( typeof Object.prototype.uniqueId === "undefined" ) {
        var id = 0;
        Object.prototype.uniqueId = function() {
            if ( typeof this.__uniqueid === "undefined" ) {
                this.__uniqueid = ++id;
            }
            return this.__uniqueid;
        };
    }
})();
```

If I remove this code everything works fine. Based on this I created a sample to reproduce the crash. I am using Node.js 6.2.2 and Ajv 4.1.5.

``` js
"use strict";

const Ajv = require("ajv");

// Add unique object ID for debugging
(function() {
    if ( typeof Object.prototype.uniqueId === "undefined" ) {
        var id = 0;
        Object.prototype.uniqueId = function() {
            if ( typeof this.__uniqueid === "undefined" ) {
                this.__uniqueid = ++id;
            }
            return this.__uniqueid;
        };
    }
})();


const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
const validate = ajv.compile({
    $schema: "http://json-schema.org/schema#",
    title: "My Title",
    description: "My Description",
    type: "object",
    required: ["id"],

    properties: {
        station: {
            type: "number",
            description: "Object identifier",
            minimum: 1,
            multipleOf: 1
        }
    }
});
```
