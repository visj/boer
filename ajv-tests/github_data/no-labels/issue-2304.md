# [2304] useDefaults option produces incorrect result with different inputs

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports. For other issues please use:
- security vulnerability: https://tidelift.com/security)
- a new feature/improvement: https://ajv.js.org/contributing/#changes
- browser/compatibility issues: https://ajv.js.org/contributing/#compatibility
- JSON-Schema standard: https://ajv.js.org/contributing/#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Ajv Version:8.12.0
**Ajv options object**
const ajv = new Ajv({useDefaults: true, strict: false})
<!-- See https://ajv.js.org/options.html -->

```javascript

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "properties": {
    "foo": {
      "type": "number",
      "default": 5
    },
    "yyy": {
      "type": "array",
      "items": [
        {
          "type": "object",
          "default": {
            "xyz": "testValue",
            "ssms": [
              5
            ]
          },
          "properties": {
            "ssms": {
              "type": "array",
              "items": [
                {
                  "type": "array",
                  "default": [
                    2
                  ]
                },
                {
                  "type": "number"
                },
                {
                  "type": "string",
                  "default": "abcdef"
                }
              ]
            }
          }
        }
      ]
    },
    "bar": {
      "type": "object",
      "default": {
        "abc": "abc-outer"
      },
      "properties": {
        "efg": {
          "type": "number",
          "default": 88
        }
      }
    },
    "prop1": {
      "type": "array",
      "default": [],
      "items": [
        {
          "type": "array",
          "default": [
            5
          ],
          "items": {
            "type": "number"
          }
        }
      ]
    }
  }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
//input for first test case
{
  "foo": 6
}
```
```json
//input for second test case

{
  "foo": 6,
  "yyy":[]
}
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

```javascript
const ajv = new Ajv({useDefaults: true, strict: false})
const validate = ajv.compile(schema)
console.log(JSON.stringify(data))
```

**Validation result, data AFTER validation, error messages**

```
{"foo":6,"bar":{"abc":"abc-outer","efg":88},"prop1":[[5]]}-- Output for first test case
{"foo":6,"yyy":[{"xyz":"testValue","ssms":[5,null,"abcdef"]}],"bar":{"abc":"abc-outer"},"prop1":[]}--output for second test case
```

**What results did you expect?**
{"foo":6,"bar":{"abc":"abc-outer","efg":88},"prop1":[[5]]}-- Output for first test case is fine and works as expected
{"foo":6,"yyy":[{"xyz":"testValue","ssms":[5,null,"abcdef"]}],"bar":{"abc":"abc-outer","efg":88},"prop1":[[5]]} -- This is what i expected for second test case.
The output for first test case is as expected but the output for second test case is not expected. I was expecting 
{"foo":6,"yyy":[{"xyz":"testValue","ssms":[5,null,"abcdef"]}],"bar":{"abc":"abc-outer","efg":88},"prop1":[[5]]}
why does the output for  "bar"  and "prop1"  change when an empty array is provided for a different field (yyy) 
**Are you going to resolve the issue?**
