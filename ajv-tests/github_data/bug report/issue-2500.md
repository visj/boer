# [2500] Unexpected behavior when validating a schema with anyOf between two objects

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?** reproduces for me on latest version

I am seeing that for some reason when having a schema with an anyof between two objects the removeAdditionalProperties does not consider all the possible keys when removing the properties from the object and only looks at the first object in the anyOf

<!-- See https://ajv.js.org/options.html -->

**jsfiddle with the issue reproduced:**
https://jsfiddle.net/x7s85b3t/1/

**Your code**
```javascript
const schema = {
  "properties": {
    "body": {
      "type": "object",
      "properties": {
        "configuration": {
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "differentA": {
                  "type": "string"
                },
                "differentB": {
                  "type": "string"
                }
              },
              "required": [
                "differentA",
                "differentB"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "propA": {
                  "type": "string"
                },
                "propB": {
                  "type": "string"
                }
              },
              "required": [
                "propA",
                "propB"
              ],
              "additionalProperties": false
            }
          ]
        }
      },
      "required": [
        "configuration"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "body"
  ],
  "additionalProperties": true,
  "definitions": {}
}

var json = {
  body:  {
    "configuration": {
        "propA": "1",
        "propB": "2"
    }
    }
};
var ajv = new Ajv({
	allErrors: true,
	removeAdditional: true
});

var result = ajv.validate(schema, json);

console.log('Result: ', result);
console.log('Errors: ', ajv.errors);
console.log('Final Configuration object json: ', JSON.stringify(json.body.configuration));

```

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->


**Validation result, data AFTER validation, error messages**

```
"Errors: ", [{
  dataPath: ".body.configuration",
  keyword: "required",
  message: "should have required property 'differentA'",
  params: {
    missingProperty: "differentA"
  },
  schemaPath: "#/properties/body/properties/configuration/anyOf/0/required"
}, {
  dataPath: ".body.configuration",
  keyword: "required",
  message: "should have required property 'differentB'",
  params: {
    missingProperty: "differentB"
  },
  schemaPath: "#/properties/body/properties/configuration/anyOf/0/required"
}, {
  dataPath: ".body.configuration",
  keyword: "required",
  message: "should have required property 'propA'",
  params: {
    missingProperty: "propA"
  },
  schemaPath: "#/properties/body/properties/configuration/anyOf/1/required"
}, {
  dataPath: ".body.configuration",
  keyword: "required",
  message: "should have required property 'propB'",
  params: {
    missingProperty: "propB"
  },
  schemaPath: "#/properties/body/properties/configuration/anyOf/1/required"
}, {
  dataPath: ".body.configuration",
  keyword: "anyOf",
  message: "should match some schema in anyOf",
  params: { ... },
  schemaPath: "#/properties/body/properties/configuration/anyOf"
}]
"Final Configuration object json: ", "{}"

```

**What results did you expect?**
I expected that the remove additional properties will take all the possible object keys into consideration and not only the first one, so I am able to have a schema that allows any of the objects inside the anyof where in reality it fails for the second object
