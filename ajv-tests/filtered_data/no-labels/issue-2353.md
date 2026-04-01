# [2353] Weird behavior regarding validation on "multipleOf" 

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
I have been trying with both 6.10.1 and 8.12.0 so far. Both of them have the same behavior regarding validation on properties that have "multipleOf" defined.

The problem is the validation falls on property value of "0.3" and "0.7" if "multipleOf" is defined as "0.1" for a property. It doesn't make sense to me. But I couldn't find out what I did wrong. Other values like "0.2", "0.4", etc... are fine.

**Ajv options object**
I have tried the following: 


<!-- See https://ajv.js.org/options.html -->

```javascript
const ajv = new AJV();

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```
{
  "type": "object",
  "properties": {
    "myProperty": {
      "type": "number",
      "multipleOf": 0.1
    }
  }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```
{
  "myProperty": 0.3
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

```

const AJV = require('ajv');
const fs = require('fs');
const path = require('path');

// Initialize AJV
const ajv = new AJV();

// Function to load JSON file
function loadJSONFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    const data = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading file from disk: ${err}`);
    return null;
  }
}

// Validate inputs
if (process.argv.length !== 4) {
  console.log('Usage: node validate.js <schema_file> <data_file>');
  process.exit(1);
}

// Load schema and data from provided file paths
const [,, schemaFilePath, dataFilePath] = process.argv;

const schema = loadJSONFile(schemaFilePath);
const data = loadJSONFile(dataFilePath);

if (!schema || !data) {
  process.exit(1); // Exit if schema or data failed to load
}

// Compile the schema using AJV
const validate = ajv.compile(schema);

// Perform the validation
const valid = validate(data);


if (valid) {
  console.log('Validation successful!');
} else {
  console.log('Validation failed:');
  console.log(validate.errors);
}

```

**Validation result, data AFTER validation, error messages**

```
Validation failed:
[
  {
    instancePath: '/myProperty',
    schemaPath: '#/properties/myProperty/multipleOf',
    keyword: 'multipleOf',
    params: { multipleOf: 0.1 },
    message: 'must be multiple of 0.1'
  }
]


```

**What results did you expect?**
Validation successful!

**Are you going to resolve the issue?**
