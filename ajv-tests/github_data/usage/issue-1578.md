# [1578] Combining Enum with Default breaks

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.12.2

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ useDefaults: true }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    type: "string",
    enum: ["one", "two", "three"],
    default: "two"
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
""
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
const Ajv = require("ajv");

const ajvCompiler = new Ajv({ useDefaults: true });

const testSchema = {
    type: "string",
    enum: ["one", "two", "three"],
    default: "two"
};

const data = "";

const validate = ajvCompiler.compile(testSchema);
console.log(data); // Prints ""
console.log(validate(data)); // Prints false
```

**Validation result, data AFTER validation, error messages**

```

```

**What results did you expect?**
Expected data to be "two" after validation. 

Using the following code produces the expected output:

```javascript
const Ajv = require("ajv");

const ajvCompiler = new Ajv({ useDefaults: true });

const testSchema = {
    type: "string",
    default: "two"
};

const data = "";

const validate = ajvCompiler.compile(testSchema);
console.log(data); // Prints "two"
console.log(validate(data)); // Prints true

```

**Are you going to resolve the issue?**
Not sure I understand this question. 

My main question here is why including an enum with a default causes the validation to fail to substitute. I did some looking online but could not find this brought up. I feel like this use case is not that odd, so I am mostly posting this out of curiosity and naivete than anything. Any help is appreciated! 