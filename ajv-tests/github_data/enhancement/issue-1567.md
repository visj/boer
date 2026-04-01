# [1567] Support standaloneCode with JTD parsers/serializers

Is standalone code generation for JTD parsers/serializers supported, and if yes, how?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.0.1
Didn't try, as it is reasonably close, and changelogs do not indicate any related changes.

**JTD**
<!-- Please make it as small as possible to reproduce the issue -->
Example JTD, doesn't really matter.
```json
{
  "ref": "tree",
  "definitions": {
    "tree": {
      "properties": {
        "value": { "type": "int32" }
      },
      "optionalProperties": {
        "left": { "ref": "tree" },
        "right": { "ref": "tree" }
      }
    }
  }
}
```
**Your code**
```js
const Ajv = require('ajv/dist/jtd');
const standaloneCode = require('ajv/dist/standalone').default;
const ajv = new Ajv({ code: { source: true } });

const validator =  ajv.compile(schema);
const parser =     ajv.compileParser(schema);
const serializer = ajv.compileSerializer(schema);

standaloneCode(ajv, validator);  // works
standaloneCode(ajv, parser);     // error
standaloneCode(ajv, serializer); // error
```
> Uncaught Error: moduleCode: function does not have "source" property

**What results did you expect?**
Standalone code being emitted, similar to the `validator`.

**Are you going to resolve the issue?**
I don't think you want someone, who has only looked at the source code of this project for at most half an hour, to mess with code generation. Additionally, it would likely take me days, to catch up on the internals of `ajv`. It looked like most of the foundation was already there (when generating the functions in the first place), and only some code generation meta-data (scope, ...) wasn't added to a `source`-property. If it doesn't already work (maybe i just made a simple mistake), i have hope, that it's not a hard fix, for someone who knows the project.

Thanks in advance :)