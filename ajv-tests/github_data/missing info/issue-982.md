# [982] Ajv doesn't validate 2 schemas properties. 

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

The one that's integrated into Postman.

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```{allErrors: true, logger: console}```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```
{
    "properties": {
        "id": {
            "type": "number"
        },
        "test": {
            "type": "string"
        },
    },
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```
{
        "id": 2,
        "name": "051"
    };
```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```
var Ajv = require('ajv'),
ajv = new Ajv({allErrors: true, logger: console}),
schema = {
    "properties": {
        "id": {
            "type": "number"
        },
        "test": {
            "type": "string"
        },
    },
},
testSchema = {
        "id": 2,
        "name": "051"
    };
var validate = ajv.compile(schema);
test(testSchema);

function test(data) {
  var valid = validate(data);
  console.log(valid)
  if (valid) console.log('Valid!');
  else console.log('Invalid: ' + ajv.errorsText(validate.errors));
}
```


**Validation result, data AFTER validation, error messages**

```
true
"Valid!"

```

**What results did you expect?**
An error should appear that shows that 2 objects are not similar, "test" property is absent on `testSchema` object. 

**Additional details** 
When I add `"required": ["id", "test"]` to `schema` variable - it throws an error: `"Invalid: data should have required property 'test'"`. But if I change type to `'number'` for `'test'` property - it won't validate it. 