# [1837] Error when validating with standalone/precompiled function

I'd like to precompile my validation functions, and also use some custom formatters but am getting errors when doing so. I've created a project here to illustrate the issue: https://github.com/lance/ajv-test

My schema in `schema/schema.json` is simple. There is a single `time` field with a custom format of `js-date-time`. The format validation code is in `schema/formats.js`.

I generate the validation function with the command

```
ajv compile -c ./schema/formats.js -s ./schema/schema.json -o ./schema/validate.js
```

This can also be run via `npm run build` for convenience, outputting a nicely formatted JS file.

The code that uses this validation function is in `app.js` and simply attempts to validate an object with what should be a valid value. When I call `validate()`, however, I get an error.

```
TypeError: formats0 is not a function
```

If you look at the prettified JavaScript generated for the validation function, it's easy to see that, in fact, `formats0` is not a function.

```
const formats0 = {
  _items: ['require("ajv-formats/dist/formats").', { str: "fullFormats" }, ""],
}["js-date-time"];
```

I'm not sure what I am doing wrong here. Any guidance is appreciated.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.8.2 - the latest as of this writing

**Ajv options object**

Called from the CLI with the following options

```
ajv compile -c ./schema/formats.js -s ./schema/schema.json
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$ref": "#/definitions/event",
  "definitions": {
    "event": {
      "properties": {
        "time": {
          "$ref": "#/definitions/time"
        }
      },
      "type": "object"
    },
    "time": {
      "format": "js-date-time",
      "type": "string"
    }
  },
  "type": "object"
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```js
{ time: new Date().toString() }
```

**Your code**

Please see this simplified test project: https://github.com/lance/ajv-test

**Validation result, data AFTER validation, error messages**

```
> node app.js

/home/lanceball/src/github.com/lance/ajv-test/schema/validate.js:37
              if (!formats0(data0)) {
                   ^

TypeError: formats0 is not a function
    at validate21 (/home/lanceball/src/github.com/lance/ajv-test/schema/validate.js:37:20)
    at validate20 (/home/lanceball/src/github.com/lance/ajv-test/schema/validate.js:99:6)
    at Object.<anonymous> (/home/lanceball/src/github.com/lance/ajv-test/app.js:3:6)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:79:12)
    at node:internal/main/run_main_module:17:47
```

**What results did you expect?**

Successful validation of the test object.

**Are you going to resolve the issue?**

If you tell me how! :)
