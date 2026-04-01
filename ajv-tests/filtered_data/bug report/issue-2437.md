# [2437] Referencing errors in complex schemas

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.12, haven't tested with older versions

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
const roomSchema = {
  $id: 'room.json',
  type: 'object',
  properties: {
    name: {
      type: 'string'
    }
  }
};

const houseSchema = {
  $id: 'base/house.json',
  type: 'object',
  properties: {
    rooms: {
      type: 'array',
      items: {
        $ref: 'room.json'
      }
    }
  }
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

https://runkit.com/codan84/ajv-refs/1.0.0
https://runkit.com/codan84/ajv-refs/1.1.0

```
var validate = ajv
  .addSchema(roomSchema, 'room.json')
  .compile(houseSchema)

console.log(validate(data));
```

**Validation result, data AFTER validation, error messages**

```
MissingRefError: can't resolve reference room.json from id base/house.json
```

**What results did you expect?**

I didn't expect reference error. I provided IDs that I believe to be fine. Neither full URIs (v1.1.0) nor paths (v1.0.0) seem to work.

**Are you going to resolve the issue?**

No? Asking for advise as to how to get these refs to work.
