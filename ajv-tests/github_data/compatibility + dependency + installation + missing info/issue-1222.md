# [1222] Getting error related to uglify while building the application when I add ajv.addSchema in code

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.x

AJV version: 6.10.x;

UglifyJS version: uglifyjs-webpack-plugin = 1.3.x;

in tsconfig.json: "target": "es5",

in package.json: "react-scripts": "1.0.17

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript
allErrors: true,
jsonPointers: true,
$data: true,
format: 'full',
addUsedSchema: false

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```

{}
I can say whatever schema I try to add, even an {} as well.
In general schema is quite big to post here, but it has,
{
"$id", "title", "description", "type", "properties", 
"oneOf", "anyRequired", "allOf" tags and allOf has if then else condition.
```


**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
Did not reach to the part of validating data.

```


**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
export function addSchema(schema: Object) {
    if (!_.isNil(ajv.getSchema(schema['$id']))) {
        return;
    }
    return ajv.addSchema(schema);
}

Calling addSchema function in code results in build failure with below error.

```


**Validation result, data AFTER validation, error messages**

```
[22:59:06] 'webpack-prod' errored after 35 s
[22:59:06] Error: app.cb4d661d3807c23d1b05.js from UglifyJs
Unexpected token: name (e) [./node_modules/uri-js/dist/esnext/uri.js:42,0][app.cb4d661d3807c23d1b05.js:2172,8]
    at /local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/webpack/node_modules/uglifyjs-webpack-plugin/dist/index.js:233:34
    at Array.forEach (<anonymous>)
    at Compilation.<anonymous> (/local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/webpack/node_modules/uglifyjs-webpack-plugin/dist/index.js:54:20)
    at Compilation.applyPluginsAsyncSeries (/local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/webpack/node_modules/tapable/lib/Tapable.js:206:13)
    at /local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/webpack/lib/Compilation.js:664:10
    at next (/local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/webpack/node_modules/tapable/lib/Tapable.js:202:11)
    at Compilation.<anonymous> (/local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/extract-text-webpack-plugin/dist/index.js:275:11)
    at Compilation.applyPluginsAsyncSeries (/local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/webpack/node_modules/tapable/lib/Tapable.js:206:13)
    at sealPart2 (/local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/webpack/lib/Compilation.js:660:9)
    at next (/local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/webpack/node_modules/tapable/lib/Tapable.js:202:11)
    at /local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/extract-text-webpack-plugin/dist/index.js:244:13
    at /local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/async/dist/async.js:421:16
    at iteratorCallback (/local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/async/dist/async.js:998:13)
    at /local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/async/dist/async.js:906:16
    at /local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/extract-text-webpack-plugin/dist/index.js:227:15
    at /local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/async/dist/async.js:421:16
    at iteratorCallback (/local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/async/dist/async.js:998:13)
    at /local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/async/dist/async.js:906:16
    at /local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/extract-text-webpack-plugin/dist/index.js:216:21
    at /local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/webpack/lib/Compilation.js:528:29
    at Array.forEach (<anonymous>)
    at callback (/local/home/dedhiaa/workplace/AWSYachtUI/src/AWSYachtUI/node_modules/webpack/lib/Compilation.js:528:15)

```

**What results did you expect?**
Successful build without any uglify error.

**Are you going to resolve the issue?**
nope.